
/* ==========================================
   UNESAVEL - TICKET DETAIL
   QR Code E-Ticket
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const qrContainer = document.getElementById("ticket-qr");
    const qrId = document.getElementById("ticket-qr-id");
    const qrError = document.getElementById("ticket-qr-error");

    if (!qrContainer) return;

    let ticket = null;

    try {
        const selectedId = localStorage.getItem(
            "unesavelSelectedTicketId"
        );

        const tickets = JSON.parse(
            localStorage.getItem("unesavelTickets") || "[]"
        );

        const lastPayment = JSON.parse(
            localStorage.getItem("unesavelPayment") || "null"
        );

        if (selectedId && Array.isArray(tickets)) {
            ticket = tickets.find(
                item => item.ticketId === selectedId
            );
        }

        if (
            !ticket &&
            lastPayment &&
            (!selectedId || lastPayment.ticketId === selectedId)
        ) {
            ticket = lastPayment;
        }
    } catch (error) {
        console.error("Gagal membaca data e-ticket:", error);
    }

    if (!ticket || !ticket.ticketId) return;

    const status = String(ticket.paymentStatus || "").toLowerCase();

    if (!status.includes("berhasil")) return;

    if (qrId) {
        qrId.textContent = ticket.ticketId;
    }

    if (typeof QRCode === "undefined") {
        if (qrError) qrError.hidden = false;
        return;
    }

    qrContainer.replaceChildren();

    try {
        new QRCode(qrContainer, {
            text: JSON.stringify({
                app: "UNESA Vel",
                ticketId: ticket.ticketId
            }),
            width: 180,
            height: 180,
            correctLevel: QRCode.CorrectLevel.M
        });

        if (qrError) qrError.hidden = true;
    } catch (error) {
        console.error("Gagal membuat QR Code:", error);

        if (qrError) qrError.hidden = false;
    }
});
