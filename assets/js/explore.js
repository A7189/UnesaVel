document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('location-search');
    const clearButton = document.getElementById('clear-search');
    const locationCards = Array.from(document.querySelectorAll('.location-card'));
    const resultCount = document.getElementById('results-count');
    const emptyResults = document.getElementById('empty-results');
    const locationStatus = document.getElementById('location-status');
    const detectLocationButton = document.getElementById('detect-location');

    if (searchInput && clearButton && resultCount && emptyResults) {
        const initialQuery = new URLSearchParams(window.location.search).get('q');

        if (initialQuery) {
            searchInput.value = initialQuery;
        }

        const filterLocations = () => {
            const query = searchInput.value.trim().toLocaleLowerCase('id');
            let visibleCount = 0;

            locationCards.forEach((card) => {
                const searchableText = `${card.textContent} ${card.dataset.search || ''}`.toLocaleLowerCase('id');
                const matches = searchableText.includes(query);

                card.hidden = !matches;
                visibleCount += Number(matches);
            });

            resultCount.textContent = `${visibleCount} lokasi`;
            emptyResults.hidden = visibleCount !== 0;
            clearButton.hidden = searchInput.value.length === 0;
        };

        filterLocations();
        searchInput.addEventListener('input', filterLocations);
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            filterLocations();
            searchInput.focus();
        });
    }

    if (locationStatus && detectLocationButton) {
        detectLocationButton.addEventListener('click', () => {
            if (!navigator.geolocation) {
                locationStatus.textContent = 'Browser ini belum mendukung fitur lokasi.';
                return;
            }

            locationStatus.textContent = 'Sedang mencari lokasi kamu...';
            detectLocationButton.disabled = true;

            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    locationStatus.textContent = `Lokasi awal tersimpan (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`;
                    detectLocationButton.disabled = false;
                },
                (error) => {
                    const messages = {
                        1: 'Izin lokasi ditolak. Aktifkan izin lokasi lalu coba lagi.',
                        2: 'Lokasi belum tersedia. Coba lagi beberapa saat.',
                        3: 'Pencarian lokasi terlalu lama. Coba lagi.'
                    };

                    locationStatus.textContent = messages[error.code] || 'Lokasi gagal didapatkan. Coba lagi.';
                    detectLocationButton.disabled = false;
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
            );
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
  // ID tujuan yang sesuai dengan array lokasi di booking.js.
  const exploreDestinations = {
    "Gerbang Utama UNESA": "gerbang-utama-unesa",
    "Rumpun Informatika": "rumpun-informatika",
    "Gedung Rektorat": "gedung-rektorat",
    "Perpustakaan UNESA": "perpustakaan-unesa",
    "Rumpun Kedokteran": "rumpun-kedokteran",
    "Danau UNESA": "danau-unesa"
  };

  const locationCards = document.querySelectorAll(".location-card");

  locationCards.forEach((card) => {
    const title = card.querySelector("h3");
    const image = card.querySelector("img");

    if (!title) return;

    const locationName = title.textContent.trim();
    const destinationId = exploreDestinations[locationName];

    // Lewati kartu yang tidak ada dalam daftar tujuan.
    if (!destinationId) return;

    function openBooking(event) {
      // Jangan mengganggu tautan Lihat Peta atau tombol di kartu.
      if (event.target.closest(".map-link, button, a")) return;

      window.location.href =
        `booking.html?destination=${encodeURIComponent(destinationId)}`;
    }

    // Gambar bisa diklik.
    if (image) {
      image.style.cursor = "pointer";
      image.addEventListener("click", openBooking);
    }

    // Judul lokasi bisa diklik.
    title.style.cursor = "pointer";
    title.addEventListener("click", openBooking);
    title.title = "Klik untuk memesan tiket ke lokasi ini";
  });
});
