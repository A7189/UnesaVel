
/* RESET DEMO SAAT HALAMAN DIBUKA / DI-REFRESH */
(function resetDemoBooking() {
    const demoKeys = [
        "unesavelSelectedTrip"
    ];

    demoKeys.forEach(key => {
        localStorage.removeItem(key);
    });

    // Hapus kursi yang pernah dipilih dalam simulasi
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith("unesavelSeats_")) {
            localStorage.removeItem(key);
        }
    });
})();


document.addEventListener("DOMContentLoaded", () => {
    const $ = (selector) => document.querySelector(selector);

    const busList = $("#bus-list");
    const dateScroller = $("#date-scroller");
    const emptyState = $("#empty-state");
    const resultsCount = $("#results-count");
    const resultsDescription = $("#results-description");
    const modal = $("#bus-modal");
    const modalClose = $("#modal-close");
    const modalSelectButton = $("#modal-select-button");

    // ========================================
    // 1. MEMBACA DATA PEMESANAN
    // ========================================

    let savedBooking = {};

    try {
        savedBooking = JSON.parse(
            localStorage.getItem("unesavelBooking") || "{}"
        );
    } catch {
        savedBooking = {};
    }

    function firstValue(values, fallback) {
        return values.find(value =>
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) ?? fallback;
    }

    function normalizeLocation(value) {
        return String(value ?? "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    function normalizeTime(value) {
        if (!value) return "";

        const match = String(value)
            .trim()
            .match(/^(\d{1,2})[.:](\d{2})$/);

        if (!match) return String(value).trim();

        return `${match[1].padStart(2, "0")}:${match[2]}`;
    }

    function displayTime(value) {
        return normalizeTime(value).replace(":", ".");
    }

    const pickup = String(firstValue([
        savedBooking.pickup,
        savedBooking.pickupPoint,
        savedBooking.origin
    ], "Ketintang"));

    const destination = String(firstValue([
        savedBooking.destination,
        savedBooking.destinationPoint,
        savedBooking.dropoff
    ], "Lidah Wetan"));

    const requestedTime = normalizeTime(firstValue([
        savedBooking.time,
        savedBooking.departureTime
    ], ""));

    const passengers = Math.max(
        1,
        Number(firstValue([
            savedBooking.passengers,
            savedBooking.passengerCount
        ], 1)) || 1
    );

    // ========================================
    // 2. TANGGAL
    // ========================================

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    function dateToISO(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function parseLocalDate(value) {
        const match = String(value).match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );

        if (!match) return null;

        const date = new Date(
            Number(match[1]),
            Number(match[2]) - 1,
            Number(match[3])
        );

        return dateToISO(date) === value ? date : null;
    }

    function dayDifference(firstISO, secondISO) {
        const first = parseLocalDate(firstISO);
        const second = parseLocalDate(secondISO);

        if (!first || !second) return 0;

        return Math.round(
            (
                Date.UTC(
                    second.getFullYear(),
                    second.getMonth(),
                    second.getDate()
                ) -
                Date.UTC(
                    first.getFullYear(),
                    first.getMonth(),
                    first.getDate()
                )
            ) / 86400000
        );
    }

    // Tanggal acuan untuk simulasi perubahan arah bus.
    const scheduleAnchor = "2026-10-18";

    function isReverseDay(dateISO) {
        const difference = dayDifference(
            scheduleAnchor,
            dateISO
        );

        return ((difference % 2) + 2) % 2 === 1;
    }

    const todayISO = dateToISO(today);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 14);

    const maxDateISO = dateToISO(maxDate);

    const requestedDate = String(firstValue([
        savedBooking.date,
        savedBooking.departureDate
    ], todayISO));

    const validRequestedDate = parseLocalDate(requestedDate);

    let selectedDate =
        validRequestedDate &&
            requestedDate >= todayISO &&
            requestedDate <= maxDateISO
            ? requestedDate
            : todayISO;

    // ========================================
    // 3. DATA BUS
    // ========================================

    const vehicles = [
        { id: 1, name: "BUS 01", plate: "L 1357 TI", occupied: 9 },
        { id: 2, name: "BUS 02", plate: "L 1284 TI", occupied: 12 },
        { id: 3, name: "BUS 03", plate: "L 1426 TI", occupied: 5 },
        { id: 4, name: "BUS 04", plate: "L 1532 TI", occupied: 8 },
        { id: 5, name: "BUS 05", plate: "L 1648 TI", occupied: 7 },
        { id: 6, name: "BUS 06", plate: "L 1759 TI", occupied: 14 },
        { id: 7, name: "BUS 07", plate: "L 1863 TI", occupied: 3 },
        { id: 8, name: "BUS 08", plate: "L 1974 TI", occupied: 18 },
        { id: 9, name: "BUS 09", plate: "L 1985 TI", occupied: 6 },
        { id: 10, name: "BUS 10", plate: "L 1996 TI", occupied: 10 }
    ];

    const baseSchedules = [
        {
            id: 1, departure: "06:00", arrival: "06:35",
            from: "Ketintang", to: "Lidah Wetan"
        },
        {
            id: 1, departure: "13:15", arrival: "13:50",
            from: "Lidah Wetan", to: "Ketintang"
        },
        {
            id: 2, departure: "06:00", arrival: "06:35",
            from: "Lidah Wetan", to: "Ketintang"
        },
        {
            id: 2, departure: "13:15", arrival: "13:50",
            from: "Ketintang", to: "Lidah Wetan"
        },
        {
            id: 3, departure: "07:00", arrival: "07:35",
            from: "Ketintang", to: "Lidah Wetan"
        },
        {
            id: 3, departure: "14:30", arrival: "15:00",
            from: "Lidah Wetan", to: "Ketintang"
        },
        {
            id: 4, departure: "07:00", arrival: "07:35",
            from: "Lidah Wetan", to: "Ketintang"
        },
        {
            id: 4, departure: "14:30", arrival: "15:00",
            from: "Ketintang", to: "Lidah Wetan"
        },
        {
            id: 5, departure: "08:00", arrival: "08:35",
            from: "Ketintang", to: "Lidah Wetan"
        },
        {
            id: 5, departure: "15:45", arrival: "16:30",
            from: "Lidah Wetan", to: "Ketintang"
        },
        {
            id: 6, departure: "08:00", arrival: "08:35",
            from: "Lidah Wetan", to: "Ketintang"
        },
        {
            id: 6, departure: "15:45", arrival: "16:30",
            from: "Ketintang", to: "Lidah Wetan"
        },
        {
            id: 7, departure: "09:00", arrival: "09:30",
            from: "Ketintang", to: "Lidah Wetan"
        },
        {
            id: 7, departure: "17:00", arrival: "17:45",
            from: "Lidah Wetan", to: "Ketintang"
        },
        {
            id: 8, departure: "09:00", arrival: "09:30",
            from: "Lidah Wetan", to: "Ketintang"
        },
        {
            id: 8, departure: "17:00", arrival: "17:45",
            from: "Ketintang", to: "Lidah Wetan"
        },
        {
            id: 9, departure: "10:45", arrival: "11:15",
            from: "Ketintang", to: "Lidah Wetan"
        },
        {
            id: 9, departure: "18:00", arrival: "18:45",
            from: "Lidah Wetan", to: "Ketintang"
        },
        {
            id: 10, departure: "10:45", arrival: "11:15",
            from: "Lidah Wetan", to: "Ketintang"
        },
        {
            id: 10, departure: "18:00", arrival: "18:45",
            from: "Ketintang", to: "Lidah Wetan"
        }
    ];

    // ========================================
    // 4. URUTAN HALTE FAKULTAS
    // Arah Ketintang -> Lidah Wetan
    // ========================================

    const routeStops = [
        "fh",
        "ft",
        "fmipa",
        "fv",
        "feb",
        "fisipol",
        "fk",
        "fip",
        "fbs",
        "fikk",
        "psikologi"
    ];

    // Samakan ID lokasi tambahan dengan ID halte yang dikenal.
    // Posisi lokasi tambahan ini masih berupa asumsi simulasi.
    const stopAliases = {
        "rumpun-informatika": "ft",
        "mipa": "fmipa",
        "vokasi": "fv",
        "kedokteran": "fk",
        "rumpun-kedokteran": "fk",
        "gerbang-utama-unesa": "fh",
        "gedung-rektorat": "fh",
        "perpustakaan-unesa": "fh",
        "danau-unesa": "fk"
    };

    function getStopIndex(locationId) {
        const id = String(locationId ?? "")
            .trim()
            .toLowerCase();

        const canonicalId = stopAliases[id] || id;

        return routeStops.indexOf(canonicalId);
    }

    function getCampus(locationId) {
        const index = getStopIndex(locationId);

        if (index === -1) return null;

        // Urutan halte 0–6: Kampus Ketintang
        // Urutan halte 7–10: Kampus Lidah Wetan
        return index <= 6 ? "Ketintang" : "Lidah Wetan";
    }

    function addMinutesToTime(time, minutes) {
        const [hours, mins] = time.split(":").map(Number);

        const totalMinutes = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMinutes / 60) % 24;
        const newMinutes = totalMinutes % 60;

        return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;
    }

    function matchesRoute(bus) {
        const pickupIndex = getStopIndex(savedBooking.pickupId);
        const destinationIndex = getStopIndex(
            savedBooking.destinationId
        );

        if (pickupIndex === -1 || destinationIndex === -1) {
            console.warn("ID lokasi tidak terdapat dalam rute:", {
                pickupId: savedBooking.pickupId,
                destinationId: savedBooking.destinationId
            });

            return false;
        }

        // Titik awal dan tujuan tidak boleh sama.
        if (pickupIndex === destinationIndex) {
            return false;
        }

        /*
         * Urutan indeks bertambah:
         * arah Ketintang menuju Lidah Wetan.
         *
         * Urutan indeks berkurang:
         * arah Lidah Wetan menuju Ketintang.
         */
        const requiredDirection =
            destinationIndex > pickupIndex
                ? "Ketintang"
                : "Lidah Wetan";

        return normalizeLocation(bus.from) ===
            normalizeLocation(requiredDirection);
    }

    const CAPACITY = 20;
    const TICKET_PRICE = 5000;

    // ========================================
    // 5. MEMBUAT JADWAL BERDASARKAN TANGGAL
    // ========================================

    function durationInMinutes(departure, arrival) {
        const [dh, dm] = departure.split(":").map(Number);
        const [ah, am] = arrival.split(":").map(Number);

        return (ah * 60 + am) - (dh * 60 + dm);
    }

    function getSchedulesForDate(dateISO) {
        const reverse = isReverseDay(dateISO);

        const pickupCampus = getCampus(savedBooking.pickupId);
        const destinationCampus = getCampus(
            savedBooking.destinationId
        );

        const sameCampus =
            pickupCampus !== null &&
            destinationCampus !== null &&
            pickupCampus === destinationCampus;

        return baseSchedules.map(schedule => {
            const vehicle = vehicles.find(
                item => item.id === schedule.id
            );

            const from = reverse
                ? schedule.to
                : schedule.from;

            const to = reverse
                ? schedule.from
                : schedule.to;

            // Satu kampus: 5 menit.
            // Antar-kampus: gunakan estimasi jadwal yang tersedia.
            const duration = sameCampus
                ? 5
                : durationInMinutes(
                    schedule.departure,
                    schedule.arrival
                );

            // Hitung ulang jam kedatangan.
            const arrival = addMinutesToTime(
                schedule.departure,
                duration
            );

            return {
                ...vehicle,
                ...schedule,
                from,
                to,
                departure: schedule.departure,
                arrival,
                stops: [from, to],
                capacity: CAPACITY,
                price: TICKET_PRICE,
                date: dateISO,
                duration
            };
        });
    }

    // ========================================
    // 6. INFORMASI PERJALANAN
    // ========================================

    if ($("#header-pickup")) {
        $("#header-pickup").textContent = pickup;
    }

    if ($("#header-destination")) {
        $("#header-destination").textContent = destination;
    }

    if ($("#summary-pickup")) {
        $("#summary-pickup").textContent = pickup;
    }

    if ($("#summary-destination")) {
        $("#summary-destination").textContent = destination;
    }

    if ($("#summary-passengers")) {
        $("#summary-passengers").textContent =
            `${passengers} orang`;
    }

    if ($("#trip-description")) {
        $("#trip-description").textContent =
            `Perjalanan ${pickup} menuju ${destination}.`;
    }

    // ========================================
    // 7. FORMAT TANGGAL
    // ========================================

    const dayNames = [
        "Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"
    ];

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];

    const fullMonthNames = [
        "Januari", "Februari", "Maret", "April",
        "Mei", "Juni", "Juli", "Agustus",
        "September", "Oktober", "November", "Desember"
    ];

    function formatFullDate(isoDate) {
        const date = parseLocalDate(isoDate);

        if (!date) return isoDate;

        return `${date.getDate()} ${fullMonthNames[date.getMonth()]
            } ${date.getFullYear()}`;
    }

    // ========================================
    // 8. PEMILIH TANGGAL
    // ========================================

    function renderDates() {
        if (!dateScroller) return;

        dateScroller.innerHTML = "";

        const baseDate = parseLocalDate(todayISO);

        for (let offset = 0; offset <= 14; offset++) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() + offset);

            const isoDate = dateToISO(date);
            const button = document.createElement("button");

            button.type = "button";
            button.className = "date-option";

            if (isoDate === selectedDate) {
                button.classList.add("active");
                button.setAttribute("aria-pressed", "true");
            } else {
                button.setAttribute("aria-pressed", "false");
            }

            const day = document.createElement("span");
            day.className = "date-day";
            day.textContent =
                offset === 0 ? "Hari ini" : dayNames[date.getDay()];

            const number = document.createElement("span");
            number.className = "date-number";
            number.textContent = date.getDate();

            const month = document.createElement("span");
            month.className = "date-month";
            month.textContent = monthNames[date.getMonth()];

            button.append(day, number, month);

            button.addEventListener("click", () => {
                selectedDate = isoDate;

                renderDates();
                renderBuses();

                dateScroller.querySelector(".active")
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center"
                    });
            });

            dateScroller.appendChild(button);
        }

        dateScroller.querySelector(".active")
            ?.scrollIntoView({
                behavior: "instant",
                block: "nearest",
                inline: "center"
            });
    }

    // ========================================
    // 9. KETERSEDIAAN KURSI
    // ========================================

    function getAvailableSeats(bus) {
        return Math.max(0, bus.capacity - bus.occupied);
    }

    function isAvailable(bus) {
        return getAvailableSeats(bus) >= passengers;
    }

    function formatRupiah(amount) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(amount);
    }

    // ========================================
    // 10. MEMBUAT TITIK RUTE
    // ========================================

    function createRouteItem(
        time,
        location,
        type,
        isLast = false
    ) {
        const item = document.createElement("div");
        item.className = "route-item";

        const marker = document.createElement("div");
        marker.className = "route-marker";

        const icon = document.createElement("span");
        icon.className = `route-icon ${type === "pickup"
            ? "pickup-icon"
            : "destination-icon"
            }`;

        icon.textContent = "●";
        marker.appendChild(icon);

        if (!isLast) {
            const line = document.createElement("span");
            line.className = "route-line";
            marker.appendChild(line);
        }

        const details = document.createElement("div");
        details.className = "route-details";

        const timeLocation = document.createElement("span");
        timeLocation.className = "route-time-location";
        timeLocation.textContent =
            `${displayTime(time)} - ${location}`;

        const caption = document.createElement("small");
        caption.textContent = type === "pickup"
            ? "Titik penjemputan"
            : "Titik tujuan";

        details.append(timeLocation, caption);
        item.append(marker, details);

        return item;
    }

    // ========================================
    // 11. MEMBUAT KARTU BUS
    // ========================================

    function createBusCard(bus) {
        const available = isAvailable(bus);

        const article = document.createElement("article");
        article.className = "bus-card";

        const main = document.createElement("div");
        main.className = "bus-card-main";

        const top = document.createElement("div");
        top.className = "bus-card-top";

        const identity = document.createElement("div");
        identity.className = "bus-identity";

        const title = document.createElement("h3");
        title.className = "bus-card-title";
        title.textContent = bus.name;

        const plate = document.createElement("span");
        plate.className = "bus-plate";
        plate.textContent = bus.plate;

        identity.append(title, plate);

        const statusWrap = document.createElement("div");
        statusWrap.className = "bus-status-wrap";

        const status = document.createElement("span");
        status.className =
            `bus-status ${available ? "" : "unavailable"}`;
        status.textContent = available ? "Tersedia" : "Penuh";

        const seatCount = document.createElement("span");
        seatCount.className = "seat-count";
        seatCount.textContent =
            `${bus.occupied}/${bus.capacity} kursi terisi`;

        statusWrap.append(status, seatCount);
        top.append(identity, statusWrap);

        const middle = document.createElement("div");
        middle.className = "bus-card-middle";

        const route = document.createElement("div");
        route.className = "bus-route";

        route.append(
            createRouteItem(
                bus.departure,
                pickup,
                "pickup"
            ),
            createRouteItem(
                bus.arrival,
                destination,
                "destination",
                true
            )
        );

        const price = document.createElement("div");
        price.className = "bus-price";

        const priceLabel = document.createElement("span");
        priceLabel.className = "bus-price-label";
        priceLabel.textContent = "Harga tiket";

        const priceValue = document.createElement("strong");
        priceValue.className = "bus-price-value";
        priceValue.textContent = formatRupiah(bus.price);

        const priceUnit = document.createElement("span");
        priceUnit.className = "bus-price-unit";
        priceUnit.textContent = "per orang";

        price.append(priceLabel, priceValue, priceUnit);
        middle.append(route, price);

        const bottom = document.createElement("div");
        bottom.className = "bus-card-bottom";

        const duration = document.createElement("div");
        duration.className = "bus-duration";

        const durationIcon = document.createElement("span");
        durationIcon.className = "duration-icon";
        durationIcon.textContent = "◷";

        const durationText = document.createElement("span");
        durationText.textContent =
            `Estimasi ${bus.duration} menit`;

        duration.append(durationIcon, durationText);


        const detailButton = document.createElement("button");
        detailButton.className = "detail-button";
        detailButton.type = "button";
        detailButton.textContent = "Pilih Kursi →";
        detailButton.disabled = !available;

        detailButton.addEventListener("click", () => {
            openSeatSelection(bus);
        });


        bottom.append(duration, detailButton);
        main.append(top, middle, bottom);
        article.appendChild(main);

        return article;
    }

    // ========================================
    // 12. FILTER WAKTU
    // ========================================

    function matchesTime(bus) {
        if (!requestedTime) return true;

        return bus.departure >= requestedTime;
    }

    // ========================================
    // 13. MENAMPILKAN BUS
    // ========================================

    function renderBuses() {
        if (!busList) return;

        busList.innerHTML = "";

        const dailySchedules = getSchedulesForDate(selectedDate);

        const filteredBuses = dailySchedules
            .filter(matchesRoute)
            .filter(matchesTime)
            .sort((a, b) =>
                a.departure.localeCompare(b.departure)
            );

        if (resultsCount) {
            resultsCount.textContent =
                `${filteredBuses.length} bus`;
        }

        if (resultsDescription) {
            resultsDescription.textContent =
                `${formatFullDate(selectedDate)} · ` +
                `${pickup} → ${destination}`;
        }

        if (emptyState) {
            emptyState.hidden = filteredBuses.length > 0;
        }

        filteredBuses.forEach(bus => {
            busList.appendChild(createBusCard(bus));
        });
    }

    
