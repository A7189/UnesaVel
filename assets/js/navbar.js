document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.getElementById('bottom-nav-container');
    
    if (navContainer) {
        // Trik biar link tetap jalan walaupun dipanggil dari folder 'pages' atau 'root'
        const isInsidePages = window.location.pathname.includes('/pages/');
        const basePath = isInsidePages ? '../' : '';
        const isExplorePage = window.location.pathname.endsWith('/explore.html');

        navContainer.innerHTML = `
            <nav class="bottom-nav">
                <span class="nav-indicator" aria-hidden="true"></span>
                <a href="${basePath}index.html" class="nav-item${isExplorePage ? '' : ' active'}"${isExplorePage ? '' : ' aria-current="page"'}>
                    <i class="fa-solid fa-house"></i>
                    <span>Home</span>
                </a>
                <a href="${basePath}pages/explore.html" class="nav-item${isExplorePage ? ' active' : ''}"${isExplorePage ? ' aria-current="page"' : ''}>
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

        const nav = navContainer.querySelector('.bottom-nav');
        const activeItem = navContainer.querySelector('.nav-item.active');
        const indicator = navContainer.querySelector('.nav-indicator');

        if (nav && activeItem && indicator) {
            const positionIndicator = () => {
                const centeredOffset = (activeItem.offsetWidth - indicator.offsetWidth) / 2;
                indicator.style.transform = `translateX(${activeItem.offsetLeft + centeredOffset}px)`;
                indicator.style.opacity = '1';
            };

            positionIndicator();
            window.addEventListener('resize', positionIndicator);
        }
    }
});