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
