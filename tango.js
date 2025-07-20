// tango.js - Oakley Tango Game functionality

// Game state
let gameGrid = [];
let constraintGrid = [];
let gameCompleted = false;
let gameStarted = false;
let gameStartTime = null;
let gameEndTime = null;
let timerInterval = null;
let moveHistory = []; // Array to track move history for undo functionality
let gameStats = {
	gamesPlayed: 0,
	gamesWon: 0,
	currentStreak: 0,
	maxStreak: 0,
};

// Cell types
const CELL_TYPES = {
	EMPTY: 0,
	SUN: 1,
	MOON: 2,
	CONSTRAINT_EQUALS: 3,
	CONSTRAINT_TIMES: 4,
};

// Default puzzles - manually verified as solvable
const DEFAULT_PUZZLES = [
	{
		// Puzzle 1: Simple horizontal constraints with givens
		constraints: [
			// Given cells (pre-filled solution hints)
			{type: "given", row: 0, col: 0, value: 1}, // Sun at (0,0)
			{type: "given", row: 2, col: 2, value: 2}, // Moon at (2,2)
			{type: "given", row: 4, col: 4, value: 2}, // Moon at (4,4)
			// Relationship constraints
			{row1: 0, col1: 0, row2: 0, col2: 1, type: "equals"}, // (0,0) = (0,1)
			{row1: 0, col1: 2, row2: 0, col2: 3, type: "times"}, // (0,2) × (0,3)
			{row1: 1, col1: 1, row2: 1, col2: 2, type: "equals"}, // (1,1) = (1,2)
			{row1: 2, col1: 0, row2: 2, col2: 1, type: "times"}, // (2,0) × (2,1)
			{row1: 3, col1: 3, row2: 3, col2: 4, type: "equals"}, // (3,3) = (3,4)
			{row1: 4, col1: 1, row2: 4, col2: 2, type: "times"}, // (4,1) × (4,2)
		],
		solution: [
			[1, 1, 2, 1, 2, 2], // ☀☀🐶☀🐶🐶
			[2, 1, 1, 2, 1, 2], // 🐶☀☀🐶☀🐶
			[1, 2, 2, 1, 2, 1], // ☀🐶🐶☀🐶☀
			[2, 1, 1, 2, 2, 1], // 🐶☀☀🐶🐶☀
			[1, 2, 1, 1, 2, 2], // ☀🐶☀☀🐶🐶
			[2, 1, 2, 2, 1, 1], // 🐶☀🐶🐶☀☀
		],
	},
	{
		// Puzzle 2: Mix of horizontal and vertical constraints with givens
		constraints: [
			// Given cells (pre-filled solution hints)
			{type: "given", row: 1, col: 1, value: 1}, // Sun at (1,1)
			{type: "given", row: 3, col: 3, value: 1}, // Sun at (3,3)
			// Relationship constraints
			{row1: 0, col1: 1, row2: 0, col2: 2, type: "times"}, // (0,1) × (0,2)
			{row1: 1, col1: 0, row2: 2, col2: 0, type: "equals"}, // (1,0) = (2,0) vertical
			{row1: 1, col1: 3, row2: 1, col2: 4, type: "equals"}, // (1,3) = (1,4)
			{row1: 2, col1: 2, row2: 3, col2: 2, type: "times"}, // (2,2) × (3,2) vertical
			{row1: 4, col1: 0, row2: 4, col2: 1, type: "times"}, // (4,0) × (4,1)
			{row1: 3, col1: 4, row2: 4, col2: 4, type: "equals"}, // (3,4) = (4,4) vertical
		],
		solution: [
			[1, 2, 1, 2, 1, 2], // ☀🐶☀🐶☀🐶
			[2, 1, 2, 1, 1, 2], // 🐶☀🐶☀☀🐶
			[2, 2, 1, 2, 2, 1], // 🐶🐶☀🐶🐶☀
			[1, 1, 2, 1, 2, 1], // ☀☀🐶☀🐶☀
			[2, 1, 1, 2, 2, 2], // 🐶☀☀🐶🐶🐶
			[1, 2, 2, 1, 1, 1], // ☀🐶🐶☀☀☀
		],
	},
];

document.addEventListener("DOMContentLoaded", function () {
	console.log("Tango game loaded");
	loadGameStats();
	initializeGame();
	setupEventListeners();
});

