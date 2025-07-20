// wordle.js - Wordle Game functionality

// Game state
let currentWord = "";
let currentGuess = [];
let currentRow = 0;
let gameOver = false;
let guessHistory = []; // Track all guesses and their results
let gameStats = {
	gamesPlayed: 0,
	gamesWon: 0,
	currentStreak: 0,
	maxStreak: 0,
};

// Common 5-letter words for the game
const wordList = [
	"ABOUT",
	"ABOVE",
	"ABUSE",
	"ACTOR",
	"ACUTE",
	"ADMIT",
	"ADOPT",
	"ADULT",
	"AFTER",
	"AGAIN",
	"AGENT",
	"AGREE",
	"AHEAD",
	"ALARM",
	"ALBUM",
	"ALERT",
	"ALIEN",
	"ALIGN",
	"ALIKE",
	"ALIVE",
	"ALLOW",
	"ALONE",
	"ALONG",
	"ALTER",
	"AMONG",
	"ANGER",
	"ANGLE",
	"ANGRY",
	"APART",
	"APPLE",
	"APPLY",
	"ARENA",
	"ARGUE",
	"ARISE",
	"ARRAY",
	"ARROW",
	"ASIDE",
	"ASSET",
	"AVOID",
	"AWAKE",
	"AWARD",
	"AWARE",
	"BADLY",
	"BAKER",
	"BASES",
	"BASIC",
	"BEACH",
	"BEGAN",
	"BEGIN",
	"BEING",
	"BELOW",
	"BENCH",
	"BILLY",
	"BIRTH",
	"BLACK",
	"BLAME",
	"BLANK",
	"BLIND",
	"BLOCK",
	"BLOOD",
	"BOARD",
	"BOOST",
	"BOOTH",
	"BOUND",
	"BRAIN",
	"BRAND",
	"BRAVE",
	"BREAD",
	"BREAK",
	"BREED",
	"BRIEF",
	"BRING",
	"BROAD",
	"BROKE",
	"BROWN",
	"BUILD",
	"BUILT",
	"BUYER",
	"CABLE",
	"CHOSE",
	"CIVIL",
	"CLAIM",
	"CLASS",
	"CLEAN",
	"CLEAR",
	"CLICK",
	"CLIMB",
	"CLOCK",
	"CLOSE",
	"CLOUD",
	"COACH",
	"COAST",
	"COULD",
	"COUNT",
	"COURT",
	"COVER",
	"CRASH",
	"CRAZY",
	"CREAM",
	"CRIME",
	"CROSS",
	"CROWD",
	"CROWN",
	"CRUDE",
	"CURVE",
	"CYCLE",
	"DAILY",
	"DANCE",
	"DATED",
	"DEALT",
	"DEATH",
	"DEBUT",
	"DELAY",
	"DEPTH",
	"DOING",
	"DOUBT",
	"DOZEN",
	"DRAFT",
	"DRAMA",
	"DRANK",
	"DREAM",
	"DRESS",
	"DRILL",
	"DRINK",
	"DRIVE",
	"DROVE",
	"DYING",
	"EAGER",
	"EARLY",
	"EARTH",
	"EIGHT",
	"ELITE",
	"EMPTY",
	"ENEMY",
	"ENJOY",
	"ENTER",
	"ENTRY",
	"EQUAL",
	"ERROR",
	"EVENT",
	"EVERY",
	"EXACT",
	"EXIST",
	"EXTRA",
	"FAITH",
	"FALSE",
	"FAULT",
	"FIBER",
	"FIELD",
	"FIFTH",
	"FIFTY",
	"FIGHT",
	"FINAL",
	"FIRST",
	"FIXED",
	"FLASH",
	"FLEET",
	"FLOOR",
	"FLUID",
	"FOCUS",
	"FORCE",
	"FORTH",
	"FORTY",
	"FORUM",
	"FOUND",
	"FRAME",
	"FRANK",
	"FRAUD",
	"FRESH",
	"FRONT",
	"FRUIT",
	"FULLY",
	"FUNNY",
	"GIANT",
	"GIVEN",
	"GLASS",
	"GLOBE",
	"GOING",
	"GRACE",
	"GRADE",
	"GRAND",
	"GRANT",
	"GRASS",
	"GRAVE",
	"GREAT",
	"GREEN",
	"GROSS",
	"GROUP",
	"GROWN",
	"GUARD",
	"GUESS",
	"GUEST",
	"GUIDE",
	"HAPPY",
	"HARRY",
	"HEART",
	"HEAVY",
	"HENCE",
	"HENRY",
	"HORSE",
	"HOTEL",
	"HOUSE",
	"HUMAN",
	"IDEAL",
	"IMAGE",
	"INDEX",
	"INNER",
	"INPUT",
	"ISSUE",
	"JAPAN",
	"JIMMY",
	"JOINT",
	"JONES",
	"JUDGE",
	"KNOWN",
	"LABEL",
	"LARGE",
	"LASER",
	"LATER",
	"LAUGH",
	"LAYER",
	"LEARN",
	"LEASE",
	"LEAST",
	"LEAVE",
	"LEGAL",
	"LEVEL",
	"LEWIS",
	"LIGHT",
	"LIMIT",
	"LINKS",
	"LIVES",
	"LOCAL",
	"LOOSE",
	"LOWER",
	"LUCKY",
	"LUNCH",
	"LYING",
	"MAGIC",
	"MAJOR",
	"MAKER",
	"MARCH",
	"MARIA",
	"MATCH",
	"MAYBE",
	"MAYOR",
	"MEANT",
	"MEDIA",
	"METAL",
	"MIGHT",
	"MINOR",
	"MINUS",
	"MIXED",
	"MODEL",
	"MONEY",
	"MONTH",
	"MORAL",
	"MOTOR",
	"MOUNT",
	"MOUSE",
	"MOUTH",
	"MOVED",
	"MOVIE",
	"MUSIC",
	"NEEDS",
	"NEVER",
	"NEWLY",
	"NIGHT",
	"NOISE",
	"NORTH",
	"NOTED",
	"NOVEL",
	"NURSE",
	"OCCUR",
	"OCEAN",
	"OFFER",
	"OFTEN",
	"ORDER",
	"OTHER",
	"OUGHT",
	"PAINT",
	"PANEL",
	"PAPER",
	"PARTY",
	"PEACE",
	"PETER",
	"PHASE",
	"PHONE",
	"PHOTO",
	"PIANO",
	"PIECE",
	"PILOT",
	"PITCH",
	"PLACE",
	"PLAIN",
	"PLANE",
	"PLANT",
	"PLATE",
	"POINT",
	"POUND",
	"POWER",
	"PRESS",
	"PRICE",
	"PRIDE",
	"PRIME",
	"PRINT",
	"PRIOR",
	"PRIZE",
	"PROOF",
	"PROUD",
	"PROVE",
	"QUEEN",
	"QUICK",
	"QUIET",
	"QUITE",
	"RADIO",
	"RAISE",
	"RANGE",
	"RAPID",
	"RATIO",
	"REACH",
	"READY",
	"REALM",
	"REBEL",
	"REFER",
	"RELAX",
	"REPLY",
	"RIGHT",
	"RIGID",
	"RIVER",
	"ROBOT",
	"ROGER",
	"ROMAN",
	"ROUGH",
	"ROUND",
	"ROUTE",
	"ROYAL",
	"RURAL",
	"SCALE",
	"SCENE",
	"SCOPE",
	"SCORE",
	"SENSE",
	"SERVE",
	"SEVEN",
	"SHALL",
	"SHAPE",
	"SHARE",
	"SHARP",
	"SHEET",
	"SHELF",
	"SHELL",
	"SHIFT",
	"SHINE",
	"SHIRT",
	"SHOCK",
	"SHOOT",
	"SHORT",
	"SHOWN",
	"SIGHT",
	"SILLY",
	"SINCE",
	"SIXTH",
	"SIXTY",
	"SIZED",
	"SKILL",
	"SLEEP",
	"SLIDE",
	"SMALL",
	"SMART",
	"SMILE",
	"SMITH",
	"SMOKE",
	"SNAKE",
	"SNOW",
	"SOLID",
	"SOLVE",
	"SORRY",
	"SOUND",
	"SOUTH",
	"SPACE",
	"SPARE",
	"SPEAK",
	"SPEED",
	"SPEND",
	"SPENT",
	"SPLIT",
	"SPOKE",
	"SPORT",
	"STAFF",
	"STAGE",
	"STAKE",
	"STAND",
	"START",
	"STATE",
	"STEAM",
	"STEEL",
	"STICK",
	"STILL",
	"STOCK",
	"STONE",
	"STOOD",
	"STORE",
	"STORM",
	"STORY",
	"STRIP",
	"STUCK",
	"STUDY",
	"STUFF",
	"STYLE",
	"SUGAR",
	"SUITE",
	"SUPER",
	"SWEET",
	"TABLE",
	"TAKEN",
	"TASTE",
	"TAXES",
	"TEACH",
	"TENDS",
	"TERMS",
	"TEXAS",
	"THANK",
	"THEFT",
	"THEIR",
	"THEME",
	"THERE",
	"THESE",
	"THICK",
	"THING",
	"THINK",
	"THIRD",
	"THOSE",
	"THREE",
	"THREW",
	"THROW",
	"THUMB",
	"TIGHT",
	"TIMES",
	"TIRED",
	"TITLE",
	"TODAY",
	"TOPIC",
	"TOTAL",
	"TOUCH",
	"TOUGH",
	"TOWER",
	"TRACK",
	"TRADE",
	"TRAIN",
	"TREAT",
	"TREND",
	"TRIAL",
	"TRIBE",
	"TRICK",
	"TRIED",
	"TRIES",
	"TRUCK",
	"TRULY",
	"TRUNK",
	"TRUST",
	"TRUTH",
	"TWICE",
	"TWIST",
	"UNCLE",
	"UNDER",
	"UNDUE",
	"UNION",
	"UNITY",
	"UNTIL",
	"UPPER",
	"UPSET",
	"URBAN",
	"USAGE",
	"USUAL",
	"VALID",
	"VALUE",
	"VIDEO",
	"VIRUS",
	"VISIT",
	"VITAL",
	"VOCAL",
	"VOICE",
	"WASTE",
	"WATCH",
	"WATER",
	"WHEEL",
	"WHERE",
	"WHICH",
	"WHILE",
	"WHITE",
	"WHOLE",
	"WHOSE",
	"WOMAN",
	"WOMEN",
	"WORLD",
	"WORRY",
	"WORSE",
	"WORST",
	"WORTH",
	"WOULD",
	"WRITE",
	"WRONG",
	"WROTE",
	"YOUNG",
	"YOUTH",
];

