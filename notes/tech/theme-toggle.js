(function () {
	const STORAGE_KEY = "notes-tech-theme";
	const html = document.documentElement;

	function setTheme(theme) {
		const isLight = theme === "light";
		html.dataset.theme = theme;

		const toggle = document.querySelector(".theme-toggle");
		if (!toggle) return;

		const label = toggle.querySelector(".theme-toggle__label");
		const icon = toggle.querySelector(".theme-toggle__icon");

		if (label) {
			label.textContent = isLight ? "Dark mode" : "Light mode";
		}

		if (icon) {
			icon.textContent = isLight ? "🌙" : "☀️";
		}

		toggle.setAttribute("aria-pressed", String(isLight));
		toggle.setAttribute(
			"aria-label",
			isLight ? "Switch to dark mode" : "Switch to light mode",
		);
		localStorage.setItem(STORAGE_KEY, theme);
	}

	function ensureToggle() {
		const header = document.querySelector("header");
		if (!header || header.querySelector(".theme-toggle")) return;

		const button = document.createElement("button");
		button.type = "button";
		button.className = "theme-toggle";
		button.setAttribute("aria-label", "Toggle light and dark mode");
		button.innerHTML =
			'<span class="theme-toggle__icon" aria-hidden="true">☀️</span><span class="theme-toggle__label">Light mode</span>';
		button.addEventListener("click", () => {
			const nextTheme = html.dataset.theme === "light" ? "dark" : "light";
			setTheme(nextTheme);
		});

		header.appendChild(button);
	}

	function applyInitialTheme() {
		const savedTheme = localStorage.getItem(STORAGE_KEY);
		const preferredTheme = window.matchMedia(
			"(prefers-color-scheme: light)",
		).matches
			? "light"
			: "dark";
		const theme = savedTheme || preferredTheme;
		setTheme(theme);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			ensureToggle();
			applyInitialTheme();
		});
	} else {
		ensureToggle();
		applyInitialTheme();
	}
})();
