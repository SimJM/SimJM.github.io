// Dark mode toggle
(function handleDarkMode() {
	const darkModeToggle = document.getElementById("darkModeToggle");
	const body = document.body;
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
})();

const homeTab = document.getElementById("homeTab");
const bookTab = document.getElementById("bookTab");
const mainSection = document.getElementById("mainSection");
const bookSection = document.getElementById("bookSection");
const bookNowBtn = document.getElementById("bookNowBtn");
const venueSelect = document.getElementById("venueSelect");
const bookDateDisplay = document.getElementById("bookDateDisplay");
const timeSelect = document.getElementById("timeSelect");

const venues = {
	DS2Y95tMEksERLSJfBSBz: "Bowen Sec Sch",
	a3jznoZlsfyJrl43Tbnog: "Delta Sports Hall",
	cRyHuTcU77VZY7Er3jVf5: "Sengkang Sports Hall",
	rhK3pSR5ifFrB2AVCMOeK: "Yio Chu Kang Pri Sch",
};

const timeSlotMap = {
	"9-11": [9, 10],
	"10-12": [10, 11],
	"20-22": [20, 21],
	"19-21": [19, 20],
};

function getDateTwoWeeksFromToday() {
	const today = new Date();
	today.setDate(today.getDate() + 14);
	return today.toISOString().slice(0, 10);
}

function getDayOfWeek(dateStr) {
	return new Date(dateStr).toLocaleDateString(undefined, {weekday: "long"});
}

function getTimeslotTimestamps(dateStr) {
	const [year, month, day] = dateStr.split("-").map(Number);
	return [
		new Date(year, month - 1, day, 20).getTime(),
		new Date(year, month - 1, day, 21).getTime(),
	];
}

function getSelectedTimeslotTimestamps(dateStr) {
	const [year, month, day] = dateStr.split("-").map(Number);
	const selected = timeSelect.value;
	const hours = timeSlotMap[selected] || [20, 21];
	return hours.map((h) => new Date(year, month - 1, day, h).getTime());
}

function updateBookDateDisplay() {
	const date = getDateTwoWeeksFromToday();
	const day = getDayOfWeek(date);
	if (bookDateDisplay)
		bookDateDisplay.textContent = `Booking Date: ${date} (${day})`;
}

function showTab(isBook) {
	homeTab.classList.toggle("active", !isBook);
	bookTab.classList.toggle("active", isBook);
	mainSection.style.display = isBook ? "none" : "";
	bookSection.style.display = isBook ? "" : "none";
	if (isBook) updateBookDateDisplay();
}

function populateVenueDropdown() {
	venueSelect.innerHTML = Object.entries(venues)
		.map(
			([id, name]) =>
				`<option value="${id}"${
					id === "cRyHuTcU77VZY7Er3jVf5" ? " selected" : ""
				}>${name}</option>`
		)
		.join("");
}

function populateTimeDropdown() {
	timeSelect.innerHTML = [
		{value: "9-11", label: "9am - 11am"},
		{value: "10-12", label: "10am - 12pm"},
		{value: "19-21", label: "7pm - 9pm"},
		{value: "20-22", label: "8pm - 10pm"},
	]
		.map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
		.join("");
}

homeTab.addEventListener("click", (e) => {
	e.preventDefault();
	showTab(false);
});

bookTab.addEventListener("click", (e) => {
	e.preventDefault();
	showTab(true);
});

bookNowBtn.addEventListener("click", () => {
	const venue = venueSelect.value;
	const activity = "YLONatwvqJfikKOmB5N9U";
	const date = getDateTwoWeeksFromToday();
	const timeslots = getSelectedTimeslotTimestamps(date);
	const url = `https://activesg.gov.sg/venues/${venue}/activities/${activity}/timeslots?date=${date}&timeslots=${timeslots[0]}&timeslots=${timeslots[1]}`;
	window.location.href = url;
});

window.addEventListener("DOMContentLoaded", () => {
	populateVenueDropdown();
	populateTimeDropdown();
	showTab(window.location.hash === "#book");
});