async function initializeGame() {
	// Reset game state
	gameStarted = false;
	gameStartTime = null;
	gameEndTime = null;
	moveHistory = []; // Reset move history
	stopTimer();

	// Check for URL parameter (custom challenge)
	const urlPuzzle = getPuzzleFromUrl();

	if (urlPuzzle) {
		console.log("Using custom challenge puzzle");
		setupPuzzle(urlPuzzle);
		// Update subtitle to indicate custom challenge
		const subtitle = document.getElementById("gameSubtitle");
		if (subtitle) {
			subtitle.textContent =
				"🎯 Oakley Custom Challenge - Solve the Tango puzzle!";
			subtitle.classList.add("custom-challenge");
		}
	} else {
		// Use a random default puzzle
		const randomPuzzle =
			DEFAULT_PUZZLES[Math.floor(Math.random() * DEFAULT_PUZZLES.length)];
		setupPuzzle(randomPuzzle);
	}

	gameCompleted = false;
	hideMessage();

	// Initialize undo button state
	updateUndoButton();

	// Show start overlay for new games
	showStartOverlay();
}

function getPuzzleFromUrl() {
	const urlParams = new URLSearchParams(window.location.search);
	const encodedPuzzle = urlParams.get("puzzle");

	if (!encodedPuzzle) {
		return null;
	}

	try {
		const decodedPuzzle = decodePuzzle(encodedPuzzle);
		return decodedPuzzle;
	} catch (error) {
		console.log("Error decoding URL puzzle:", error);
		return null;
	}
}

function decodePuzzle(encodedPuzzle) {
	try {
		// Remove the prefix and decode from base64
		if (!encodedPuzzle.startsWith("tng_")) {
			return null;
		}

		const base64Data = encodedPuzzle.substring(4);

		// Handle URL-safe base64 decoding
		const normalizedBase64 =
			base64Data.replace(/-/g, "+").replace(/_/g, "/") +
			"===".slice(0, (4 - (base64Data.length % 4)) % 4); // Add padding

		const decoded = atob(normalizedBase64);
		const data = JSON.parse(decoded);

		// Check if this is the new compact format
		if (data.g !== undefined && data.r !== undefined) {
			// Convert compact format back to full format
			const constraints = [];

			// Convert givens
			for (const given of data.g) {
				constraints.push({
					type: "given",
					row: given[0],
					col: given[1],
					value: given[2],
				});
			}

			// Convert relationships
			for (const rel of data.r) {
				const constraintType = rel[4] === 0 ? "equals" : "times";
				constraints.push({
					type: "relationship",
					row1: rel[0],
					col1: rel[1],
					row2: rel[2],
					col2: rel[3],
					constraint: constraintType,
				});
			}

			return {constraints};
		}

		// Fallback for old format
		return data;
	} catch (error) {
		console.log("Error in decodePuzzle:", error);
		return null;
	}
}

function setupPuzzle(puzzle) {
	// Initialize grids
	gameGrid = Array(6)
		.fill(null)
		.map(() => Array(6).fill(CELL_TYPES.EMPTY));

	// Handle both old and new constraint formats
	const normalizedConstraints = [];

	if (puzzle.constraints) {
		for (const constraint of puzzle.constraints) {
			if (constraint.type === "given") {
				// New format: given constraints
				normalizedConstraints.push(constraint);
			} else if (constraint.type === "relationship") {
				// New format: relationship constraints
				normalizedConstraints.push(constraint);
			} else if (constraint.row1 !== undefined) {
				// Old format: convert to new format
				normalizedConstraints.push({
					type: "relationship",
					row1: constraint.row1,
					col1: constraint.col1,
					row2: constraint.row2,
					col2: constraint.col2,
					constraint: constraint.type, // "equals" or "times"
				});
			}
		}
	}

	// Store constraints in the new format
	constraintGrid = {
		constraints: normalizedConstraints,
	};

	// Process givens (pre-filled solution cells) - must come after constraintGrid is set
	for (const constraint of normalizedConstraints) {
		if (constraint.type === "given") {
			// For admin-generated puzzles, use the solution value
			let cellValue = constraint.value;

			// If no value is specified but we have a solution grid, use that
			if (!cellValue && puzzle.solution) {
				cellValue = puzzle.solution[constraint.row][constraint.col];
			}

			// Set the cell value in the game grid
			if (cellValue) {
				gameGrid[constraint.row][constraint.col] = cellValue;
			}
		}
	}

	createGameBoard();

	// Update display for all cells to show given cells immediately
	updateGameBoard();
}

