// tango-admin.js - Oakley Tango Admin Panel functionality

// Cell type constants
const CELL_EMPTY = 0;
const CELL_SUN = 1;
const CELL_MOON = 2;

// Fallback puzzles in case generation fails
const FALLBACK_SOLUTIONS = [
	[
		[1, 1, 2, 1, 1, 2],
		[2, 2, 2, 2, 1, 1],
		[1, 2, 1, 2, 2, 1],
		[2, 1, 2, 1, 2, 2],
		[1, 1, 1, 2, 1, 2],
		[2, 2, 2, 1, 1, 1],
	],
	[
		[1, 2, 1, 1, 2, 1],
		[1, 1, 2, 2, 2, 2],
		[2, 1, 1, 1, 1, 2],
		[2, 2, 2, 2, 1, 1],
		[1, 2, 1, 1, 2, 1],
		[1, 1, 2, 2, 1, 2],
	],
	[
		[1, 2, 1, 1, 2, 2],
		[2, 1, 1, 2, 1, 1],
		[2, 2, 1, 2, 2, 1],
		[1, 1, 2, 2, 1, 1],
		[2, 1, 2, 1, 1, 2],
		[1, 2, 2, 1, 2, 1],
	],
];

// Initialize admin panel
document.addEventListener("DOMContentLoaded", function () {
	console.log("Tango admin panel loaded");

	if (window.headerManager) {
		window.headerManager.loadHeader().then(initializeAdmin);
	} else {
		initializeAdmin();
	}
});

function initializeAdmin() {
	setupEventListeners();
	console.log("Admin panel ready");
}

function setupEventListeners() {
	console.log("Event listeners ready");
}

// Main puzzle generation function
function generatePuzzle() {
	showMessage("🎲 Generating new puzzle...", "info");

	try {
		const puzzle = generateValidPuzzle();

		if (!puzzle) {
			showMessage(
				"❌ Failed to generate puzzle. Please try again.",
				"error"
			);
			return;
		}

		const challengeUrl = createChallengeURL(puzzle);
		displayPuzzleResults(challengeUrl);
		showMessage("✅ New puzzle generated successfully!", "success");
	} catch (error) {
		console.error("Error generating puzzle:", error);
		showMessage("❌ Error generating puzzle. Please try again.", "error");
	}
}

function createChallengeURL(puzzle) {
	const encodedPuzzle = encodePuzzle(puzzle);
	const baseUrl =
		window.location.origin +
		window.location.pathname.replace("tango-admin.html", "tango.html");
	return `${baseUrl}?puzzle=${encodedPuzzle}`;
}

function displayPuzzleResults(challengeUrl) {
	document.getElementById("challengeUrl").value = challengeUrl;
	document.getElementById("puzzleOutput").style.display = "block";
	document.getElementById("copyUrlBtn").style.display = "inline-flex";
	document.getElementById("shareUrlBtn").style.display = "inline-flex";
}

// Copy URL to clipboard
async function copyURL() {
	const urlInput = document.getElementById("challengeUrl");
	const copyBtn = document.getElementById("copyUrlBtn");

	try {
		await navigator.clipboard.writeText(urlInput.value);

		// Update button appearance
		const originalText = copyBtn.innerHTML;
		copyBtn.innerHTML = '<i class="bx bx-check"></i> Copied!';
		copyBtn.classList.add("copied");

		// Reset after 2 seconds
		setTimeout(() => {
			copyBtn.innerHTML = originalText;
			copyBtn.classList.remove("copied");
		}, 2000);

		showMessage("Challenge URL copied to clipboard!", "success");
	} catch (err) {
		// Fallback for older browsers
		urlInput.select();
		urlInput.setSelectionRange(0, 99999);
		document.execCommand("copy");

		showMessage("Challenge URL copied to clipboard!", "success");
	}
}

// Share using native Web Share API
async function shareURL() {
	const url = document.getElementById("challengeUrl").value;

	if (!url) {
		showMessage("No URL to share. Generate a puzzle first!", "error");
		return;
	}

	const shareData = {
		title: "Oakley Tango Challenge",
		text: `Tango:\n${url}`,
		url: url,
	};

	try {
		// Try native share first if available
		if (navigator.share) {
			await navigator.share(shareData);
			showMessage("Challenge shared successfully!", "success");
		} else {
			// Fallback: copy to clipboard if native share not supported
			showMessage(
				"Native sharing not supported. Copying to clipboard instead.",
				"info"
			);
			await copyURL();
		}
	} catch (err) {
		if (err.name !== "AbortError") {
			// User didn't cancel, so try clipboard fallback
			console.log("Share failed:", err);
			showMessage(
				"Share cancelled or failed. Copying to clipboard instead.",
				"info"
			);
			await copyURL();
		}
		// If AbortError, user cancelled - don't show any message
	}
}

