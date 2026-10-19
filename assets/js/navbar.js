document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.getElementById('bottom-nav-container');

    if (!navContainer) return;

    // Ambil nama file halaman yang sedang dibuka.
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop().toLowerCase();

    // Kelompokkan halaman sesuai menu navbar.
    const explorePages = [
        'explore.html',
        'booking.html',
        'bus-selection.html',
        'seat-selection.html'
    ];

    const ticketPages = [
        'history.html',
        'confirmation.html'
    ];

    const isExplorePage = explorePages.includes(currentPage);
    const isHistoryPage = ticketPages.includes(currentPage);
    const isProfilePage = currentPage === 'profile.html';
    const isDashboardPage =
        currentPage === 'dashboard.html' ||
        (!isExplorePage && !isHistoryPage && !isProfilePage);

    // Buat navbar.
    navContainer.innerHTML = `
        <nav class="bottom-nav" aria-label="Navigasi utama">
            <span class="nav-indicator" aria-hidden="true"></span>

            <a href="dashboard.html"
               class="nav-item${isDashboardPage ? ' active' : ''}">
                <i class="fa-solid fa-house"></i>
                <span>Home</span>
            </a>

            <a href="explore.html"
               class="nav-item${isExplorePage ? ' active' : ''}">
                <i class="fa-solid fa-compass"></i>
                <span>Explore</span>
            </a>

            <a href="history.html"
               class="nav-item${isHistoryPage ? ' active' : ''}">
                <i class="fa-solid fa-ticket"></i>
                <span>Tickets</span>
            </a>

            <a href="profile.html"
               class="nav-item${isProfilePage ? ' active' : ''}">
                <i class="fa-regular fa-user"></i>
                <span>Profile</span>
            </a>
        </nav>
    `;

    const nav = navContainer.querySelector('.bottom-nav');
    const navItems = navContainer.querySelectorAll('.nav-item');
    const activeItem = navContainer.querySelector('.nav-item.active');
    const indicator = navContainer.querySelector('.nav-indicator');

    if (!nav || !activeItem || !indicator) return;

    // Hitung posisi tengah indikator terhadap item menu.
    const getPosition = (item) => {
        return item.offsetLeft +
            (item.offsetWidth - indicator.offsetWidth) / 2;
    };

    const smoothTransition =
        'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';

    // Atur posisi awal tanpa animasi saat halaman dibuka.
    const positionIndicator = () => {
        indicator.style.transition = 'none';
        indicator.style.transform =
            `translateX(${getPosition(activeItem)}px)`;
        indicator.style.opacity = '1';
    };

    positionIndicator();

    // Animasi indikator sebelum berpindah halaman.
    navItems.forEach((item) => {
        item.addEventListener('click', (event) => {
            if (item.classList.contains('active')) return;

            // Biarkan perilaku normal untuk tab baru atau klik khusus.
            if (
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey ||
                event.button !== 0
            ) {
                return;
            }

            event.preventDefault();

            const targetUrl = item.getAttribute('href');

            indicator.style.transition = smoothTransition;
            indicator.style.transform =
                `translateX(${getPosition(item)}px)`;

            // Tunggu animasi sebentar, lalu pindah halaman.
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 250);
        });
    });

    // Atur ulang posisi saat ukuran layar berubah.
    window.addEventListener('resize', positionIndicator);
});