function isGivenCell(row, col) {
	// Check if this cell is a given (pre-filled solution cell)
	if (!constraintGrid || !constraintGrid.constraints) return false;

	return constraintGrid.constraints.some(
		(constraint) =>
			constraint.type === "given" &&
			constraint.row === row &&
			constraint.col === col
	);
}

function createGameBoard() {
	const gameBoard = document.getElementById("gameBoard");
	gameBoard.innerHTML = "";

	// Create 11x11 grid: cells at even positions (0,2,4,6,8,10), separators at odd positions
	for (let gridRow = 0; gridRow < 11; gridRow++) {
		for (let gridCol = 0; gridCol < 11; gridCol++) {
			const element = document.createElement("div");

			if (gridRow % 2 === 0 && gridCol % 2 === 0) {
				// This is a cell position
				const gameRow = gridRow / 2;
				const gameCol = gridCol / 2;

				if (gameRow < 6 && gameCol < 6) {
					const isGiven = isGivenCell(gameRow, gameCol);
					element.className = isGiven
						? "cell given"
						: "cell playable";
					element.id = `cell-${gameRow}-${gameCol}`;

					if (!isGiven) {
						element.addEventListener("click", () =>
							handleCellClick(gameRow, gameCol)
						);
					}
					updateCellDisplay(gameRow, gameCol);
				} else {
					// Empty space
					element.style.visibility = "hidden";
				}
			} else if (gridRow % 2 === 0 && gridCol % 2 === 1) {
				// Horizontal separator position
				const gameRow = gridRow / 2;
				const gameCol1 = (gridCol - 1) / 2;
				const gameCol2 = (gridCol + 1) / 2;

				if (gameRow < 6 && gameCol1 < 6 && gameCol2 < 6) {
					const constraint = findHorizontalConstraint(
						gameRow,
						gameCol1,
						gameCol2
					);
					if (constraint) {
						element.className = `separator ${constraint}`;
						element.textContent =
							constraint === "equals" ? "=" : "×";
					}
				}
			} else if (gridRow % 2 === 1 && gridCol % 2 === 0) {
				// Vertical separator position
				const gameRow1 = (gridRow - 1) / 2;
				const gameRow2 = (gridRow + 1) / 2;
				const gameCol = gridCol / 2;

				if (gameRow1 < 6 && gameRow2 < 6 && gameCol < 6) {
					const constraint = findVerticalConstraint(
						gameRow1,
						gameCol,
						gameRow2
					);
					if (constraint) {
						element.className = `separator ${constraint}`;
						element.textContent =
							constraint === "equals" ? "=" : "×";
					}
				}
			}
			// else: diagonal separator positions remain empty

			gameBoard.appendChild(element);
		}
	}
}

function findHorizontalConstraint(row, col1, col2) {
	// Check for a constraint between these two horizontally adjacent cells
	if (!constraintGrid || !constraintGrid.constraints) return null;

	// Look through all constraints to find one connecting these cells
	for (const constraint of constraintGrid.constraints) {
		if (
			constraint.type === "relationship" &&
			((constraint.row1 === row &&
				constraint.col1 === col1 &&
				constraint.row2 === row &&
				constraint.col2 === col2) ||
				(constraint.row1 === row &&
					constraint.col1 === col2 &&
					constraint.row2 === row &&
					constraint.col2 === col1))
		) {
			return constraint.constraint;
		}
	}
	return null;
}

function findVerticalConstraint(row1, col, row2) {
	// Check for a constraint between these two vertically adjacent cells
	if (!constraintGrid || !constraintGrid.constraints) return null;

	// Look through all constraints to find one connecting these cells
	for (const constraint of constraintGrid.constraints) {
		if (
			constraint.type === "relationship" &&
			((constraint.row1 === row1 &&
				constraint.col1 === col &&
				constraint.row2 === row2 &&
				constraint.col2 === col) ||
				(constraint.row1 === row2 &&
					constraint.col1 === col &&
					constraint.row2 === row1 &&
					constraint.col2 === col))
		) {
			return constraint.constraint;
		}
	}
	return null;
}

