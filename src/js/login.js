// ==================================================================
// 2. Main Application Logic
// ==================================================================
document.addEventListener("DOMContentLoaded", () => {
    
    const downloadView = document.getElementById('downloadView');
    const loginView = document.getElementById('loginView');

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        downloadView.classList.add('hidden');
        loginView.classList.remove('hidden');

        initializeMobileApp();
    }});