// Valid words for guessing (larger list including less common words)
const validWords = [
	...wordList,
	"ABACK",
	"ABBEY",
	"ABODE",
	"ABORT",
	"ABHOR",
	"ACID",
	"ACORN",
	"ACRES",
	"ACTED",
	"ADDED",
	"ADMIT",
	"ADORE",
	"ADULT",
	"AFIRE",
	"AGING",
	"AGING",
	"AGING",
	"AIDER",
	"AIDED",
	"AIMED",
	"AISLE",
	"ALIAS",
	"ALIEN",
	"ALLEY",
	"ALLOW",
	"ALLOY",
	"ALPHA",
	"ALTAR",
	"AMBER",
	"AMEND",
	"AMINO",
	"AMISS",
	"AMONG",
	"AMPLE",
	"ANGEL",
	"ANGER",
	"ANGRY",
	"ANKLE",
	"ANNEX",
	"ANTIC",
	"APART",
	"APHID",
	"APPLE",
	"APPLY",
	"ARBOR",
	"ARGUE",
	"AROMA",
	"ARROW",
	"ASHEN",
	"ASIDE",
	"ASKED",
	"ASSET",
	"ATLAS",
	"ATTIC",
	"AUDIO",
	"AUDIT",
	"AUNTY",
	"AVOID",
	"AWAKE",
	"AWARD",
	"AWARE",
	"AWASH",
	"AWFUL",
	"BADGE",
	"BADLY",
	"BAGEL",
	"BAKER",
	"BALLS",
	"BALMY",
	"BARGE",
	"BARON",
	"BASIC",
	"BASIN",
	"BATCH",
	"BATHE",
	"BATON",
	"BEACH",
	"BEARD",
	"BEAST",
	"BEGAN",
	"BEGIN",
	"BEING",
	"BELLY",
	"BELOW",
	"BENCH",
	"BERRY",
	"BIKES",
	"BILLY",
	"BINGO",
	"BIRTH",
	"BLACK",
	"BLADE",
	"BLAME",
	"BLAND",
	"BLANK",
	"BLAST",
	"BLAZE",
	"BLEAK",
	"BLEND",
	"BLESS",
	"BLIND",
	"BLINK",
	"BLISS",
	"BLOCK",
	"BLOOD",
	"BLOOM",
	"BLOWN",
	"BLUES",
	"BLUFF",
	"BLUNT",
	"BLURT",
	"BLUSH",
	"BOARD",
	"BOAST",
	"BOBBY",
	"BONUS",
	"BOOST",
	"BOOTH",
	"BOOTS",
	"BOUND",
	"BOXED",
	"BOXES",
	"BRACE",
	"BRAID",
	"BRAIN",
	"BRAKE",
	"BRAND",
	"BRASS",
	"BRAVE",
	"BREAD",
	"BREAK",
	"BREED",
	"BRICK",
	"BRIDE",
	"BRIEF",
	"BRING",
	"BRINK",
	"BROAD",
	"BROKE",
	"BROOK",
	"BROWN",
	"BRUSH",
	"BUILD",
	"BUILT",
	"BULKY",
	"BUMPY",
	"BUNCH",
	"BUNNY",
	"BURST",
	"BUYER",
];