function setupEventListeners() {
	// Clear all button
	document.getElementById("clearAllBtn").addEventListener("click", clearAll);

	// Undo button
	document.getElementById("undoBtn").addEventListener("click", undoLastMove);

	// Keyboard shortcuts
	document.addEventListener("keydown", handleKeyPress);

	// Close modal when clicking outside
	document.addEventListener("click", function (event) {
		const successModal = document.getElementById("successModal");
		if (successModal && event.target === successModal) {
			closeSuccessModal();
		}
	});

	// Close modal with Escape key
	document.addEventListener("keydown", function (event) {
		if (event.key === "Escape") {
			closeSuccessModal();
		}
	});
}

function handleKeyPress(event) {
	if (gameCompleted) return;

	const key = event.key.toLowerCase();

	if (key === "enter" || key === " ") {
		event.preventDefault();
		checkSolution();
	} else if ((event.ctrlKey || event.metaKey) && key === "z") {
		event.preventDefault();
		undoLastMove();
	}
}

function handleCellClick(row, col) {
	if (gameCompleted) return;

	// Start timer on first interaction
	if (!gameStarted) {
		startTimer();
	}

	// Prevent interaction with given cells
	if (isGivenCell(row, col)) return;

	// Clear any error highlighting
	clearErrorHighlights();

	// Record the current state before making changes (for undo)
	const previousState = gameGrid[row][col];

	// Cycle through states: empty -> sun -> moon -> empty
	let newState;
	if (gameGrid[row][col] === CELL_TYPES.EMPTY) {
		newState = CELL_TYPES.SUN;
	} else if (gameGrid[row][col] === CELL_TYPES.SUN) {
		newState = CELL_TYPES.MOON;
	} else if (gameGrid[row][col] === CELL_TYPES.MOON) {
		newState = CELL_TYPES.EMPTY;
	}

	// Add move to history
	moveHistory.push({
		row: row,
		col: col,
		previousState: previousState,
		newState: newState,
	});

	// Apply the move
	gameGrid[row][col] = newState;

	updateCellDisplay(row, col);

	// Update undo button state
	updateUndoButton();

	// Check if all cells are filled and auto-check solution
	if (isGridComplete()) {
		// Add a small delay to ensure the UI is updated
		setTimeout(() => {
			checkSolution();
		}, 100);
	}
}

function updateCellDisplay(row, col) {
	const cell = document.getElementById(`cell-${row}-${col}`);
	if (!cell) return;

	cell.classList.remove("sun", "moon");

	if (gameGrid[row][col] === CELL_TYPES.SUN) {
		cell.classList.add("sun");
		// Use regular sun emoji for all cells
		cell.textContent = "☀️";
	} else if (gameGrid[row][col] === CELL_TYPES.MOON) {
		cell.classList.add("moon");
		// Use regular moon emoji for all cells
		cell.textContent = "🐶";
	} else {
		cell.textContent = "";
	}
}

function isGridComplete() {
	// Check if all cells are filled (not empty)
	for (let row = 0; row < 6; row++) {
		for (let col = 0; col < 6; col++) {
			if (gameGrid[row][col] === CELL_TYPES.EMPTY) {
				return false;
			}
		}
	}
	return true;
}

