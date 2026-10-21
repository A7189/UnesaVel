
document.addEventListener("DOMContentLoaded", () => {
    const $ = selector => document.querySelector(selector);

    // ==========================================
    // 1. AMBIL DATA PEMESANAN
    // ==========================================

    let trip = null;

    try {
        trip = JSON.parse(
            localStorage.getItem("unesavelSelectedTrip") || "null"
        );
    } catch (error) {
        console.error("Data perjalanan tidak valid:", error);
    }

    const content = $("#confirmation-content");
    const pageError = $("#page-error");

    if (
        !trip ||
        !Array.isArray(trip.seatNumbers) ||
        trip.seatNumbers.length === 0
    ) {
        if (pageError) pageError.hidden = false;
        if (content) content.hidden = true;
        return;
    }

    if (content) content.hidden = false;
    if (pageError) pageError.hidden = true;

    // ==========================================
    // 2. HITUNG HARGA DAN PENUMPANG
    // ==========================================

    const passengerCount = Math.max(
        1,
        Number(trip.passengers) || trip.seatNumbers.length
    );

    const pricePerPerson = Math.max(
        0,
        Number(trip.pricePerPerson) || 0
    );

    const savedTotal = Number(trip.totalPrice) || 0;

    const originalPrice = savedTotal > 0
        ? savedTotal
        : pricePerPerson * passengerCount;

    let activeVoucher = null;
    let discount = 0;
    let paymentCompleted = false;
    let isProcessingPayment = false;

    const rupiah = amount =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(amount);

    function showValue(selector, value) {
        const element = $(selector);

        if (element) {
            element.textContent =
                value !== undefined &&
                value !== null &&
                value !== ""
                    ? value
                    : "-";
        }
    }

    function formatDate(value) {
        if (!value) return "-";

        const parts = String(value).split("-");

        if (parts.length !== 3) return value;

        const date = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );

        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    // ==========================================
    // 3. TAMPILKAN RINCIAN PERJALANAN
    // ==========================================

    showValue("#bus-name", trip.busName || "Bus UNESA Vel");
    showValue("#bus-plate", trip.busPlate);
    showValue("#pickup", trip.pickup);
    showValue("#destination", trip.destination);
    showValue("#departure-time", trip.departureTime);
    showValue("#arrival-time", trip.arrivalTime);
    showValue("#trip-date", formatDate(trip.date));
    showValue("#passengers", `${passengerCount} orang`);
    showValue("#seat-numbers", trip.seatNumbers.join(", "));

    showValue("#price-per-person", rupiah(pricePerPerson));
    showValue("#passenger-count", `${passengerCount} orang`);
    showValue("#original-price", rupiah(originalPrice));

    // ==========================================
    // 4. VOUCHER
    // ==========================================

    const promoForm = $("#promo-form");
    const promoInput = $("#promo-code");
    const promoMessage = $("#promo-message");
    const removePromoButton = $("#remove-promo");
    const promoButton = $("#promo-button");

    const discountRow = $("#discount-row");
    const oldPrice = $("#price-before-discount");
    const payButton = $("#pay-button");

    function setPromoMessage(message, type = "") {
        if (!promoMessage) return;

        promoMessage.textContent = message;
        promoMessage.className = `form-message ${type}`;
    }

    function updatePrice() {
        const finalAmount = Math.max(
            0,
            originalPrice - discount
        );

        showValue("#original-price", rupiah(originalPrice));
        showValue("#discount-amount", `−${rupiah(discount)}`);
        showValue("#final-price", rupiah(finalAmount));

        if (discountRow) {
            discountRow.hidden = discount <= 0;
        }

        if (oldPrice) {
            oldPrice.hidden = discount <= 0;

            if (discount > 0) {
                oldPrice.textContent = rupiah(originalPrice);
            }
        }

        if (payButton) {
            payButton.textContent = paymentCompleted
                ? "Pembayaran Berhasil ✓"
                : "Bayar Sekarang";

            payButton.disabled =
                paymentCompleted ||
                isProcessingPayment ||
                originalPrice <= 0;
        }
    }

    if (promoForm) {
        promoForm.addEventListener("submit", event => {
            event.preventDefault();

            if (paymentCompleted || isProcessingPayment) return;

            const code = promoInput.value.trim().toUpperCase();

            if (!code) {
                setPromoMessage(
                    "Masukkan kode voucher terlebih dahulu.",
                    "error"
                );
                return;
            }

            if (code === "UNESA10") {
                activeVoucher = code;
                discount = Math.round(originalPrice * 0.10);

                promoInput.value = code;
                promoInput.disabled = true;

                if (promoButton) promoButton.disabled = true;

                if (removePromoButton) {
                    removePromoButton.hidden = false;
                }

                setPromoMessage(
                    "Voucher UNESA10 berhasil digunakan. Diskon 10%.",
                    "success"
                );
            } else {
                activeVoucher = null;
                discount = 0;

                setPromoMessage(
                    "Kode voucher tidak valid. Coba UNESA10.",
                    "error"
                );
            }

            updatePrice();
        });
    }

    if (removePromoButton) {
        removePromoButton.addEventListener("click", () => {
            if (paymentCompleted || isProcessingPayment) return;

            activeVoucher = null;
            discount = 0;

            if (promoInput) {
                promoInput.disabled = false;
                promoInput.value = "";
            }

            if (promoButton) promoButton.disabled = false;

            removePromoButton.hidden = true;

            setPromoMessage("Voucher berhasil dihapus.");

            updatePrice();
        });
    }

    // ==========================================
    // 5. METODE PEMBAYARAN
    // ==========================================

    const methodToggle = $("#payment-method-toggle");
    const methodList = $("#payment-options-list");
    const methodChevron = $("#payment-chevron");

    const methodDisplay = {
        QRIS: {
            logo: "QRIS",
            name: "QRIS",
            description: "Pembayaran melalui kode QR",
            className: "logo-qris"
        },
        DANA: {
            logo: "DANA",
            name: "DANA",
            description: "Pembayaran melalui e-wallet",
            className: "logo-dana"
        },
        OVO: {
            logo: "OVO",
            name: "OVO",
            description: "Pembayaran melalui e-wallet",
            className: "logo-ovo"
        },
        BCA: {
            logo: "BCA",
            name: "Transfer BCA",
            description: "Simulasi transfer bank",
            className: "logo-bca"
        },
        BRI: {
            logo: "BRI",
            name: "Transfer BRI",
            description: "Simulasi transfer bank",
            className: "logo-bri"
        },
        BNI: {
            logo: "BNI",
            name: "Transfer BNI",
            description: "Simulasi transfer bank",
            className: "logo-bni"
        },
        Mandiri: {
            logo: "BM",
            name: "Mandiri",
            description: "Simulasi transfer bank",
            className: "logo-mandiri"
        }
    };

    function updateMethodDisplay(value) {
        const item = methodDisplay[value];

        if (!item) return;

        const logo = $("#current-payment-logo");

        if (logo) {
            logo.textContent = item.logo;
            logo.className = `payment-logo ${item.className}`;
        }

        showValue("#current-payment-name", item.name);
        showValue("#current-payment-description", item.description);
    }

    function closeMethodList() {
        if (methodList) methodList.hidden = true;

        if (methodToggle) {
            methodToggle.setAttribute("aria-expanded", "false");
        }

        if (methodChevron) {
            methodChevron.classList.remove("fa-chevron-up");
            methodChevron.classList.add("fa-chevron-down");
        }
    }

    if (methodToggle && methodList) {
        methodToggle.addEventListener("click", () => {
            if (paymentCompleted || isProcessingPayment) return;

            const willOpen = methodList.hidden;

            methodList.hidden = !willOpen;

            methodToggle.setAttribute(
                "aria-expanded",
                String(willOpen)
            );

            if (methodChevron) {
                methodChevron.classList.toggle(
                    "fa-chevron-up",
                    willOpen
                );

                methodChevron.classList.toggle(
                    "fa-chevron-down",
                    !willOpen
                );
            }
        });
    }

    const paymentRadios = methodList
        ? methodList.querySelectorAll(
            'input[name="payment-method"]'
        )
        : [];

    paymentRadios.forEach(input => {
        input.addEventListener("change", () => {
            updateMethodDisplay(input.value);
            closeMethodList();
        });
    });

    const initiallySelected = methodList
        ? methodList.querySelector(
            'input[name="payment-method"]:checked'
        )
        : null;

    if (initiallySelected) {
        updateMethodDisplay(initiallySelected.value);
    }

    // ==========================================
    // 6. MODAL PEMBAYARAN SIMULASI
    // ==========================================

    const paymentModal = $("#payment-modal");

    const paymentInstructions = {
        QRIS: {
            title: "QRIS",
            instruction:
                "Ilustrasi QR ini hanya untuk demonstrasi dan tidak bisa digunakan untuk membayar.",
            referenceLabel: "",
            reference: ""
        },
        DANA: {
            title: "DANA",
            instruction:
                "Simulasi pembayaran DANA. Tidak ada saldo sungguhan yang digunakan.",
            referenceLabel: "Status pembayaran",
            reference: "DEMO SAJA"
        },
        OVO: {
            title: "OVO",
            instruction:
                "Simulasi pembayaran OVO. Tidak ada saldo sungguhan yang digunakan.",
            referenceLabel: "Status pembayaran",
            reference: "DEMO SAJA"
        },
        BCA: {
            title: "Transfer BCA",
            instruction:
                "Simulasi transfer BCA. Ini bukan rekening sungguhan.",
            referenceLabel: "Nomor virtual account demo",
            reference: "BCA-DEMO"
        },
        BRI: {
            title: "Transfer BRI",
            instruction:
                "Simulasi transfer BRI. Ini bukan rekening sungguhan.",
            referenceLabel: "Nomor virtual account demo",
            reference: "BRI-DEMO"
        },
        BNI: {
            title: "Transfer BNI",
            instruction:
                "Simulasi transfer BNI. Ini bukan rekening sungguhan.",
            referenceLabel: "Nomor virtual account demo",
            reference: "BNI-DEMO"
        },
        Mandiri: {
            title: "Transfer Mandiri",
            instruction:
                "Simulasi transfer Mandiri. Ini bukan rekening sungguhan.",
            referenceLabel: "Nomor virtual account demo",
            reference: "MANDIRI-DEMO"
        }
    };

    if (payButton) {
        payButton.addEventListener("click", () => {
            if (paymentCompleted || isProcessingPayment) return;

            if (originalPrice <= 0) {
                alert(
                    "Harga tiket belum tersedia. " +
                    "Periksa kembali data bus yang dipilih."
                );
                return;
            }

            const method = methodList
                ? methodList.querySelector(
                    'input[name="payment-method"]:checked'
                )
                : null;

            if (!method || !paymentInstructions[method.value]) {
                alert("Silakan pilih metode pembayaran.");
                return;
            }

            const selectedMethod = method.value;
            const details = paymentInstructions[selectedMethod];

            const finalAmount = Math.max(
                0,
                originalPrice - discount
            );

            showValue("#modal-total", rupiah(finalAmount));
            showValue("#modal-method-name", details.title);
            showValue("#modal-instruction", details.instruction);

            const visual = $("#modal-payment-visual");
            const reference = $("#modal-reference");

            if (visual) {
                if (selectedMethod === "QRIS") {
                    visual.innerHTML = `
                        <div class="fake-qr" aria-label="QR demo">
                            <div class="fake-qr-inner">
                                <span>QR</span>
                                <strong>DEMO</strong>
                            </div>
                        </div>
                    `;
                } else {
                    const icon = ["DANA", "OVO"].includes(selectedMethod)
                        ? "fa-wallet"
                        : "fa-building-columns";

                    visual.innerHTML = `
                        <div class="payment-method-illustration">
                            <i class="fa-solid ${icon}"></i>
                            <strong>${details.title}</strong>
                            <span>SIMULASI PEMBAYARAN</span>
                        </div>
                    `;
                }
            }

            if (reference) {
                reference.hidden = !details.reference;
            }

            showValue("#modal-reference-label", details.referenceLabel);
            showValue("#modal-reference-value", details.reference);

            if (paymentModal) {
                paymentModal.hidden = false;
            }
        });
    }

    const closeModalButton = $("#close-payment-modal");

    if (closeModalButton && paymentModal) {
        closeModalButton.addEventListener("click", () => {
            if (isProcessingPayment) return;
            paymentModal.hidden = true;
        });

        paymentModal.addEventListener("click", event => {
            if (
                event.target === paymentModal &&
                !isProcessingPayment
            ) {
                paymentModal.hidden = true;
            }
        });
    }

    // ==========================================
    // 7. SIMPAN PEMBAYARAN DAN BUAT TIKET
    // ==========================================

    const simulateButton = $("#simulate-payment");

    function createTicketId(existingTickets) {
        let ticketId;

        do {
            ticketId =
                "UV-" +
                Date.now().toString(36).toUpperCase() +
                "-" +
                Math.random().toString(36).slice(2, 6).toUpperCase();
        } while (
            existingTickets.some(
                ticket => ticket.ticketId === ticketId
            )
        );

        return ticketId;
    }

    function readTickets() {
        const raw = localStorage.getItem("unesavelTickets");

        if (!raw) return [];

        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
            throw new Error("Format daftar tiket tidak valid.");
        }

        return parsed;
    }

    function setPaymentControlsDisabled(disabled) {
        if (simulateButton) simulateButton.disabled = disabled;
        if (payButton) payButton.disabled = disabled || originalPrice <= 0;

        paymentRadios.forEach(radio => {
            radio.disabled = disabled;
        });

        if (promoInput) promoInput.disabled = disabled || !!activeVoucher;
        if (promoButton) promoButton.disabled = disabled || !!activeVoucher;

        if (removePromoButton) {
            removePromoButton.disabled = disabled;
        }
    }

    if (simulateButton) {
        simulateButton.addEventListener("click", () => {
            if (paymentCompleted || isProcessingPayment) return;

            const method = methodList
                ? methodList.querySelector(
                    'input[name="payment-method"]:checked'
                )
                : null;

            if (!method || !paymentInstructions[method.value]) {
                alert("Silakan pilih metode pembayaran.");
                return;
            }

            if (originalPrice <= 0) {
                alert("Total pembayaran tidak valid.");
                return;
            }

            isProcessingPayment = true;
            setPaymentControlsDisabled(true);

            try {
                // Baca data tiket sebelumnya tanpa menghapusnya.
                const tickets = readTickets();

                const finalAmount = Math.max(
                    0,
                    originalPrice - discount
                );

                const ticketId = createTicketId(tickets);
                const paidAt = new Date().toISOString();

                const paymentData = {
                    ...trip,

                    ticketId,
                    voucher: activeVoucher,
                    originalPrice,
                    discount,
                    totalPaid: finalAmount,

                    paymentMethod: method.value,
                    paymentStatus: "Berhasil (Simulasi)",
                    ticketStatus: "Aktif",
                    paidAt
                };

                // Simpan seluruh tiket, termasuk tiket sebelumnya.
                tickets.unshift(paymentData);

                localStorage.setItem(
                    "unesavelTickets",
                    JSON.stringify(tickets)
                );

                // Pertahankan key pembayaran lama.
                localStorage.setItem(
                    "unesavelPayment",
                    JSON.stringify(paymentData)
                );

                // Tandai tiket yang akan dibuka di halaman detail.
                localStorage.setItem(
                    "unesavelSelectedTicketId",
                    ticketId
                );

                // Baru tandai pembayaran berhasil setelah penyimpanan.
                paymentCompleted = true;

                if (paymentModal) {
                    paymentModal.hidden = true;
                }

                if (promoInput) promoInput.disabled = true;
                if (promoButton) promoButton.disabled = true;

                if (removePromoButton) {
                    removePromoButton.disabled = true;
                }

                const status = $(".status-pill");

                if (status) {
                    status.textContent = "Pembayaran berhasil";
                    status.style.background = "#dcfce7";
                    status.style.color = "#166534";
                }

                updatePrice();

                alert(
                    "Simulasi pembayaran berhasil!\n\n" +
                    `ID tiket: ${ticketId}\n` +
                    `Bus: ${trip.busName || "Bus UNESA Vel"}\n` +
                    `Kursi: ${trip.seatNumbers.join(", ")}\n` +
                    `Metode: ${method.value}\n` +
                    `Total: ${rupiah(finalAmount)}\n\n` +
                    "Tiket telah disimpan. Tidak ada uang sungguhan yang dipotong."
                );

                // confirmation.html dan ticket-detail.html berada
                // dalam folder pages yang sama.
                window.location.href = "ticket-detail.html";

            } catch (error) {
                console.error("Gagal menyimpan tiket:", error);

                isProcessingPayment = false;
                setPaymentControlsDisabled(false);
                updatePrice();

                alert(
                    "Pembayaran simulasi belum dapat disimpan.\n" +
                    "Silakan coba lagi.\n\n" +
                    "Detail: " + error.message
                );
            }
        });
    }

    // ==========================================
    // 8. HARGA AWAL
    // ==========================================

    updatePrice();
});
