// Shared logic for both index and bookPage
window.shared = {
	venues: {
		DS2Y95tMEksERLSJfBSBz: "Bowen Sec Sch",
		a3jznoZlsfyJrl43Tbnog: "Delta Sports Hall",
		cRyHuTcU77VZY7Er3jVf5: "Sengkang Sports Hall",
		rhK3pSR5ifFrB2AVCMOeK: "Yio Chu Kang Pri Sch",
	},
	timeSlotMap: {
		"9-11": [9, 10],
		"10-12": [10, 11],
		"19-21": [19, 20],
		"20-22": [20, 21],
	},
	getDateTwoWeeksFromToday() {
		const today = new Date();
		today.setDate(today.getDate() + 14);
		return today.toISOString().slice(0, 10);
	},
	getDayOfWeek(dateStr) {
		return new Date(dateStr).toLocaleDateString(undefined, {
			weekday: "long",
		});
	},
	handleDarkMode() {
		const darkModeToggle = document.getElementById("darkModeToggle");
		const body = document.body;
		if (!darkModeToggle) return;
		if (localStorage.getItem("darkMode") === "enabled") {
			body.classList.add("dark-mode");
			darkModeToggle.checked = true;
		}
		darkModeToggle.addEventListener("change", () => {
			body.classList.toggle("dark-mode", darkModeToggle.checked);
			localStorage.setItem(
				"darkMode",
				darkModeToggle.checked ? "enabled" : "disabled"
			);
		});
	},
};
