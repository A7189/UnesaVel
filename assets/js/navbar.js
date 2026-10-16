document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.getElementById('bottom-nav-container');
    
    if (navContainer) {
        const currentPath = window.location.pathname;
        const isExplorePage = currentPath.endsWith('explore.html');
        const isHistoryPage = currentPath.endsWith('history.html');
        const isProfilePage = currentPath.endsWith('profile.html');
        const isDashboardPage = currentPath.endsWith('dashboard.html') || (!isExplorePage && !isHistoryPage && !isProfilePage);

        navContainer.innerHTML = `
            <nav class="bottom-nav">
                <span class="nav-indicator" aria-hidden="true"></span>
                <a href="dashboard.html" class="nav-item${isDashboardPage ? ' active' : ''}">
                    <i class="fa-solid fa-house"></i>
                    <span>Home</span>
                </a>
                <a href="explore.html" class="nav-item${isExplorePage ? ' active' : ''}">
                    <i class="fa-solid fa-compass"></i>
                    <span>Explore</span>
                </a>
                <a href="history.html" class="nav-item${isHistoryPage ? ' active' : ''}">
                    <i class="fa-solid fa-ticket"></i>
                    <span>Tickets</span>
                </a>
                <a href="profile.html" class="nav-item${isProfilePage ? ' active' : ''}">
                    <i class="fa-regular fa-user"></i>
                    <span>Profile</span>
                </a>
            </nav>
        `;

        const nav = navContainer.querySelector('.bottom-nav');
        const navItems = navContainer.querySelectorAll('.nav-item');
        const activeItem = navContainer.querySelector('.nav-item.active');
        const indicator = navContainer.querySelector('.nav-indicator');

        if (nav && activeItem && indicator) {
            const getPosition = (item) => {
                const centeredOffset = (item.offsetWidth - indicator.offsetWidth) / 2;
                return item.offsetLeft + centeredOffset;
            };

            // Animasi glide yang mulus dan cepat
            const smoothTransition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';

            // 1. PAS HALAMAN BARU KELOAD: 
            // Langsung taruh indikator di posisi yang bener (tanpa animasi lagi, karena animasinya udah dijalanin sblm pindah)
            indicator.style.transition = 'none';
            indicator.style.transform = `translateX(${getPosition(activeItem)}px)`;
            indicator.style.opacity = '1';

            // 2. PAS TOMBOL DIKLIK (Ini rahasia ala Instagram)
            navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    // Kalau ngeklik tombol yang udah aktif, biarin aja
                    if (item.classList.contains('active')) return;

                    // TAHAN! Jangan langsung pindah halaman
                    e.preventDefault();
                    const targetUrl = item.getAttribute('href');

                    // Jalanin animasi lingkarannya ke tombol yang diklik
                    indicator.style.transition = smoothTransition;
                    indicator.style.transform = `translateX(${getPosition(item)}px)`;

                    // Kasih jeda 250ms biarin animasinya jalan, baru pindah halaman beneran
                    setTimeout(() => {
                        window.location.href = targetUrl;
                    }, 250); 
                });
            });

            // Biar ga berantakan kalo HP nya di-rotate/landscape
            window.addEventListener('resize', () => {
                indicator.style.transition = 'none';
                indicator.style.transform = `translateX(${getPosition(activeItem)}px)`;
            });
        }
    }
});