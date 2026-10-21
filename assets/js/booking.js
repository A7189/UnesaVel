
document.addEventListener("DOMContentLoaded", () => {
    // 1. DATA LOKASI
    const faculties = [
        { id: "gerbang-utama-unesa", name: "Gerbang Utama UNESA", campus: "Kampus 1 - Ketintang" },
        { id: "rumpun-informatika", name: "Rumpun Informatika", campus: "Kampus 1 - Ketintang" },
        { id: "gedung-rektorat", name: "Gedung Rektorat", campus: "Kampus 1 - Ketintang" },
        { id: "perpustakaan-unesa", name: "Perpustakaan UNESA", campus: "Kampus 1 - Ketintang" },
        { id: "rumpun-kedokteran", name: "Rumpun Kedokteran", campus: "Kampus 2 - Lidah Wetan" },
        { id: "danau-unesa", name: "Danau UNESA", campus: "Kampus 2 - Lidah Wetan" },
        { id: "fh", name: "Fakultas Hukum", campus: "Kampus 1 - Ketintang" },
        { id: "ft", name: "Fakultas Teknik", campus: "Kampus 1 - Ketintang" },
        { id: "fmipa", name: "Fakultas Matematika dan Ilmu Pengetahuan Alam", campus: "Kampus 1 - Ketintang" },
        { id: "fv", name: "Fakultas Vokasi", campus: "Kampus 1 - Ketintang" },
        { id: "feb", name: "Fakultas Ekonomika dan Bisnis", campus: "Kampus 1 - Ketintang" },
        { id: "fisipol", name: "Fakultas Ilmu Sosial dan Politik", campus: "Kampus 1 - Ketintang" },
        { id: "fk", name: "Fakultas Kedokteran", campus: "Kampus 2 - Lidah Wetan" },
        { id: "fbs", name: "Fakultas Bahasa dan Seni", campus: "Kampus 2 - Lidah  Wetan" },
        { id: "fip", name: "Fakultas Ilmu Pendidikan", campus: "Kampus 2 - Lidah Wetan" },
        { id: "fikk", name: "Fakultas Ilmu Keolahragaan dan Kesehatan", campus: "Kampus 2 - Lidah Wetan" },
        { id: "psikologi", name: "Fakultas Psikologi", campus: "Kampus 2 - Lidah Wetan" }
    ];

    // 2. AMBIL ELEMEN HTML

    const bookingForm = document.getElementById("bookingForm");

    const pickup = document.getElementById("pickup");
    const destination = document.getElementById("destination");

    const pickupSearch = document.getElementById("pickupSearch");
    const destinationSearch = document.getElementById("destinationSearch");

    const pickupOptions = document.getElementById("pickupOptions");
    const destinationOptions = document.getElementById("destinationOptions");

    const clearPickup = document.getElementById("clearPickup");
    const clearDestination = document.getElementById("clearDestination");

    const swapRoute = document.getElementById("swapRoute");

    const travelDate = document.getElementById("travelDate");
    const travelTime = document.getElementById("travelTime");

    const hourValue = document.getElementById("hourValue");
    const minuteValue = document.getElementById("minuteValue");

    const hourUp = document.getElementById("hourUp");
    const hourDown = document.getElementById("hourDown");
    const minuteUp = document.getElementById("minuteUp");
    const minuteDown = document.getElementById("minuteDown");

    const passengerCount = document.getElementById("passengerCount");
    const decreasePassenger = document.getElementById("decreasePassenger");
    const increasePassenger = document.getElementById("increasePassenger");

    const routeError = document.getElementById("routeError");
    const dateTimeError = document.getElementById("dateTimeError");
    const passengerError = document.getElementById("passengerError");

    
    // 3. PERIKSA ELEMEN HTML
    

    const requiredElements = {
        bookingForm,
        pickup,
        destination,
        pickupSearch,
        destinationSearch,
        pickupOptions,
        destinationOptions,
        clearPickup,
        clearDestination,
        swapRoute,
        travelDate,
        travelTime,
        hourValue,
        minuteValue,
        hourUp,
        hourDown,
        minuteUp,
        minuteDown,
        passengerCount,
        decreasePassenger,
        increasePassenger,
        routeError,
        dateTimeError,
        passengerError
    };

    const missingElements = Object.entries(requiredElements)
        .filter(([, element]) => !element)
        .map(([name]) => name);

    if (missingElements.length > 0) {
        console.error(
            "Booking gagal diinisialisasi. Elemen HTML tidak ditemukan:",
            missingElements
        );
        return;
    }

    // 4. TANGGAL MINIMAL HARI INI

    function getLocalDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    travelDate.min = getLocalDateString();

    // 5. PEMILIH JAM DAN MENIT

    let selectedHour = 8;
    let selectedMinute = 30;

    function formatNumber(number) {
        return String(number).padStart(2, "0");
    }

    function isValidHour(value) {
        return /^\d{1,2}$/.test(value) &&
            Number(value) >= 6 &&
            Number(value) <= 19;
    }

    function isValidMinute(value) {
        return /^\d{1,2}$/.test(value) &&
            Number(value) >= 1 &&
            Number(value) <= 59;
    }

    // Baca nilai dari INPUT, bukan textContent.
    function syncTravelTime() {
        const hourText = hourValue.value.trim();
        const minuteText = minuteValue.value.trim();

        if (
            isValidHour(hourText) &&
            isValidMinute(minuteText)
        ) {
            selectedHour = Number(hourText);
            selectedMinute = Number(minuteText);

            travelTime.value =
                `${formatNumber(selectedHour)}:${formatNumber(selectedMinute)}`;
        } else {
            travelTime.value = "";
        }
    }

    // Perbarui tampilan sekaligus nilai waktu tersembunyi.
    function updateTravelTime() {
        hourValue.value = formatNumber(selectedHour);
        minuteValue.value = formatNumber(selectedMinute);

        travelTime.value =
            `${formatNumber(selectedHour)}:${formatNumber(selectedMinute)}`;

        dateTimeError.textContent = "";
    }

    function changeHour(step) {
        syncTravelTime();

        // Jika input jam sedang tidak valid, mulai dari jam 08.
        if (!isValidHour(hourValue.value.trim())) {
            selectedHour = 8;
        }

        selectedHour += step;

        if (selectedHour > 19) {
            selectedHour = 6;
        } else if (selectedHour < 6) {
            selectedHour = 19;
        }

        updateTravelTime();
    }

    function changeMinute(step) {
        syncTravelTime();

        // Jika input menit sedang tidak valid, mulai dari menit 30.
        if (!isValidMinute(minuteValue.value.trim())) {
            selectedMinute = 30;
        }

        selectedMinute += step;

        if (selectedMinute > 59) {
            selectedMinute = 0;
        } else if (selectedMinute < 0) {
            selectedMinute = 59;
        }

        updateTravelTime();
    }

    // Pengguna mengetik jam.
    hourValue.addEventListener("input", () => {
        // Hanya izinkan angka, maksimal dua digit.
        const cleanedValue = hourValue.value
            .replace(/\D/g, "")
            .slice(0, 2);

        if (hourValue.value !== cleanedValue) {
            hourValue.value = cleanedValue;
        }

        syncTravelTime();
        dateTimeError.textContent = "";
    });

    // Pengguna mengetik menit.
    minuteValue.addEventListener("input", () => {
        const cleanedValue = minuteValue.value
            .replace(/\D/g, "")
            .slice(0, 2);

        if (minuteValue.value !== cleanedValue) {
            minuteValue.value = cleanedValue;
        }

        syncTravelTime();
        dateTimeError.textContent = "";
    });

    // Saat pengguna selesai mengedit jam, periksa rentangnya.
    hourValue.addEventListener("blur", () => {
        const value = hourValue.value.trim();

        if (value === "") {
            selectedHour = 8;
            updateTravelTime();
            return;
        }

        if (!isValidHour(value)) {
            dateTimeError.textContent =
                "Jam harus berada di antara 06 dan 21.";

            hourValue.value = "";
            travelTime.value = "";
            return;
        }

        selectedHour = Number(value);
        hourValue.value = formatNumber(selectedHour);
        syncTravelTime();
    });

    // Saat pengguna selesai mengedit menit, periksa rentangnya.
    minuteValue.addEventListener("blur", () => {
        const value = minuteValue.value.trim();

        if (value === "") {
            selectedMinute = 30;
            updateTravelTime();
            return;
        }

        if (!isValidMinute(value)) {
            dateTimeError.textContent =
                "Menit harus berada di antara 01 dan 60.";

            minuteValue.value = "";
            travelTime.value = "";
            return;
        }

        selectedMinute = Number(value);
        minuteValue.value = formatNumber(selectedMinute);
        syncTravelTime();
    });

    // Tombol panah.
    hourUp.addEventListener("click", () => changeHour(1));
    hourDown.addEventListener("click", () => changeHour(-1));

    minuteUp.addEventListener("click", () => changeMinute(1));
    minuteDown.addEventListener("click", () => changeMinute(-1));

    // Panah keyboard untuk menaikkan/menurunkan nilai.
    hourValue.addEventListener("keydown", (event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            changeHour(event.key === "ArrowUp" ? 1 : -1);
        }
    });

    minuteValue.addEventListener("keydown", (event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            changeMinute(event.key === "ArrowUp" ? 1 : -1);
        }
    });

    // Roda mouse/touchpad hanya aktif ketika pointer berada
    // di area tombol panah, bukan ketika sedang mengetik input.
    const hourColumn = hourValue.closest(".time-picker-column");
    const minuteColumn = minuteValue.closest(".time-picker-column");

    if (hourColumn) {
        hourColumn.addEventListener("wheel", (event) => {
            if (event.target === hourValue) return;

            event.preventDefault();
            changeHour(event.deltaY > 0 ? 1 : -1);
        }, { passive: false });
    }

    if (minuteColumn) {
        minuteColumn.addEventListener("wheel", (event) => {
            if (event.target === minuteValue) return;

            event.preventDefault();
            changeMinute(event.deltaY > 0 ? 1 : -1);
        }, { passive: false });
    }

    updateTravelTime();

    // ==========================================
    // 6. PENCARIAN LOKASI
    // ==========================================

    function setupLocationSearch(
        searchInput,
        hiddenInput,
        optionsBox,
        clearButton
    ) {
        function updateClearButton() {
            clearButton.hidden = searchInput.value.trim() === "";
        }

        function closeOptions() {
            optionsBox.classList.remove("show");
            searchInput.setAttribute("aria-expanded", "false");
        }

        function renderOptions(query = "") {
            const keyword = query.trim().toLowerCase();

            const filteredLocations = faculties.filter((faculty) => {
                const searchableText =
                    `${faculty.name} ${faculty.campus}`.toLowerCase();

                return searchableText.includes(keyword);
            });

            optionsBox.replaceChildren();

            if (filteredLocations.length === 0) {
                const message = document.createElement("div");
                message.className = "location-not-found";
                message.textContent = "Lokasi tidak ditemukan";
                optionsBox.appendChild(message);
            } else {
                filteredLocations.forEach((faculty) => {
                    const option = document.createElement("button");

                    option.type = "button";
                    option.className = "location-option";
                    option.setAttribute("role", "option");

                    const name = document.createElement("span");
                    name.className = "location-option-name";
                    name.textContent = faculty.name;

                    const campus = document.createElement("span");
                    campus.className = "location-option-campus";
                    campus.textContent = faculty.campus;

                    option.append(name, campus);

                    option.addEventListener("click", () => {
                        hiddenInput.value = faculty.id;
                        searchInput.value = faculty.name;
                        searchInput.setCustomValidity("");

                        updateClearButton();
                        closeOptions();
                    });

                    optionsBox.appendChild(option);
                });
            }

            optionsBox.classList.add("show");
            searchInput.setAttribute("aria-expanded", "true");
        }

        searchInput.addEventListener("focus", () => {
            renderOptions(searchInput.value);
        });

        searchInput.addEventListener("input", () => {
            hiddenInput.value = "";
            searchInput.setCustomValidity("");

            updateClearButton();
            renderOptions(searchInput.value);
        });

        clearButton.addEventListener("click", () => {
            searchInput.value = "";
            hiddenInput.value = "";
            searchInput.setCustomValidity("");

            updateClearButton();
            renderOptions("");
            searchInput.focus();
        });

        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeOptions();
            }

            if (event.key === "ArrowDown") {
                const firstOption =
                    optionsBox.querySelector(".location-option");

                if (firstOption) {
                    event.preventDefault();
                    firstOption.focus();
                }
            }
        });

        document.addEventListener("click", (event) => {
            if (
                !searchInput.contains(event.target) &&
                !optionsBox.contains(event.target) &&
                !clearButton.contains(event.target)
            ) {
                closeOptions();
            }
        });

        updateClearButton();

        return {
            closeOptions,
            updateClearButton
        };
    }

    const pickupSearchController = setupLocationSearch(
        pickupSearch,
        pickup,
        pickupOptions,
        clearPickup
    );

    const destinationSearchController = setupLocationSearch(
        destinationSearch,
        destination,
        destinationOptions,
        clearDestination
    );

    // ==========================================
    // 7. TUJUAN OTOMATIS DARI HALAMAN EXPLORE
    // ==========================================

    function prefillDestinationFromExplore() {
        const params = new URLSearchParams(window.location.search);
        const destinationId = params.get("destination");

        if (!destinationId) return;

        const selectedLocation = faculties.find(
            (location) => location.id === destinationId
        );

        if (!selectedLocation) {
            console.warn(
                "ID tujuan dari Explore tidak ditemukan:",
                destinationId
            );
            return;
        }

        destination.value = selectedLocation.id;
        destinationSearch.value = selectedLocation.name;
        destinationSearch.setCustomValidity("");

        destinationSearchController.updateClearButton();
        destinationSearchController.closeOptions();
    }

    prefillDestinationFromExplore();

    // ==========================================
    // 8. TUKAR TITIK PENJEMPUTAN DAN TUJUAN
    // ==========================================

    swapRoute.addEventListener("click", () => {
        const oldPickupText = pickupSearch.value;
        const oldPickupId = pickup.value;

        pickupSearch.value = destinationSearch.value;
        pickup.value = destination.value;

        destinationSearch.value = oldPickupText;
        destination.value = oldPickupId;

        pickupSearch.setCustomValidity("");
        destinationSearch.setCustomValidity("");

        pickupSearchController.updateClearButton();
        destinationSearchController.updateClearButton();

        pickupSearchController.closeOptions();
        destinationSearchController.closeOptions();

        routeError.textContent = "";
    });

    // ==========================================
    // 9. JUMLAH PENUMPANG
    // Minimal 1, maksimal 4.
    // ==========================================

    function normalizePassengerCount() {
        const rawValue = passengerCount.value.trim();

        if (rawValue === "") {
            decreasePassenger.disabled = true;
            increasePassenger.disabled = true;
            return;
        }

        let value = Number(rawValue);

        if (!Number.isFinite(value)) value = 1;

        value = Math.trunc(value);
        value = Math.max(1, Math.min(4, value));

        passengerCount.value = value;
        decreasePassenger.disabled = value <= 1;
        increasePassenger.disabled = value >= 4;
    }

    decreasePassenger.addEventListener("click", () => {
        let value = Number(passengerCount.value) || 1;

        if (value > 1) {
            passengerCount.value = value - 1;
        }

        normalizePassengerCount();
        passengerError.textContent = "";
    });

    increasePassenger.addEventListener("click", () => {
        let value = Number(passengerCount.value) || 1;

        if (value < 4) {
            passengerCount.value = value + 1;
        }

        normalizePassengerCount();
        passengerError.textContent = "";
    });

    passengerCount.addEventListener("input", () => {
        passengerError.textContent = "";

        const value = Number(passengerCount.value);

        if (passengerCount.value.trim() === "") {
            decreasePassenger.disabled = true;
            increasePassenger.disabled = true;
            return;
        }

        decreasePassenger.disabled = value <= 1 || value > 4;
        increasePassenger.disabled = value >= 4 || value < 1;
    });

    passengerCount.addEventListener("change", normalizePassengerCount);
    passengerCount.addEventListener("blur", normalizePassengerCount);

    normalizePassengerCount();

    // ==========================================
    // 10. VALIDASI DAN SIMPAN PEMESANAN
    // ==========================================

    bookingForm.addEventListener("submit", (event) => {
        event.preventDefault();

        routeError.textContent = "";
        dateTimeError.textContent = "";
        passengerError.textContent = "";

        // Validasi lokasi.
        const pickupFaculty = faculties.find(
            (faculty) => faculty.id === pickup.value
        );

        const destinationFaculty = faculties.find(
            (faculty) => faculty.id === destination.value
        );

        if (!pickupFaculty || !destinationFaculty) {
            routeError.textContent =
                "Pilih titik penjemputan dan tujuan dari daftar lokasi.";

            if (!pickupFaculty) {
                pickupSearch.focus();
            } else {
                destinationSearch.focus();
            }

            return;
        }

        if (pickupFaculty.id === destinationFaculty.id) {
            routeError.textContent =
                "Titik penjemputan dan tujuan tidak boleh sama.";

            destinationSearch.focus();
            return;
        }

        // Validasi tanggal.
        if (
            !travelDate.value ||
            travelDate.value < getLocalDateString()
        ) {
            dateTimeError.textContent =
                "Pilih tanggal keberangkatan hari ini atau setelahnya.";

            travelDate.focus();
            return;
        }

        // PENTING:
        // Jangan panggil updateTravelTime() di sini karena fungsi itu
        // dapat menimpa nilai yang sedang diketik pengguna.
        syncTravelTime();

        const selectedTime = travelTime.value.trim();

        const timePattern =
            /^(0[6-9]|1\d|2[01]):(0[1-9]|[1-5]\d|60)$/;

        if (!timePattern.test(selectedTime)) {
            dateTimeError.textContent =
                "Masukkan jam 06–21 dan menit 01–60 dengan benar.";

            if (!isValidHour(hourValue.value.trim())) {
                hourValue.focus();
            } else {
                minuteValue.focus();
            }

            return;
        }

        // Validasi jumlah penumpang.
        const passengers = Number(passengerCount.value);

        if (
            !Number.isInteger(passengers) ||
            passengers < 1 ||
            passengers > 4
        ) {
            passengerError.textContent =
                "Jumlah penumpang harus antara 1 sampai 4 orang.";

            passengerCount.focus();
            return;
        }

        // Data pemesanan untuk halaman pemilihan bus.
        const bookingData = {
            pickup: pickupFaculty.name,
            pickupId: pickupFaculty.id,
            pickupCampus: pickupFaculty.campus,

            destination: destinationFaculty.name,
            destinationId: destinationFaculty.id,
            destinationCampus: destinationFaculty.campus,

            date: travelDate.value,
            time: selectedTime,
            passengers: passengers
        };

        localStorage.setItem(
            "unesavelBooking",
            JSON.stringify(bookingData)
        );

        window.location.href = "bus-selection.html";
    });
});