// Puzzle generation algorithm
function generateValidPuzzle() {
	const solution = generateValidSolution();
	if (!solution) return null;

	const constraints = createConstraintsFromSolution(solution);

	return {
		constraints,
		solution,
	};
}

function generateValidSolution() {
	// Use DFS with backtracking to generate a valid solution
	const grid = createEmptyGrid();

	if (solveWithDFS(grid, 0, 0)) {
		return grid;
	}

	alert("Failed to generate a valid puzzle. Using fallback solution.");

	// Fallback to known solution if DFS fails (should be rare)
	return FALLBACK_SOLUTIONS[
		Math.floor(Math.random() * FALLBACK_SOLUTIONS.length)
	];
}

function solveWithDFS(grid, row, col) {
	// Base case: reached end of grid
	if (row === 6) {
		return isValidGrid(grid);
	}

	// Move to next position
	const nextRow = col === 5 ? row + 1 : row;
	const nextCol = col === 5 ? 0 : col + 1;

	// Get valid values for current position
	const validValues = getValidValues(grid, row, col);

	// Shuffle valid values for randomization
	shuffleArray(validValues);

	// Try each valid value
	for (const value of validValues) {
		grid[row][col] = value;

		if (solveWithDFS(grid, nextRow, nextCol)) {
			return true;
		}

		// Backtrack
		grid[row][col] = CELL_EMPTY;
	}

	return false;
}

function getValidValues(grid, row, col) {
	const validValues = [];

	// Try both SUN and MOON
	for (const value of [CELL_SUN, CELL_MOON]) {
		grid[row][col] = value;

		if (isValidPlacement(grid, row, col)) {
			validValues.push(value);
		}
	}

	grid[row][col] = CELL_EMPTY;
	return validValues;
}

function isValidPlacement(grid, row, col) {
	// Check row constraints (max 3 of each type)
	let rowSuns = 0,
		rowMoons = 0;
	for (let c = 0; c < 6; c++) {
		if (grid[row][c] === CELL_SUN) rowSuns++;
		else if (grid[row][c] === CELL_MOON) rowMoons++;
	}
	if (rowSuns > 3 || rowMoons > 3) return false;

	// Check column constraints (max 3 of each type)
	let colSuns = 0,
		colMoons = 0;
	for (let r = 0; r < 6; r++) {
		if (grid[r][col] === CELL_SUN) colSuns++;
		else if (grid[r][col] === CELL_MOON) colMoons++;
	}
	if (colSuns > 3 || colMoons > 3) return false;

	// Check no three consecutive in row
	if (col >= 2) {
		if (
			grid[row][col] === grid[row][col - 1] &&
			grid[row][col - 1] === grid[row][col - 2]
		) {
			return false;
		}
	}

	// Check no three consecutive in column
	if (row >= 2) {
		if (
			grid[row][col] === grid[row - 1][col] &&
			grid[row - 1][col] === grid[row - 2][col]
		) {
			return false;
		}
	}

	return true;
}

function createEmptyGrid() {
	return Array(6)
		.fill()
		.map(() => Array(6).fill(CELL_EMPTY));
}

function isValidGrid(grid) {
	// Check column balance (3 suns and 3 moons per column)
	for (let col = 0; col < 6; col++) {
		let suns = 0,
			moons = 0;
		for (let row = 0; row < 6; row++) {
			if (grid[row][col] === CELL_SUN) suns++;
			else if (grid[row][col] === CELL_MOON) moons++;
		}
		if (suns !== 3 || moons !== 3) return false;
	}

	// Check adjacency rule (no more than 2 consecutive identical)
	// Check rows
	for (let row = 0; row < 6; row++) {
		let consecutive = 1;
		for (let col = 1; col < 6; col++) {
			if (grid[row][col] === grid[row][col - 1]) {
				consecutive++;
				if (consecutive > 2) return false;
			} else {
				consecutive = 1;
			}
		}
	}

	// Check columns
	for (let col = 0; col < 6; col++) {
		let consecutive = 1;
		for (let row = 1; row < 6; row++) {
			if (grid[row][col] === grid[row - 1][col]) {
				consecutive++;
				if (consecutive > 2) return false;
			} else {
				consecutive = 1;
			}
		}
	}

	return true;
}

