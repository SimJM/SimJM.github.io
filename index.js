// Use shared.js for all shared logic
window.addEventListener("DOMContentLoaded", () => {
    window.shared.handleDarkMode();

    // DOM elements
    const homeTab = document.getElementById("homeTab");
    const bookTab = document.getElementById("bookTab");
    const mainSection = document.getElementById("mainSection");
    const bookSection = document.getElementById("bookSection");
    const bookNowBtn = document.getElementById("bookNowBtn");
    const venueSelect = document.getElementById("venueSelect");
    const bookDateDisplay = document.getElementById("bookDateDisplay");
    const timeSelect = document.getElementById("timeSelect");

    function updateBookDateDisplay() {
        const date = window.shared.getDateTwoWeeksFromToday();
        const day = window.shared.getDayOfWeek(date);
        if (bookDateDisplay)
            bookDateDisplay.textContent = `Booking Date: ${date} (${day})`;
    }

    function populateVenueDropdown() {
        if (!venueSelect) return;
        venueSelect.innerHTML = Object.entries(window.shared.venues)
            .map(
                ([id, name]) =>
                `<option value="${id}"${
						id === "cRyHuTcU77VZY7Er3jVf5" ? " selected" : ""
					}>${name}</option>`
            )
            .join("");
    }

    function populateTimeDropdown() {
        if (!timeSelect) return;
        timeSelect.innerHTML = [
                { value: "9-11", label: "9am - 11am" },
                { value: "10-12", label: "10am - 12pm" },
                { value: "19-21", label: "7pm - 9pm" },
                { value: "20-22", label: "8pm - 10pm" },
            ]
            .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
            .join("");
    }

    function showTab(isBook) {
        if (!homeTab || !bookTab || !mainSection || !bookSection) return;
        homeTab.classList.toggle("active", !isBook);
        bookTab.classList.toggle("active", isBook);
        mainSection.style.display = isBook ? "none" : "";
        bookSection.style.display = isBook ? "" : "none";
        if (isBook) updateBookDateDisplay();
    }

    if (homeTab) {
        homeTab.addEventListener("click", (e) => {
            e.preventDefault();
            showTab(false);
        });
    }

    if (bookTab) {
        bookTab.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "bookPage.html";
        });
    }

    if (bookNowBtn) {
        bookNowBtn.addEventListener("click", () => {
            window.location.href = "bookPage.html";
        });
    }

    const portfolioTab = document.querySelector('a[style*="--navAni:4"]');
    if (portfolioTab) {
        portfolioTab.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "portfolio.html";
        });
    }

    populateVenueDropdown();
    populateTimeDropdown();
    showTab(window.location.hash === "#book");
});