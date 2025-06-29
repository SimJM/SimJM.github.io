// wordle-admin.js - Wordle Admin functionality (Current Word Management Only)

document.addEventListener("DOMContentLoaded", function () {
	console.log("Wordle admin loaded");
	loadCurrentWord();
	setupEventListeners();
});

function setupEventListeners() {
	// Enter key support for current word
	document
		.getElementById("currentWord")
		.addEventListener("keypress", function (e) {
			if (e.key === "Enter") {
				setCurrentWord();
			}
		});

	// Auto-format current word input to uppercase
	document
		.getElementById("currentWord")
		.addEventListener("input", function (e) {
			e.target.value = e.target.value.toUpperCase();
		});
}

function validateWord(word) {
	// Check if empty
	if (!word) {
		showMessage("Please enter a word!", "error");
		return false;
	}

	// Check length
	if (word.length !== 5) {
		showMessage("Word must be exactly 5 letters long!", "error");
		return false;
	}

	// Check if contains only A-Z
	if (!/^[A-Z]+$/.test(word)) {
		showMessage("Word must contain only letters A-Z!", "error");
		return false;
	}

	return true;
}

function showMessage(text, type) {
	const messageDiv = document.getElementById("message");
	messageDiv.textContent = text;
	messageDiv.className = `message ${type}`;
	messageDiv.style.display = "block";

	setTimeout(() => {
		hideMessage();
	}, 5000);
}

function hideMessage() {
	const messageDiv = document.getElementById("message");
	messageDiv.style.display = "none";
}

// Current word management functions
function setCurrentWord() {
	const input = document.getElementById("currentWord");
	const word = input.value.trim().toUpperCase();

	// Validate word
	if (!validateWord(word)) {
		return;
	}

	// Save current word
	localStorage.setItem("currentWordleWord", word);

	// Update display
	updateCurrentWordDisplay();

	// Clear input
	input.value = "";

	showMessage(`Current word set to "${word}"!`, "success");
}

function clearCurrentWord() {
	if (
		confirm(
			"Are you sure you want to clear the current word? The game will use random words."
		)
	) {
		localStorage.removeItem("currentWordleWord");
		updateCurrentWordDisplay();
		showMessage(
			"Current word cleared. Game will use random words.",
			"info"
		);
	}
}

function loadCurrentWord() {
	updateCurrentWordDisplay();
}

function updateCurrentWordDisplay() {
	const currentWord = getCurrentWord();
	const display = document.getElementById("currentWordDisplay");

	if (currentWord) {
		display.textContent = currentWord;
		display.style.color = "#f9532d";
	} else {
		display.textContent = "Not set (using random)";
		display.style.color = "#666";
	}
}

function getCurrentWord() {
	return localStorage.getItem("currentWordleWord");
}

// Make functions available globally
window.wordleAdmin = {
	setCurrentWord: setCurrentWord,
	clearCurrentWord: clearCurrentWord,
	getCurrentWord: getCurrentWord,
};
