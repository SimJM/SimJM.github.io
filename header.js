// Header management logic
window.headerManager = {
	// Configuration for each page
	pageConfig: {
		"index.html": {
			logo: "&#128640; Jia Ming - Coding Dreams into Reality",
			hideNavItems: [
				"book-nav-item",
				"number-nav-item",
				"loan-nav-item",
				"wordle-nav-item",
				"admin-nav-item",
				"tango-nav-item",
			],
		},
		"portfolio.html": {
			logo: "&#128640; Portfolio - My Professional Journey",
			hideNavItems: [
				"book-nav-item",
				"number-nav-item",
				"loan-nav-item",
				"wordle-nav-item",
				"admin-nav-item",
				"tango-nav-item",
			],
		},
		"bookPage.html": {
			logo: "&#x1F3F8; Badminton Booking",
			hideNavItems: [],
		},
		"number.html": {
			logo: "&#x1F52E; Number Analysis",
			hideNavItems: [],
		},
		"loan.html": {
			logo: "&#x1F4B0; Loan Calculator",
			hideNavItems: [],
		},
		"wordle.html": {
			logo: "&#x1F4DD; Bailey Wordle",
			hideNavItems: [
				"book-nav-item",
				"number-nav-item",
				"loan-nav-item",
				"wordle-nav-item",
				"admin-nav-item",
				"tango-nav-item",
			],
		},
		"wordle-admin.html": {
			logo: "&#x1F6E0; Wordle Admin",
			hideNavItems: [],
		},
		"tango.html": {
			logo: "&#x1F3AF; Oakley Tango",
			hideNavItems: [
				"book-nav-item",
				"number-nav-item",
				"loan-nav-item",
				"wordle-nav-item",
				"admin-nav-item",
				"tango-nav-item",
			],
		},
		"tango-admin.html": {
			logo: "&#x1F6E0; Tango Admin",
			hideNavItems: [],
		},
	},

	// Get current page filename or directory name
	getCurrentPage() {
		const path = window.location.pathname;
		const segments = path.split("/").filter(Boolean);
		
		// If we're in a subdirectory with index.html
		if (segments.length > 1 && segments[segments.length - 1] === "index.html") {
			// Return the directory name + .html (e.g., "Portfolio" -> "portfolio.html")
			return segments[segments.length - 2].toLowerCase() + ".html";
		}
		
		// Otherwise, return the filename
		return path.substring(path.lastIndexOf("/") + 1) || "index.html";
	},

	// Load and configure header
	loadHeader() {
		// Determine header path based on current location
		const path = window.location.pathname;
		const headerPath = path.includes("/") && !path.endsWith("/") && path.split("/").length > 2
			? "../header.html"
			: "header.html";
			
		return fetch(headerPath)
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
