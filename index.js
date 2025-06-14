// Use shared.js for all shared logic
window.addEventListener("DOMContentLoaded", () => {
    window.shared.handleDarkMode();

    // DOM elements
    const venueSelect = document.getElementById("venueSelect");
    const timeSelect = document.getElementById("timeSelect");
    const bookNowBtn = document.getElementById("bookNowBtn");

    // Populate dropdowns if present
    if (venueSelect) {
        venueSelect.innerHTML = Object.entries(window.shared.venues)
            .map(
                ([id, name]) =>
                `<option value="${id}"${
						id === "cRyHuTcU77VZY7Er3jVf5" ? " selected" : ""
					}>${name}</option>`
            )
            .join("");
    }
    if (timeSelect) {
        timeSelect.innerHTML = [
                { value: "9-11", label: "9am - 11am" },
                { value: "10-12", label: "10am - 12pm" },
                { value: "19-21", label: "7pm - 9pm" },
                { value: "20-22", label: "8pm - 10pm" },
            ]
            .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
            .join("");
    }

    // Standardized navigation for all tabs and Book Now button
    function handleNav(e) {
        e.preventDefault();
        const target = e.currentTarget.getAttribute("data-target");
        if (!target) return;
        if (target === "home") {
            window.location.href = "index.html";
        } else if (target === "book") {
            window.location.href = "bookPage.html";
        } else if (target === "portfolio") {
            window.location.href = "portfolio.html";
        } else {
            // For About, Skills, Contact, etc. (add logic as needed)
        }
    }

    // Assign navigation handler to all nav tabs
    const navTabs = ["#homeTab", 'a[style*="--navAni:4"]'];
    navTabs.forEach((selector) => {
        const el = document.querySelector(selector);
        if (el) {
            el.removeEventListener("click", handleNav);
            el.addEventListener("click", handleNav);
        }
    });

    // Book Now button uses same handler
    if (bookNowBtn) {
        bookNowBtn.setAttribute("data-target", "book");
        bookNowBtn.removeEventListener("click", handleNav);
        bookNowBtn.addEventListener("click", handleNav);
    }
});