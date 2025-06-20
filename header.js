// Header management logic
window.headerManager = {
	// Configuration for each page
	pageConfig: {
		"index.html": {
			logo: "&#128640; Jia Ming - Coding Dreams into Reality",
			hideNavItems: ["book-nav-item", "number-nav-item"],
		},
		"portfolio.html": {
			logo: "&#128640; Portfolio - My Professional Journey",
			hideNavItems: ["book-nav-item", "number-nav-item"],
		},
		"bookPage.html": {
			logo: "&#x1F3F8; Badminton Booking",
			hideNavItems: [],
		},
		"number.html": {
			logo: "&#x1F52E; Number Analysis",
			hideNavItems: [],
		},
	},

	// Get current page filename
	getCurrentPage() {
		const path = window.location.pathname;
		return path.substring(path.lastIndexOf("/") + 1) || "index.html";
	},

	// Load and configure header
	loadHeader() {
		return fetch("header.html")
			.then((response) => response.text())
			.then((data) => {
				document.getElementById("header-placeholder").innerHTML = data;
				this.configureHeader();
				this.initializeDarkMode();
			})
			.catch((error) => {
				console.error("Error loading header:", error);
			});
	},

	// Configure header based on current page
	configureHeader() {
		const currentPage = this.getCurrentPage();
		const config = this.pageConfig[currentPage];

		if (!config) {
			console.warn(`No configuration found for page: ${currentPage}`);
			return;
		}

		// Set page-specific logo
		const logo = document.getElementById("dynamic-logo");
		if (logo && config.logo) {
			logo.innerHTML = config.logo;
		}

		// Hide specified navigation items
		config.hideNavItems.forEach((itemId) => {
			const navItem = document.getElementById(itemId);
			if (navItem) {
				navItem.style.display = "none";
			}
		});
	},

	// Initialize dark mode after header is loaded
	initializeDarkMode() {
		if (
			window.shared &&
			typeof window.shared.handleDarkMode === "function"
		) {
			window.shared.handleDarkMode();
		}
	},
};