document.addEventListener("DOMContentLoaded", function () {
	console.log("Wordle game loaded");
	loadGameStats();
	initializeGame();
	setupEventListeners();
});

async function initializeGame() {
	// First check for URL parameter (custom challenge)
	const urlWord = getWordFromUrl();

	if (urlWord) {
		currentWord = urlWord;
		console.log("Using custom challenge word:", currentWord);
		// Update subtitle to indicate custom challenge
		const subtitle = document.getElementById("gameSubtitle");
		if (subtitle) {
			subtitle.textContent =
				"🎯 Bailey Custom Challenge - Guess the WORDLE in 6 tries!";
			subtitle.classList.add("custom-challenge");
		}
	} else {
		// Try to get word from admin (legacy support)
		const adminWord = await getCurrentWordFromAdmin();

		if (adminWord) {
			currentWord = adminWord;
			console.log("Using admin word:", currentWord);
		} else {
			currentWord = getRandomWord();
			console.log("Using random word:", currentWord);
		}
	}

	currentGuess = [];
	currentRow = 0;
	gameOver = false;
	guessHistory = []; // Reset guess history for new game

	console.log("Target word:", currentWord); // For debugging - remove in production

	createGameBoard();
	hideMessage();
}

function getRandomWord() {
	// Check if there are custom words from admin
	const customWords = getCustomWords();
	if (customWords.length > 0) {
		return customWords[Math.floor(Math.random() * customWords.length)];
	}

	// Fallback to default word list
	return wordList[Math.floor(Math.random() * wordList.length)];
}

