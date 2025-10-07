// In src/js/utils.js

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('hidden', 'opacity-0');
    const modalBox = modal.querySelector('div[class*="transform"]');
    if (modalBox) {
        modalBox.classList.remove('opacity-0', 'scale-95');
    }
}

export function showAlert(message) {
    const alertMessage = document.getElementById("alertMessage");
    if (alertMessage) {
        alertMessage.textContent = message;
        openModal("customAlert");
    } else {
        alert(message);
    }
}