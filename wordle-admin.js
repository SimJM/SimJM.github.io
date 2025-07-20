// wordle-admin.js - Wordle Admin functionality (URL-based)

document.addEventListener("DOMContentLoaded", function () {
	console.log("Wordle admin loaded");
	setupEventListeners();
});

function setupEventListeners() {
	// Enter key support for current word
	document
		.getElementById("currentWord")
		.addEventListener("keypress", function (e) {
			if (e.key === "Enter") {
				generateWordleLink();
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

// Simple encoding function (Base64 with custom transform)
function encodeWord(word) {
	// Convert to base64 and add some simple obfuscation
	const encoded = btoa(word);
	// Reverse the string and add a simple prefix
	return "wrd_" + encoded.split("").reverse().join("");
}

// Generate Wordle link with encoded word
function generateWordleLink() {
	const input = document.getElementById("currentWord");
	const word = input.value.trim().toUpperCase();

	// Validate word
	if (!validateWord(word)) {
		return;
	}

	// Encode the word
	const encodedWord = encodeWord(word);

	// Get current site URL (removing the admin page)
	const currentUrl = window.location.href;
	const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf("/") + 1);

	// Create the wordle game URL with encoded word
	const wordleUrl = `${baseUrl}wordle.html?word=${encodedWord}`;

	// Update UI
	document.getElementById("currentWordDisplay").textContent = word;
	document.getElementById("generatedUrl").value = wordleUrl;
	document.getElementById("linkSection").style.display = "block";

	// Clear input
	input.value = "";

	showMessage(`Challenge created for word "${word}"!`, "success");

	// Scroll to the link section
	document.getElementById("linkSection").scrollIntoView({
		behavior: "smooth",
		block: "nearest",
	});
}

// Generate date prefix for sharing
function generateDatePrefix(gameTitle) {
	const now = new Date();
	const dateStr = now.toLocaleDateString("en-GB", {
		year: "numeric",
		month: "short",
		day: "2-digit",
	});
	return `${gameTitle} - ${dateStr}\n`;
}

// Copy URL to clipboard
async function copyToClipboard() {
	const urlInput = document.getElementById("generatedUrl");
	const copyBtn = document.querySelector(".copy-btn");
	const prefix = generateDatePrefix("Wordle Challenge");
	const fullText = prefix + urlInput.value;

	try {
		await navigator.clipboard.writeText(fullText);

		// Update button appearance
		const originalText = copyBtn.innerHTML;
		copyBtn.innerHTML = '<i class="bx bx-check"></i> Copied!';
		copyBtn.classList.add("copied");

		// Reset after 2 seconds
		setTimeout(() => {
			copyBtn.innerHTML = originalText;
			copyBtn.classList.remove("copied");
		}, 2000);

		showMessage("Link copied to clipboard!", "success");
	} catch (err) {
		// Fallback for older browsers
		const textArea = document.createElement("textarea");
		textArea.value = fullText;
		document.body.appendChild(textArea);
		textArea.select();
		textArea.setSelectionRange(0, 99999);
		document.execCommand("copy");
		document.body.removeChild(textArea);

		showMessage("Link copied to clipboard!", "success");
	}
}

// Share using native Web Share API
async function shareLink() {
	const url = document.getElementById("generatedUrl").value;
	const word = document.getElementById("currentWordDisplay").textContent;
	const prefix = generateDatePrefix("Wordle Challenge");
	const fullText =
		prefix +
		`I created a Wordle challenge! Can you guess my 5-letter word?\n${url}`;

	const shareData = {
		title: "Wordle Challenge",
		text: fullText,
		url: url,
	};

	try {
		if (
			navigator.share &&
			navigator.canShare &&
			navigator.canShare(shareData)
		) {
			await navigator.share(shareData);
			showMessage("Challenge shared successfully!", "success");
		} else {
			// Fallback: copy to clipboard
			await copyToClipboard();
		}
	} catch (err) {
		if (err.name !== "AbortError") {
			// User didn't cancel, so try clipboard fallback
			await copyToClipboard();
		}
	}
}

// Open the wordle game with the current word
function openWordle() {
	const url = document.getElementById("generatedUrl").value;
	window.open(url, "_blank");
}