function getWordFromUrl() {
	const urlParams = new URLSearchParams(window.location.search);
	const encodedWord = urlParams.get("word");

	if (!encodedWord) {
		return null;
	}

	try {
		const decodedWord = decodeWord(encodedWord);
		// Validate the decoded word
		if (
			decodedWord &&
			decodedWord.length === 5 &&
			/^[A-Z]+$/.test(decodedWord)
		) {
			return decodedWord;
		}
	} catch (error) {
		console.log("Error decoding URL word:", error);
	}

	return null;
}

function decodeWord(encodedWord) {
	try {
		// Remove the prefix and reverse the string
		if (!encodedWord.startsWith("wrd_")) {
			return null;
		}

		const reversedEncoded = encodedWord
			.substring(4)
			.split("")
			.reverse()
			.join("");
		// Decode from base64
		const decoded = atob(reversedEncoded);
		return decoded.toUpperCase();
	} catch (error) {
		console.log("Error in decodeWord:", error);
		return null;
	}
}

function getCurrentWordFromAdmin() {
	// Legacy support: Check localStorage for backward compatibility
	try {
		const localWord = localStorage.getItem("currentWordleWord");
		if (localWord && localWord.length === 5 && /^[A-Z]+$/.test(localWord)) {
			return Promise.resolve(localWord);
		}
	} catch (error) {
		console.log("Error accessing localStorage:", error);
	}

	return Promise.resolve(null);
}

