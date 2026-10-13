document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.getElementById('bottom-nav-container');
    
    if (navContainer) {
        // Cek posisi halaman saat ini biar tau mana yang harus dikasih class 'active'
        const currentPath = window.location.pathname;
        const isExplorePage = currentPath.endsWith('explore.html');
        // Default ke Home (Dashboard) kalau bukan di Explore
        const isDashboardPage = currentPath.endsWith('dashboard.html') || (!isExplorePage); 

        // Href-nya langsung tembak nama filenya aja karena mereka udah satu folder
        navContainer.innerHTML = `
            <nav class="bottom-nav">
                <span class="nav-indicator" aria-hidden="true"></span>
                <a href="dashboard.html" class="nav-item${isDashboardPage ? ' active' : ''}"${isDashboardPage ? ' aria-current="page"' : ''}>
                    <i class="fa-solid fa-house"></i>
                    <span>Home</span>
                </a>
                <a href="explore.html" class="nav-item${isExplorePage ? ' active' : ''}"${isExplorePage ? ' aria-current="page"' : ''}>
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

            // Dikasih timeout 50ms biar posisi awal indikatornya ga meleset pas render pertama
            setTimeout(positionIndicator, 50);
            window.addEventListener('resize', positionIndicator);
        }
    }
});