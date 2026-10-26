const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const dashboardSearchForm = document.querySelector("#dashboard-search-form");
const dashboardSearchInput = document.querySelector("#dashboard-search-input");
const dashboardSearchStatus = document.querySelector("#dashboard-search-status");
const destinationCards = [...document.querySelectorAll(".destination-card")];

if (dashboardSearchForm && dashboardSearchInput && dashboardSearchStatus) {
  const filterDestinations = () => {
    const query = dashboardSearchInput.value.trim().toLocaleLowerCase("id");
    let visibleCount = 0;

    destinationCards.forEach((card) => {
      const searchableText = `${card.textContent} ${card.dataset.mapSearch || ""}`.toLocaleLowerCase("id");
      const matches = searchableText.includes(query);

      card.hidden = !matches;
      visibleCount += Number(matches);
    });

    if (!query) {
      dashboardSearchStatus.hidden = true;
      dashboardSearchStatus.textContent = "";
      return;
    }

    dashboardSearchStatus.hidden = false;
    dashboardSearchStatus.textContent = visibleCount
      ? `${visibleCount} lokasi ditemukan`
      : "Lokasi tidak ditemukan. Coba kata kunci lain.";
  };

  dashboardSearchInput.addEventListener("input", filterDestinations);
  dashboardSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = dashboardSearchInput.value.trim();

    if (query) {
      window.location.href = `pages/explore.html?q=${encodeURIComponent(query)}`;
    }
  });
}

document.querySelectorAll(".destination-card").forEach((card) => {
  const mapSearch = card.dataset.mapSearch;
  const mapButton = card.querySelector(".arrow-btn");

  if (mapSearch && mapButton) {
    mapButton.addEventListener("click", () => {
      const mapUrl = new URL("https://www.google.com/maps/search/");
      mapUrl.searchParams.set("api", "1");
      mapUrl.searchParams.set("query", mapSearch);
      window.open(mapUrl, "_blank", "noopener,noreferrer");
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
    const busPins = document.querySelectorAll('.bus-pin');
    const badge = document.getElementById('bus-info-badge');
    const badgeTitle = document.getElementById('badge-title');
    const badgeDesc = document.getElementById('badge-desc');

    if (busPins.length > 0 && badge) {
        busPins.forEach(pin => {
            pin.addEventListener('click', (e) => {
                e.stopPropagation();

                busPins.forEach(p => p.classList.remove('active'));

                pin.classList.add('active');

                const id = pin.getAttribute('data-id');
                const seats = pin.getAttribute('data-seats');
                const loc = pin.getAttribute('data-loc');
                const est = pin.getAttribute('data-est');

                badgeTitle.textContent = `${id} (Sisa ${seats} Kursi)`;
                badgeDesc.textContent = `Posisi: ${loc} (Est. ${est})`;

                badge.classList.add('show');
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.bus-pin') && !e.target.closest('.floating-badge')) {
                busPins.forEach(p => p.classList.remove('active'));
                badge.classList.remove('show');
            }
        });
    }
});

const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
const toggleSwitch = document.getElementById('darkModeToggle');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark' && toggleSwitch) {
        toggleSwitch.checked = true;
    }
}


if (toggleSwitch) {
    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark'); // Simpan ingatan ke dark
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light'); // Simpan ingatan ke light
        }    
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const btnSeeVouchers = document.getElementById('btn-see-vouchers');
    const voucherModal = document.getElementById('voucher-modal');
    const closeVoucherBtn = document.getElementById('close-voucher');

    if (btnSeeVouchers && voucherModal) {
        btnSeeVouchers.addEventListener('click', (e) => {
            e.preventDefault(); // Biar ga scroll ke atas
            voucherModal.classList.add('active');
        });

        closeVoucherBtn.addEventListener('click', () => {
            voucherModal.classList.remove('active');
        });

        // Klik di luar box putih buat nutup
        voucherModal.addEventListener('click', (e) => {
            if(e.target === voucherModal) {
                voucherModal.classList.remove('active');
            }
        });
    }
});