function getCustomWords() {
	const saved = localStorage.getItem("customWordleWords");
	return saved ? JSON.parse(saved) : [];
}

function createGameBoard() {
	const gameBoard = document.getElementById("gameBoard");
	gameBoard.innerHTML = "";

	for (let i = 0; i < 6; i++) {
		const row = document.createElement("div");
		row.className = "word-row";
		row.id = `row-${i}`;

		for (let j = 0; j < 5; j++) {
			const box = document.createElement("div");
			box.className = "letter-box";
			box.id = `box-${i}-${j}`;
			row.appendChild(box);
		}

		gameBoard.appendChild(row);
	}
}

function setupEventListeners() {
	// Keyboard event listeners
	document.addEventListener("keydown", handleKeyPress);
	// On-screen keyboard
	const keys = document.querySelectorAll(".key");
	keys.forEach((key) => {
		// Make keys unfocusable
		key.setAttribute("tabindex", "-1");

		// Handle click events (mouse and touch)
		key.addEventListener("click", (event) => {
			const keyValue = key.getAttribute("data-key");
			handleKeyPress({key: keyValue});
			removeFocus(event.target);
		});

		// Handle mousedown to prevent focus
		key.addEventListener("mousedown", (event) => {
			event.preventDefault();
		});

		// Handle touchstart for mobile devices
		key.addEventListener(
			"touchstart",
			(event) => {
				event.preventDefault();
				const keyValue = key.getAttribute("data-key");
				handleKeyPress({key: keyValue});
				removeFocus(event.target);
			},
			{passive: false}
		);

		// Handle touchend for mobile devices
		key.addEventListener(
			"touchend",
			(event) => {
				event.preventDefault();
				removeFocus(event.target);
			},
			{passive: false}
		);
	});

	// Helper function to remove focus completely
	function removeFocus(element) {
		element.blur();
		setTimeout(() => {
			element.blur();
			if (document.activeElement === element) {
				document.activeElement.blur();
			}
			// Force focus to body as fallback
			document.body.focus();
			document.body.blur();
		}, 50);
	}
}

function handleKeyPress(event) {
	if (gameOver) return;

	const key = event.key;

	if (key === "Enter") {
		submitGuess();
	} else if (key === "Backspace") {
		deleteLetter();
	} else if (key.match(/^[a-zA-Z]$/) && currentGuess.length < 5) {
		addLetter(key.toUpperCase());
	}
}

function addLetter(letter) {
	if (currentGuess.length < 5) {
		currentGuess.push(letter);
		updateDisplay();
	}
}

function deleteLetter() {
	if (currentGuess.length > 0) {
		currentGuess.pop();
		updateDisplay();
	}
}

function updateDisplay() {
	const row = document.getElementById(`row-${currentRow}`);
	const boxes = row.querySelectorAll(".letter-box");

	boxes.forEach((box, index) => {
		if (index < currentGuess.length) {
			box.textContent = currentGuess[index];
			box.classList.add("filled");
		} else {
			box.textContent = "";
			box.classList.remove("filled");
		}
	});
}

function submitGuess() {
	if (currentGuess.length !== 5) {
		showMessage("Not enough letters", "error");
		return;
	}

	const guessWord = currentGuess.join("");

	if (!isValidWord(guessWord)) {
		showMessage("Not in word list", "error");
		return;
	}

	const result = checkGuess(guessWord);

	// Add to guess history
	guessHistory.push({
		word: guessWord,
		result: result,
		attempt: currentRow + 1,
	});

	animateRow(currentRow, result);

	// Update keyboard after a short delay to ensure animations complete
	setTimeout(() => {
		updateKeyboard(guessWord, result);
	}, 600);

	if (guessWord === currentWord) {
		// Player won
		setTimeout(() => {
			showCongratsModal(currentRow + 1);
			endGame(true);
		}, 1500);
	} else if (currentRow === 5) {
		// Player lost
		setTimeout(() => {
			showGameOverModal();
			endGame(false);
		}, 1500);
	} else {
		// Next row
		currentRow++;
		currentGuess = [];
	}
}