/* ========================================
   14. PEMILIHAN KURSI DALAM MODAL
======================================== */

let selectedBus = null;
let selectedSeats = [];

const seatGrid = $("#seat-grid");
const selectedSeatNumbers = $("#selected-seat-numbers");
const selectedSeatPrice = $("#selected-seat-price");
const seatNotice = $("#seat-notice");

const seatModalTitle = $("#modal-title");
const seatBusInfo = $("#seat-bus-info");
const seatConfirmButton = $("#modal-select-button");

// Penyimpanan kursi pilihan berdasarkan bus dan tanggal.
// Ini merupakan simulasi lokal, bukan database bersama.
function getSeatStorageKey(bus) {
    return `unesavelSeats_${bus.id}_${selectedDate}`;
}

function getBookedSeatNumbers(bus) {
    try {
        const saved = JSON.parse(
            localStorage.getItem(getSeatStorageKey(bus)) || "[]"
        );

        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

// Membuat 20 kursi dengan susunan 2-1 dan 4 kursi belakang.

function createSeatLayout() {
    return [
        { type: "front" },

        { type: "row", left: [1, 2], right: 3 },
        { type: "row", left: [4, 5], right: 6 },

        // Pintu samping, dengan kursi nomor 7 di sebelah kanannya
        { type: "side-door", right: 7 },

        { type: "row", left: [8, 9], right: 10 },
        { type: "row", left: [11, 12], right: 13 },
        { type: "row", left: [14, 15], right: 16 },

        // Empat kursi belakang berdempetan
        { type: "rear", seats: [17, 18, 19, 20] }
    ];
}

function getSeatNumber(number) {
    return String(number).padStart(2, "0");
}

function renderSeatMap() {
    if (!seatGrid || !selectedBus) return;

    seatGrid.innerHTML = "";

    const occupiedSeats = getBookedSeatNumbers(selectedBus);
    const layout = createSeatLayout();

    // Kursi bawaan yang dianggap sudah terisi.
    // Jumlahnya mengikuti properti occupied pada masing-masing bus.
    const initialOccupied = new Set();
    let candidate = 1;

    while (initialOccupied.size < selectedBus.occupied) {
        const seatNumber =
            ((candidate * 7 + selectedBus.id * 3) % 20) + 1;

        initialOccupied.add(seatNumber);
        candidate++;
    }

    function createSeatButton(number) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "seat-button";
        button.textContent = getSeatNumber(number);
        button.dataset.seat = String(number);

        const isOccupied =
            initialOccupied.has(number) ||
            occupiedSeats.includes(number);

        if (isOccupied) {
            button.classList.add("occupied");
            button.disabled = true;
            button.setAttribute(
                "aria-label",
                `Kursi ${getSeatNumber(number)}, terisi`
            );
        } else {
            if (selectedSeats.includes(number)) {
                button.classList.add("selected");
                button.setAttribute("aria-pressed", "true");
            } else {
                button.setAttribute("aria-pressed", "false");
            }

            button.setAttribute(
                "aria-label",
                `Pilih kursi ${getSeatNumber(number)}`
            );

            button.addEventListener("click", () => {
                toggleSeat(number);
            });
        }

        return button;
    }

    layout.forEach(item => {
        // Bagian depan bus: pintu depan dan kursi sopir
        if (item.type === "front") {
            const front = document.createElement("div");
            front.className = "seat-front-row";

            const frontDoor = document.createElement("div");
            frontDoor.className = "seat-door front-door";
            frontDoor.innerHTML = `
                <span class="door-symbol">↔</span>
                <span>PINTU DEPAN</span>
            `;

            const aisle = document.createElement("div");
            aisle.className = "seat-aisle";

            const driver = document.createElement("div");
            driver.className = "driver-seat";
            driver.innerHTML = `
                <span class="driver-symbol">◉</span>
                <span>SOPIR</span>
            `;

            front.append(frontDoor, aisle, driver);
            seatGrid.appendChild(front);
            return;
        }

        // Empat kursi yang saling berdempetan di belakang
        if (item.type === "rear") {
            const rear = document.createElement("div");
            rear.className = "seat-rear-row";

            item.seats.forEach(number => {
                rear.appendChild(createSeatButton(number));
            });

            seatGrid.appendChild(rear);
            return;
        }

        // Baris khusus pintu samping dan kursi nomor 7
        if (item.type === "side-door") {
            const row = document.createElement("div");
            row.className = "seat-layout-row side-door-row";

            const door = document.createElement("div");
            door.className = "seat-door side-door";
            door.innerHTML = `
                <span class="door-symbol">↔</span>
                <span>PINTU SAMPING</span>
            `;

            const aisle = document.createElement("div");
            aisle.className = "seat-aisle";

            row.append(
                door,
                aisle,
                createSeatButton(item.right)
            );

            seatGrid.appendChild(row);
            return;
        }

        // Baris reguler: dua kursi kiri, lorong, satu kursi kanan
        if (item.type === "row") {
            const row = document.createElement("div");
            row.className = "seat-layout-row";

            const leftPair = document.createElement("div");
            leftPair.className = "seat-left-pair";

            item.left.forEach(number => {
                leftPair.appendChild(createSeatButton(number));
            });

            const aisle = document.createElement("div");
            aisle.className = "seat-aisle";

            row.append(
                leftPair,
                aisle,
                createSeatButton(item.right)
            );

            seatGrid.appendChild(row);
        }
    });

    updateSeatSummary();
}
function toggleSeat(number) {
    if (!selectedBus) return;

    const occupiedSeats = getBookedSeatNumbers(selectedBus);

    if (occupiedSeats.includes(number)) return;

    const alreadySelected = selectedSeats.includes(number);

    if (alreadySelected) {
        selectedSeats = selectedSeats.filter(
            seat => seat !== number
        );
    } else {
        if (selectedSeats.length >= passengers) {
            showSeatNotice(
                `Kamu hanya dapat memilih ${passengers} kursi ` +
                "sesuai jumlah penumpang."
            );
            return;
        }

        selectedSeats.push(number);
    }

    selectedSeats.sort((a, b) => a - b);

    renderSeatMap();

    if (seatNotice) {
        seatNotice.hidden = true;
    }
}

function updateSeatSummary() {
    if (!selectedBus) return;

    if (selectedSeatNumbers) {
        selectedSeatNumbers.textContent = selectedSeats.length
            ? selectedSeats.map(getSeatNumber).join(", ")
            : "Belum dipilih";
    }

    if (selectedSeatPrice) {
        selectedSeatPrice.textContent = formatRupiah(
            selectedSeats.length * selectedBus.price
        );
    }

    if (seatConfirmButton) {
        seatConfirmButton.disabled =
            selectedSeats.length !== passengers;

        seatConfirmButton.textContent =
            selectedSeats.length === passengers
                ? "Konfirmasi Kursi"
                : `Pilih ${passengers - selectedSeats.length} kursi lagi`;
    }
}

function showSeatNotice(message) {
    if (!seatNotice) return;

    seatNotice.textContent = message;
    seatNotice.hidden = false;
}

function openSeatSelection(bus) {
    selectedBus = bus;
    selectedSeats = [];

    seatModalTitle.textContent = "Pilih Kursi";
    seatBusInfo.textContent = `${bus.name} · ${bus.plate}`;

    $("#modal-pickup").textContent = pickup;
    $("#modal-destination").textContent = destination;

    if (seatNotice) {
        seatNotice.hidden = true;
        seatNotice.textContent = "";
    }

    renderSeatMap();

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modalClose.focus();
}

function closeSeatSelection() {
    modal.hidden = true;
    document.body.style.overflow = "";

    selectedBus = null;
    selectedSeats = [];
}

modalClose.addEventListener("click", closeSeatSelection);

modal.addEventListener("click", event => {
    if (event.target === modal) {
        closeSeatSelection();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.hidden) {
        closeSeatSelection();
    }
});

/* ========================================
   15. KONFIRMASI KURSI
======================================== */


seatConfirmButton.addEventListener("click", () => {
    if (!selectedBus) return;

    if (selectedSeats.length !== passengers) {
        showSeatNotice(
            `Pilih tepat ${passengers} kursi sebelum melanjutkan.`
        );
        return;
    }

    const occupiedSeats = getBookedSeatNumbers(selectedBus);

    if (selectedSeats.some(seat => occupiedSeats.includes(seat))) {
        showSeatNotice(
            "Ada kursi yang sudah terisi. Silakan pilih kursi lain."
        );
        selectedSeats = [];
        renderSeatMap();
        return;
    }

    const selectedTrip = {
        ...savedBooking,
        pickup,
        destination,
        date: selectedDate,
        passengers,
        busId: selectedBus.id,
        busName: selectedBus.name,
        busPlate: selectedBus.plate,
        departureTime: selectedBus.departure,
        arrivalTime: selectedBus.arrival,
        seatNumbers: selectedSeats.map(getSeatNumber),
        pricePerPerson: selectedBus.price,
        totalPrice: selectedSeats.length * selectedBus.price
    };

    // Simpan data untuk halaman konfirmasi
    localStorage.setItem(
        "unesavelSelectedTrip",
        JSON.stringify(selectedTrip)
    );

    // Ubah label tombol
    seatConfirmButton.textContent = "Memproses...";
    seatConfirmButton.disabled = true;

    // Pindah ke halaman konfirmasi
    window.location.href = "confirmation.html";
});

    // ========================================
    // 16. JALANKAN HALAMAN
    // ========================================

    renderDates();
    renderBuses();
});