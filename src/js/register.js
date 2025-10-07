// ==================================================================
// 1. Imports
// ==================================================================
import { API_BASE_URL } from './config.js';

// ==================================================================
// 2. Helper Functions
// ==================================================================

/** Toggles password visibility in an input field. */
function togglePassword(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    toggle?.addEventListener("click", () => {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        toggle.src = isPassword ? "../assets/show.png" : "../assets/hide.png";
        toggle.alt = isPassword ? "Show Password" : "Hide Password";
    });
}

/** Displays a custom alert modal with a message. */
function showAlert(message) {
    document.getElementById("alertMessage").textContent = message;
    openModal("customAlert");
}

/** Opens a modal by its ID with animation. */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const modalBox = modal.querySelector('div[id$="ModalBox"]');
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (modalBox) {
            modalBox.classList.remove('opacity-0', 'scale-95');
        }
    }, 10);
}

/** Closes a modal by its ID with animation. */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const modalBox = modal.querySelector('div[id$="ModalBox"]');
    
    modal.classList.add('opacity-0');
    if (modalBox) {
        modalBox.classList.add('opacity-0', 'scale-95');
    }

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}


// ==================================================================
// 3. Main Application Logic
// ==================================================================

/** Initializes the entire application after the DOM is ready and modals are loaded. */
function initializeApp() {
    
    // --- Element Selections ---
    const registerView = document.getElementById('registerView');
    const otpView = document.getElementById('otpView');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const recoveryCodeDisplay = document.getElementById('recoveryCodeDisplay');
    const registerForm = document.getElementById("registerForm");
    const otpForm = document.getElementById("otpForm");

    let currentUserEmail = '';

    // --- Dynamic Content Loading ---
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    document.querySelectorAll('.last-updated-date').forEach(el => {
        el.textContent = today;
    });

    // --- UI State Changers ---
    const showOtpView = (email) => {
        currentUserEmail = email;
        userEmailDisplay.textContent = email;
        registerView.classList.add('hidden');
        otpView.classList.remove('hidden');
    };
    
    const showRecoveryCode = (code) => {
        otpView.classList.add('hidden');
        recoveryCodeDisplay.textContent = code;
        openModal('recoveryCodeModal');
    };
    
    // --- Event Listeners Setup ---
    togglePassword("createPassword", "toggleCreatePassword");
    togglePassword("confirmPassword", "toggleConfirmPassword");

    // Modal Listeners
    document.getElementById('alertOkButton')?.addEventListener('click', () => closeModal('customAlert'));
    
    document.getElementById('termsLink')?.addEventListener('click', (event) => {
        event.preventDefault();
        openModal('termsModal');
    });
    document.getElementById('privacyLink')?.addEventListener('click', (event) => {
        event.preventDefault();
        openModal('privacyModal');
    });

    document.getElementById('closeTerms')?.addEventListener('click', () => closeModal('termsModal'));
    document.getElementById('closePrivacy')?.addEventListener('click', () => closeModal('privacyModal'));
    document.getElementById('closePrivacyButton')?.addEventListener('click', () => closeModal('privacyModal'));
    
    document.getElementById('agreeTermsButton')?.addEventListener('click', () => {
        document.getElementById("terms").checked = true;
        closeModal('termsModal');
    });
    
    document.getElementById('finishRegistrationButton').addEventListener('click', () => {
        window.location.href = 'login.html';
    });
    
    // --- Form Submission Logic ---
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const displayName = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("createPassword").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();
        const termsChecked = document.getElementById("terms").checked;

        if (!displayName || !email || !password) return showAlert("Please fill out all required fields.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAlert("Please enter a valid email address.");
        if (password.length < 8) return showAlert("Password must be at least 8 characters long.");
        if (password !== confirmPassword) return showAlert("Passwords do not match!");
        if (!termsChecked) return showAlert("You must agree to the Terms & Privacy Policy.");

        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Creating Account...';
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName, email, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to register.');
            
            showOtpView(email);

        } catch (error) {
            showAlert(error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Create Account';
        }
    });

    otpForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const otp = document.getElementById("otpInput").value.trim();
        if (!otp || otp.length !== 6) return showAlert("Please enter a valid 6-digit code.");

        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Verifying...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUserEmail, otp })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Verification failed.');

            showRecoveryCode(data.recoveryCode);

        } catch (error) {
            showAlert(error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Verify Account';
        }
    });
    
    document.getElementById('resendOtpButton').addEventListener('click', async () => {
        const resendButton = document.getElementById('resendOtpButton');
        resendButton.disabled = true;
        resendButton.textContent = 'Sending...';
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUserEmail })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to resend code.');
            
            showAlert("A new verification code has been sent.");

        } catch (error) {
            showAlert(error.message);
        } finally {
            resendButton.disabled = false;
            resendButton.textContent = 'Resend Code';
        }
    });
}


// ==================================================================
// 4. Entry Point
// ==================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Load external modals first, then initialize the application logic.
    fetch('modals.html')
        .then(response => {
            if (!response.ok) throw new Error('Network error: Could not load modals.html');
            return response.text();
        })
        .then(data => {
            document.getElementById('modals-container').innerHTML = data;
            // Now that the main page and modals are loaded, run the app.
            initializeApp();
        })
        .catch(error => {
            console.error('Fatal Error: Could not initialize the page.', error);
            // Optionally, display an error message to the user on the page itself
            document.body.innerHTML = '<p style="color: white; text-align: center; padding-top: 50px;">Sorry, the page could not be loaded. Please try again later.</p>';
        });
});