function isValidWord(word) {
	// Allow any 5-letter word with only A-Z characters
	return word.length === 5 && /^[A-Z]+$/.test(word);
}

function checkGuess(guess) {
	const result = [];
	const targetLetters = currentWord.split("");
	const guessLetters = guess.split("");

	// First pass: mark correct letters
	for (let i = 0; i < 5; i++) {
		if (guessLetters[i] === targetLetters[i]) {
			result[i] = "correct";
			targetLetters[i] = null; // Mark as used
			guessLetters[i] = null; // Mark as used
		}
	}

	// Second pass: mark present letters
	for (let i = 0; i < 5; i++) {
		if (guessLetters[i] !== null) {
			const letterIndex = targetLetters.indexOf(guessLetters[i]);
			if (letterIndex !== -1) {
				result[i] = "present";
				targetLetters[letterIndex] = null; // Mark as used
			} else {
				result[i] = "absent";
			}
		}
	}

	return result;
}

function animateRow(rowIndex, result) {
	const row = document.getElementById(`row-${rowIndex}`);
	const boxes = row.querySelectorAll(".letter-box");

	boxes.forEach((box, index) => {
		setTimeout(() => {
			box.classList.add(result[index]);
		}, index * 100);
	});
}

function updateKeyboard(guess, result) {
	for (let i = 0; i < guess.length; i++) {
		const letter = guess[i];
		const key = document.querySelector(
			`[data-key="${letter.toLowerCase()}"]`
		);

		if (key) {
			const currentClass = key.className;

			// Only update if it's a better result (correct > present > absent)
			if (result[i] === "correct") {
				key.classList.remove("present", "absent");
				key.classList.add("correct");
			} else if (
				result[i] === "present" &&
				!key.classList.contains("correct")
			) {
				key.classList.remove("absent");
				key.classList.add("present");
			} else if (
				result[i] === "absent" &&
				!key.classList.contains("correct") &&
				!key.classList.contains("present")
			) {
				key.classList.add("absent");
			}
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
	}, 3000);
}

function hideMessage() {
	const messageDiv = document.getElementById("message");
	messageDiv.style.display = "none";
}

function endGame(won) {
	gameOver = true;
	updateGameStats(won);
	showGameStats();
}

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
	closeCongratsModal(); // Close congratulations modal if open
	closeGameOverModal(); // Close game over modal if open
	guessHistory = []; // Reset guess history
	resetKeyboard();
	initializeGame();
}

function resetKeyboard() {
	const keys = document.querySelectorAll(".key");
	keys.forEach((key) => {
		key.classList.remove("correct", "present", "absent");
	});
}

function loadGameStats() {
	const savedStats = localStorage.getItem("wordleStats");
	if (savedStats) {
		gameStats = JSON.parse(savedStats);
	}
}

function saveGameStats() {
	localStorage.setItem("wordleStats", JSON.stringify(gameStats));
}

// Congratulations modal functions
function showCongratsModal(attempts) {
	const modal = document.getElementById("congratsModal");
	const attemptNumber = document.getElementById("attemptNumber");
	const attemptText = document.getElementById("attemptText");
	const guessHistoryContainer = document.getElementById("guessHistory");

	// Set attempt number and text
	attemptNumber.textContent = attempts;
	attemptText.textContent = getAttemptText(attempts);

	// Populate guess history
	populateGuessHistory(guessHistoryContainer);

	// Show modal
	modal.style.display = "flex";
}

function closeCongratsModal() {
	const modal = document.getElementById("congratsModal");
	modal.style.display = "none";
}

// Close modal when clicking outside
document.addEventListener("click", function (event) {
	const congratsModal = document.getElementById("congratsModal");
	const gameOverModal = document.getElementById("gameOverModal");

	if (congratsModal && event.target === congratsModal) {
		closeCongratsModal();
	}
	if (gameOverModal && event.target === gameOverModal) {
		closeGameOverModal();
	}
});

// Close modal with Escape key
document.addEventListener("keydown", function (event) {
	if (event.key === "Escape") {
		closeCongratsModal();
		closeGameOverModal();
	}
});

