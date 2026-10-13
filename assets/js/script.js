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