function checkSolution() {
	if (gameCompleted) return;

	clearErrorHighlights();

	const errors = [];

	// Grid is already complete when this function is called automatically
	// No need to check if grid is complete

	// Check row/column distribution (equal numbers of suns and moons)
	for (let i = 0; i < 6; i++) {
		// Count symbols in row (all cells are now playable)
		let rowSuns = 0,
			rowMoons = 0;
		for (let col = 0; col < 6; col++) {
			if (gameGrid[i][col] === CELL_TYPES.SUN) rowSuns++;
			else if (gameGrid[i][col] === CELL_TYPES.MOON) rowMoons++;
		}

		// Each row must have equal suns and moons (3 each for 6-cell rows)
		if (rowSuns !== 3 || rowMoons !== 3) {
			errors.push({
				type: "row",
				index: i,
				message: `Row ${i + 1} must have equal suns and moons (3 each)`,
			});
		}

		// Count symbols in column (all cells are now playable)
		let colSuns = 0,
			colMoons = 0;
		for (let row = 0; row < 6; row++) {
			if (gameGrid[row][i] === CELL_TYPES.SUN) colSuns++;
			else if (gameGrid[row][i] === CELL_TYPES.MOON) colMoons++;
		}

		// Each column must have equal suns and moons (3 each for 6-cell columns)
		if (colSuns !== 3 || colMoons !== 3) {
			errors.push({
				type: "col",
				index: i,
				message: `Column ${
					i + 1
				} must have equal suns and moons (3 each)`,
			});
		}
	}

	// Check adjacency rule (no more than 2 identical in a row)
	// Check rows
	for (let row = 0; row < 6; row++) {
		let consecutive = 1;
		let lastType = null;
		let consecutiveStart = -1;

		for (let col = 0; col < 6; col++) {
			const currentType = gameGrid[row][col];

			if (currentType === lastType && currentType !== CELL_TYPES.EMPTY) {
				consecutive++;
				if (consecutive > 2) {
					// Add all cells in the violating sequence
					for (let i = consecutiveStart; i <= col; i++) {
						errors.push({
							type: "adjacency",
							row,
							col: i,
							message:
								"No more than 2 identical symbols can be adjacent",
						});
					}
				}
			} else {
				consecutive = 1;
				lastType = currentType;
				consecutiveStart = col;
			}
		}
	}

	// Check columns
	for (let col = 0; col < 6; col++) {
		let consecutive = 1;
		let lastType = null;
		let consecutiveStart = -1;

		for (let row = 0; row < 6; row++) {
			const currentType = gameGrid[row][col];

			if (currentType === lastType && currentType !== CELL_TYPES.EMPTY) {
				consecutive++;
				if (consecutive > 2) {
					// Add all cells in the violating sequence
					for (let i = consecutiveStart; i <= row; i++) {
						errors.push({
							type: "adjacency",
							row: i,
							col,
							message:
								"No more than 2 identical symbols can be adjacent",
						});
					}
				}
			} else {
				consecutive = 1;
				lastType = currentType;
				consecutiveStart = row;
			}
		}
	}

	// Check constraint rules
	if (constraintGrid && constraintGrid.constraints) {
		for (const constraint of constraintGrid.constraints) {
			// Skip given constraints in validation
			if (constraint.type === "given") continue;

			const {
				row1,
				col1,
				row2,
				col2,
				constraint: constraintType,
			} = constraint;
			const cell1Value = gameGrid[row1][col1];
			const cell2Value = gameGrid[row2][col2];

			// Only check if both cells are filled
			if (
				cell1Value !== CELL_TYPES.EMPTY &&
				cell2Value !== CELL_TYPES.EMPTY
			) {
				const isEquals = constraintType === "equals";

				if (isEquals && cell1Value !== cell2Value) {
					errors.push({
						type: "constraint",
						cells: [
							{row: row1, col: col1, value: cell1Value},
							{row: row2, col: col2, value: cell2Value},
						],
						constraint,
						message: "Cells connected by = must be the same",
					});
				} else if (!isEquals && cell1Value === cell2Value) {
					errors.push({
						type: "constraint",
						cells: [
							{row: row1, col: col1, value: cell1Value},
							{row: row2, col: col2, value: cell2Value},
						],
						constraint,
						message: "Cells connected by × must be different",
					});
				}
			}
		}
	}

	if (errors.length === 0) {
		// Puzzle solved!
		gameCompleted = true;
		gameEndTime = Date.now();
		stopTimer();
		updateTimerDisplay(); // Final update

		updateGameStats(true);
		showGameStats();
		showSuccessModal();
		showMessage("🎉 Puzzle solved! Congratulations!", "success");
	} else {
		// Highlight errors
		highlightErrors(errors);
		showMessage(
			`Found ${errors.length} error${
				errors.length > 1 ? "s" : ""
			}. Check highlighted cells.`,
			"error"
		);
	}
}

function highlightErrors(errors) {
	errors.forEach((error) => {
		if (error.type === "adjacency" || error.type === "constraint") {
			if (error.cells) {
				error.cells.forEach((cell) => {
					const cellElement = document.getElementById(
						`cell-${cell.row}-${cell.col}`
					);
					if (cellElement) cellElement.classList.add("error");
				});
			} else if (error.row !== undefined && error.col !== undefined) {
				const cellElement = document.getElementById(
					`cell-${error.row}-${error.col}`
				);
				if (cellElement) cellElement.classList.add("error");
			}
		}
	});
}

function clearErrorHighlights() {
	document.querySelectorAll(".cell.error").forEach((cell) => {
		cell.classList.remove("error");
	});
}