function getAttemptText(attempts) {
	switch (attempts) {
		case 1:
			return "Genius!";
		case 2:
			return "Magnificent!";
		case 3:
			return "Impressive!";
		case 4:
			return "Splendid!";
		case 5:
			return "Great!";
		case 6:
			return "Phew!";
		default:
			return "Amazing!";
	}
}

function populateGuessHistory(container) {
	// Clear existing content but keep title
	const title = container.querySelector(".guess-history-title");
	container.innerHTML = "";
	container.appendChild(title);

	// Add each guess
	guessHistory.forEach((guess, index) => {
		const guessItem = document.createElement("div");
		guessItem.className = "guess-item";

		// Create letter boxes
		for (let i = 0; i < 5; i++) {
			const letterBox = document.createElement("div");
			letterBox.className = `guess-letter ${guess.result[i]}`;
			letterBox.textContent = guess.word[i];
			guessItem.appendChild(letterBox);
		}

		container.appendChild(guessItem);
	});
}

// Game Over modal functions
function showGameOverModal() {
	const modal = document.getElementById("gameOverModal");
	const revealedWord = document.getElementById("revealedWord");
	const guessHistoryContainer = document.getElementById(
		"gameOverGuessHistory"
	);

	// Set the revealed word
	revealedWord.textContent = currentWord;

	// Populate guess history
	populateGameOverGuessHistory(guessHistoryContainer);

	// Show modal
	modal.style.display = "flex";
}

function closeGameOverModal() {
	const modal = document.getElementById("gameOverModal");
	modal.style.display = "none";
}

function populateGameOverGuessHistory(container) {
	// Clear existing content but keep title
	const title = container.querySelector(".guess-history-title");
	container.innerHTML = "";
	container.appendChild(title);

	// Add each guess
	guessHistory.forEach((guess, index) => {
		const guessItem = document.createElement("div");
		guessItem.className = "guess-item";

		// Create letter boxes
		for (let i = 0; i < 5; i++) {
			const letterBox = document.createElement("div");
			letterBox.className = `guess-letter ${guess.result[i]}`;
			letterBox.textContent = guess.word[i];
			guessItem.appendChild(letterBox);
		}

		container.appendChild(guessItem);
	});
}

// Results sharing functions
function generateResultsText(gameResult) {
	const isCustomChallenge = getWordFromUrl() !== null;
	const gameTitle = isCustomChallenge ? "Bailey Wordle Challenge" : "Wordle";

	let resultText = `${gameTitle}\n\n`;

	if (gameResult === "win") {
		const attempts = currentRow + 1;
		resultText += `Solved in ${attempts}/6 attempts!\n`;
	} else {
		resultText += `${currentWord} - Not solved\n`;
	}

	resultText += `Answer: ${currentWord}\n\n`;

	// Add guess pattern using emoji squares - only show attempted rows
	guessHistory.forEach((guess, index) => {
		guess.result.forEach((result) => {
			if (result === "correct") {
				resultText += "🟩";
			} else if (result === "present") {
				resultText += "🟨";
			} else {
				resultText += "⬜"; // Use white squares for wrong guesses
			}
		});
		resultText += "\n";
	});

	// Add guess history
	if (guessHistory.length > 0) {
		resultText += "\nGuess History:\n";
		guessHistory.forEach((guess, index) => {
			resultText += `${index + 1}. ${guess.word}\n`;
		});
	}

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

async function shareResults(gameResult) {
	const resultsText = generateResultsText(gameResult);
	const isCustomChallenge = getWordFromUrl() !== null;
	const prefix = generateDatePrefix("Wordle");
	const fullText = prefix + resultsText;

	const shareData = {
		title: isCustomChallenge ? "Wordle Challenge" : "My Wordle Results",
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
			await copyResults(gameResult);
		}
	} catch (err) {
		if (err.name !== "AbortError") {
			// User didn't cancel, so try clipboard fallback
			await copyResults(gameResult);
		}
	}
}

async function copyResults(gameResult) {
	const resultsText = generateResultsText(gameResult);
	const prefix = generateDatePrefix("Wordle");
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

// Initialize on window load as well
window.initWordlePage = function () {
	console.log("Wordle page initialized");
};
