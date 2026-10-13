document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('emailInput');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = emailInput.value.toLowerCase();

            if (username.includes('driver')) {
                window.location.href = 'driver.html'; 
            } else {
                window.location.href = 'dashboard.html'; // Nah ini ga usah pake ../ lagi
            }
        });
    }
});