function clearAll() {
	// Clear only playable cells, preserve given cells
	for (let row = 0; row < 6; row++) {
		for (let col = 0; col < 6; col++) {
			// Only clear if it's not a given cell
			if (!isGivenCell(row, col)) {
				gameGrid[row][col] = CELL_TYPES.EMPTY;
			}
		}
	}

	// Clear move history
	moveHistory = [];

	// Update display for all cells
	updateGameBoard();

	// Clear any error highlights
	clearErrorHighlights();

	// Update undo button state
	updateUndoButton();

	// Hide any messages
	hideMessage();

	showMessage("Grid cleared!", "info");
}

// Undo functionality
function undoLastMove() {
	if (moveHistory.length === 0) return;

	// Get the last move
	const lastMove = moveHistory.pop();

	// Revert the cell to its previous state
	gameGrid[lastMove.row][lastMove.col] = lastMove.previousState;

	// Update the display
	updateCellDisplay(lastMove.row, lastMove.col);

	// Clear any error highlighting
	clearErrorHighlights();

	// Update undo button state
	updateUndoButton();

	showMessage("Move undone!", "info");
}

function updateUndoButton() {
	const undoBtn = document.getElementById("undoBtn");
	if (undoBtn) {
		undoBtn.disabled = moveHistory.length === 0;
		undoBtn.style.opacity = moveHistory.length === 0 ? "0.5" : "1";
	}
}