function createConstraintsFromSolution(solution) {
	const constraints = [];

	// First, add 2-5 solution cells (givens) to ensure unique solution
	const numGivens = 2 + Math.floor(Math.random() * 4); // 2-5 givens
	const givenPositions = [];

	// Get all positions and shuffle them
	for (let row = 0; row < 6; row++) {
		for (let col = 0; col < 6; col++) {
			givenPositions.push([row, col]);
		}
	}
	shuffleArray(givenPositions);

	// Add givens as fixed solution cells
	for (let i = 0; i < numGivens; i++) {
		const [row, col] = givenPositions[i];
		constraints.push({
			type: "given",
			row,
			col,
			value: solution[row][col],
		});
	}

	// Then add relationship constraints (8-12 constraints)
	const numRelationships = 8 + Math.floor(Math.random() * 5); // 8-12 constraints
	const usedPairs = new Set();

	for (let i = 0; i < numRelationships; i++) {
		let attempts = 0;
		while (attempts < 50) {
			const row = Math.floor(Math.random() * 6);
			const col = Math.floor(Math.random() * 6);

			// Skip if this position is already a given
			const isGiven = constraints.some(
				(c) => c.type === "given" && c.row === row && c.col === col
			);
			if (isGiven) {
				attempts++;
				continue;
			}

			// Try horizontal neighbor
			if (col < 5) {
				const pairKey = `${row},${col}-${row},${col + 1}`;
				if (!usedPairs.has(pairKey)) {
					// Skip if neighbor is a given
					const neighborIsGiven = constraints.some(
						(c) =>
							c.type === "given" &&
							c.row === row &&
							c.col === col + 1
					);
					if (!neighborIsGiven) {
						const cell1Value = solution[row][col];
						const cell2Value = solution[row][col + 1];
						const constraintType =
							cell1Value === cell2Value ? "equals" : "times";

						constraints.push({
							type: "relationship",
							row1: row,
							col1: col,
							row2: row,
							col2: col + 1,
							constraint: constraintType,
						});
						usedPairs.add(pairKey);
						break;
					}
				}
			}

			// Try vertical neighbor
			if (row < 5) {
				const pairKey = `${row},${col}-${row + 1},${col}`;
				if (!usedPairs.has(pairKey)) {
					// Skip if neighbor is a given
					const neighborIsGiven = constraints.some(
						(c) =>
							c.type === "given" &&
							c.row === row + 1 &&
							c.col === col
					);
					if (!neighborIsGiven) {
						const cell1Value = solution[row][col];
						const cell2Value = solution[row + 1][col];
						const constraintType =
							cell1Value === cell2Value ? "equals" : "times";

						constraints.push({
							type: "relationship",
							row1: row,
							col1: col,
							row2: row + 1,
							col2: col,
							constraint: constraintType,
						});
						usedPairs.add(pairKey);
						break;
					}
				}
			}

			attempts++;
		}
	}

	return constraints;
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

function setupEventListeners() {
	// Copy buttons - the onclick is handled in HTML now
	console.log("Event listeners ready");
}

function encodePuzzle(puzzle) {
	try {
		// Create a more compact representation
		const compact = {
			g: [], // givens: [row, col, value] arrays
			r: [], // relationships: [row1, col1, row2, col2, type] arrays
		};

		// Process constraints into compact format
		for (const constraint of puzzle.constraints) {
			if (constraint.type === "given") {
				compact.g.push([
					constraint.row,
					constraint.col,
					constraint.value,
				]);
			} else if (constraint.type === "relationship") {
				// Use 0 for "equals", 1 for "times" to save space
				const typeCode = constraint.constraint === "equals" ? 0 : 1;
				compact.r.push([
					constraint.row1,
					constraint.col1,
					constraint.row2,
					constraint.col2,
					typeCode,
				]);
			}
		}

		// Convert to JSON and encode with URL-safe base64
		const jsonString = JSON.stringify(compact);
		const encoded = btoa(jsonString)
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=/g, ""); // Remove padding

		return "tng_" + encoded;
	} catch (error) {
		console.error("Error encoding puzzle:", error);
		showMessage("Error encoding puzzle data!", "error");
		return "";
	}
}

function showMessage(text, type) {
	const messageDiv = document.getElementById("message");
	messageDiv.textContent = text;
	messageDiv.className = `message ${type}`;
	messageDiv.style.display = "flex";

	setTimeout(() => {
		hideMessage();
	}, 5000);
}

function hideMessage() {
	const messageDiv = document.getElementById("message");
	messageDiv.style.display = "none";
}

// Initialize admin page
window.initTangoAdminPage = function () {
	console.log("Tango admin page initialized");
};

// Export functions for global access
window.generatePuzzle = generatePuzzle;
window.copyURL = copyURL;
