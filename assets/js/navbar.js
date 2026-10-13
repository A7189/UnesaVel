document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.getElementById('bottom-nav-container');
    
    if (navContainer) {
        // Trik biar link tetap jalan walaupun dipanggil dari folder 'pages' atau 'root'
        const isInsidePages = window.location.pathname.includes('/pages/');
        const basePath = isInsidePages ? '../' : '';

        navContainer.innerHTML = `
            <nav class="bottom-nav">
                <a href="${basePath}index.html" class="nav-item active">
                    <i class="fa-solid fa-house"></i>
                    <span>Home</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="fa-solid fa-compass"></i>
                    <span>Explore</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="fa-solid fa-ticket"></i>
                    <span>Tickets</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="fa-regular fa-user"></i>
                    <span>Profile</span>
                </a>
            </nav>
        `;
    }
});