function updateGameBoard() {
	for (let row = 0; row < 6; row++) {
		for (let col = 0; col < 6; col++) {
			updateCellDisplay(row, col);
		}
	}
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

// Modal functions
function showSuccessModal() {
	const modal = document.getElementById("successModal");
	const completionTimeDiv = document.getElementById("completionTime");

	if (completionTimeDiv && gameStartTime && gameEndTime) {
		completionTimeDiv.textContent = `⏱️ Time: ${getFormattedTime()}`;
	}

	modal.style.display = "flex";
}

function closeSuccessModal() {
	const modal = document.getElementById("successModal");
	modal.style.display = "none";
}

// Game stats functions
function updateGameStats(won) {
	gameStats.gamesPlayed++;

	if (won) {
		gameStats.gamesWon++;
		gameStats.currentStreak++;
		gameStats.maxStreak = Math.max(
			gameStats.maxStreak,
			gameStats.currentStreak
		);
	} else {
		gameStats.currentStreak = 0;
	}

	saveGameStats();
}

function showGameStats() {
	const winPercentage =
		gameStats.gamesPlayed > 0
			? Math.round((gameStats.gamesWon / gameStats.gamesPlayed) * 100)
			: 0;

	document.getElementById("gamesPlayed").textContent = gameStats.gamesPlayed;
	document.getElementById("winPercentage").textContent = winPercentage;
	document.getElementById("currentStreak").textContent =
		gameStats.currentStreak;
	document.getElementById("maxStreak").textContent = gameStats.maxStreak;

	document.getElementById("gameStats").style.display = "block";
}

function startNewGame() {
	document.getElementById("gameStats").style.display = "none";
	closeSuccessModal();
	initializeGame();
	showStartOverlay();
}

function loadGameStats() {
	const savedStats = localStorage.getItem("tangoStats");
	if (savedStats) {
		gameStats = JSON.parse(savedStats);
	}
}

function saveGameStats() {
	localStorage.setItem("tangoStats", JSON.stringify(gameStats));
}

// Results sharing functions
function generateResultsText() {
	const isCustomChallenge = getPuzzleFromUrl() !== null;
	const gameTitle = isCustomChallenge
		? "Oakley Tango Challenge"
		: "Oakley Tango";

	let resultText = `${gameTitle}\n\n`;
	resultText += "Puzzle solved! 🎉\n";

	// Add time if available
	if (gameStartTime && gameEndTime) {
		resultText += `⏱️ Time: ${getFormattedTime()}\n`;
	}
	resultText += "\n";

	// Create a visual representation of the solved puzzle
	// For now, just show the solution grid without constraints
	for (let row = 0; row < 6; row++) {
		let rowText = "";
		for (let col = 0; col < 6; col++) {
			if (gameGrid[row][col] === CELL_TYPES.SUN) {
				rowText += "☀️";
			} else if (gameGrid[row][col] === CELL_TYPES.MOON) {
				rowText += "🌑";
			} else {
				rowText += "⬜";
			}
		}
		resultText += rowText + "\n";
	}

	resultText += "\nPlay at: " + window.location.origin + "/tango.html";

	return resultText.trim();
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

async function shareResults() {
	const resultsText = generateResultsText();
	const isCustomChallenge = getPuzzleFromUrl() !== null;
	const prefix = generateDatePrefix("Oakley Tango");
	const fullText = prefix + resultsText;

	const shareData = {
		title: isCustomChallenge
			? "Oakley Tango Challenge"
			: "My Oakley Tango Results",
		text: fullText,
	};

	try {
		if (
			navigator.share &&
			navigator.canShare &&
			navigator.canShare(shareData)
		) {
			await navigator.share(shareData);
			showMessage("Results shared successfully!", "success");
		} else {
			// Fallback: copy to clipboard
			await copyResults();
		}
	} catch (err) {
		if (err.name !== "AbortError") {
			// User didn't cancel, so try clipboard fallback
			await copyResults();
		}
	}
}

async function copyResults() {
	const resultsText = generateResultsText();
	const prefix = generateDatePrefix("Oakley Tango");
	const fullText = prefix + resultsText;

	try {
		await navigator.clipboard.writeText(fullText);
		showMessage("Results copied to clipboard!", "success");

		// Update button appearance temporarily
		const button = event.target.closest("button");
		if (button) {
			const originalText = button.innerHTML;
			button.innerHTML = '<i class="bx bx-check"></i> Copied!';

			setTimeout(() => {
				button.innerHTML = originalText;
			}, 2000);
		}
	} catch (err) {
		// Fallback for older browsers
		const textArea = document.createElement("textarea");
		textArea.value = fullText;
		document.body.appendChild(textArea);
		textArea.select();
		textArea.setSelectionRange(0, 99999);
		document.execCommand("copy");
		document.body.removeChild(textArea);

		showMessage("Results copied to clipboard!", "success");
	}
}

// Timer functions
function startTimer() {
	if (gameStarted) return;

	gameStarted = true;
	gameStartTime = Date.now();

	// Show timer display
	const timerDisplay = document.getElementById("timerDisplay");
	if (timerDisplay) {
		timerDisplay.style.display = "block";
	}

	timerInterval = setInterval(() => {
		updateTimerDisplay();
	}, 100); // Update every 100ms for smooth display
}

function stopTimer() {
	if (timerInterval) {
		clearInterval(timerInterval);
		timerInterval = null;
	}
}

function updateTimerDisplay() {
	const timerDisplay = document.getElementById("timerDisplay");
	if (!timerDisplay || !gameStartTime) return;

	const currentTime = gameEndTime || Date.now();
	const elapsedTime = Math.max(0, currentTime - gameStartTime);

	const minutes = Math.floor(elapsedTime / 60000);
	const seconds = Math.floor((elapsedTime % 60000) / 1000);
	const milliseconds = Math.floor((elapsedTime % 1000) / 10);

	timerDisplay.textContent = `${minutes}:${seconds
		.toString()
		.padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
}

function getFormattedTime() {
	if (!gameStartTime) return "0:00.00";

	const endTime = gameEndTime || Date.now();
	const elapsedTime = Math.max(0, endTime - gameStartTime);

	const minutes = Math.floor(elapsedTime / 60000);
	const seconds = Math.floor((elapsedTime % 60000) / 1000);
	const milliseconds = Math.floor((elapsedTime % 1000) / 10);

	return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds
		.toString()
		.padStart(2, "0")}`;
}

// Start game function
function startGame() {
	const startOverlay = document.getElementById("startOverlay");
	if (startOverlay) {
		startOverlay.style.display = "none";
	}

	startTimer();

	// Enable interactions
	const gameBoard = document.getElementById("gameBoard");
	if (gameBoard) {
		gameBoard.classList.remove("disabled");
	}
}

// Show start overlay
function showStartOverlay() {
	const startOverlay = document.getElementById("startOverlay");
	if (startOverlay) {
		startOverlay.style.display = "flex";
	}

	// Disable interactions until game starts
	const gameBoard = document.getElementById("gameBoard");
	if (gameBoard) {
		gameBoard.classList.add("disabled");
	}
}

// Initialize on window load as well
window.initTangoPage = function () {
	console.log("Tango page initialized");
};
