// Book page JS logic
// Use shared.js for all shared logic
window.addEventListener("DOMContentLoaded", () => {
	window.shared.handleDarkMode();

	const venueSelect = document.getElementById("venueSelect");
	const timeSelect = document.getElementById("timeSelect");
	const bookDateDisplay = document.getElementById("bookDateDisplay");
	const bookNowBtn = document.getElementById("bookNowBtn");

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
			{value: "9-11", label: "9am - 11am"},
			{value: "10-12", label: "10am - 12pm"},
			{value: "19-21", label: "7pm - 9pm"},
			{value: "20-22", label: "8pm - 10pm"},
		]
			.map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
			.join("");
	}

	function getSelectedTimeslotTimestamps(dateStr) {
		const [year, month, day] = dateStr.split("-").map(Number);
		const selected = timeSelect.value;
		const hours = window.shared.timeSlotMap[selected] || [20, 21];
		return hours.map((h) => new Date(year, month - 1, day, h).getTime());
	}

	function setDefaultVenueAndTime() {
		const date = window.shared.getDateTwoWeeksFromToday();
		const day = new Date(date).getDay(); // 0=Sunday, 1=Monday, ... 6=Saturday
		if (!venueSelect || !timeSelect) return;
		if (day === 0) {
			// Sunday
			venueSelect.value = "DS2Y95tMEksERLSJfBSBz"; // Bowen Sec Sch
			timeSelect.value = "10-12";
		} else if (day === 1 || day === 2 || day === 4) {
			// Mon, Tue, Thu
			venueSelect.value = "a3jznoZlsfyJrl43Tbnog"; // Delta Sports Hall
			timeSelect.value = "19-21";
		} else if (day === 6) {
			// Saturday
			venueSelect.value = "cRyHuTcU77VZY7Er3jVf5"; // Sengkang Sports Hall
			timeSelect.value = "20-22";
		}
	}

	if (bookNowBtn) {
		bookNowBtn.addEventListener("click", () => {
			const venue = venueSelect.value;
			const activity = "YLONatwvqJfikKOmB5N9U";
			const date = window.shared.getDateTwoWeeksFromToday();
			const timeslots = getSelectedTimeslotTimestamps(date);
			const url = `https://activesg.gov.sg/venues/${venue}/activities/${activity}/timeslots?date=${date}&timeslots=${timeslots[0]}&timeslots=${timeslots[1]}`;
			const ballotUrl = `https://activesg.gov.sg/venues/${venue}/activities/${activity}/review/ballot?timeslot=${timeslots[0]}&timeslot=${timeslots[1]}`;
			window.location.href = url;
		});
	}

	populateVenueDropdown();
	populateTimeDropdown();
	setDefaultVenueAndTime();
	updateBookDateDisplay();
});
