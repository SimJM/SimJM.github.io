// Game state
let shoe = [];
let dealerHand = [];
let playerHands = [[]];
let playerBets = [];
let doubledDown = []; // Track which hands were doubled down
let currentHandIndex = 0;
let bankroll = 1000;
let currentBet = 0;
let gameInProgress = false;
let canDouble = true;
let canSplit = false;
let dealerHoleCard = null;
let cutCardReached = false; // Track if cut card has been reached
let cutCardPosition = 0; // Shuffle when cut card is reached (randomized 52-78 cards, ~1-1.5 decks)

// Auto-play state
let autoPlaying = false;
let autoPlayRounds = 0;
let autoPlayMaxRounds = 10;
let autoPlayDelay = 400;

// Statistics
let stats = {
	handsPlayed: 0,
	wins: 0,
	losses: 0,
	pushes: 0,
	streak: 0,
	streakType: null, // 'win' or 'loss'
	longestWinStreak: 0,
	longestLossStreak: 0,
	totalWagered: 0,
	netWinLoss: 0,
	largestWin: 0,
	blackjacks: 0,
	busts: 0,
	handHistory: [], // Last 30 hands: 'W', 'L', 'P'
	dealerBusts: 0,
	doubleDownAttempts: 0,
	doubleDownWins: 0,
};

// Card suits and values
const suits = ["♠️", "♥️", "♦️", "♣️"];
const values = [
	"A",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"J",
	"Q",
	"K",
];

// DOM elements
const bankrollEl = document.getElementById("bankroll");
const currentBetEl = document.getElementById("currentBet");
const messageEl = document.getElementById("message");
const dealerCardsEl = document.getElementById("dealerCards");
const dealerTotalEl = document.getElementById("dealerTotal");
const playerHandsEl = document.getElementById("playerHands");
const betInput = document.getElementById("betInput");
const autoRoundsInput = document.getElementById("autoRoundsInput");
const bettingArea = document.getElementById("bettingArea");
const dealBtn = document.getElementById("dealBtn");
const hitBtn = document.getElementById("hitBtn");
const standBtn = document.getElementById("standBtn");
const doubleBtn = document.getElementById("doubleBtn");
const splitBtn = document.getElementById("splitBtn");
const newRoundBtn = document.getElementById("newRoundBtn");
const autoPlayBtn = document.getElementById("autoPlayBtn");

// Stats elements
const handsPlayedEl = document.getElementById("handsPlayed");
const winsEl = document.getElementById("wins");
const lossesEl = document.getElementById("losses");
const pushesEl = document.getElementById("pushes");
const streakEl = document.getElementById("streak");
const shoeCardsEl = document.getElementById("shoeCards");
const winPercentageEl = document.getElementById("winPercentage");
const longestWinStreakEl = document.getElementById("longestWinStreak");
const longestLossStreakEl = document.getElementById("longestLossStreak");
const penetrationEl = document.getElementById("penetration");
const totalWageredEl = document.getElementById("totalWagered");
const netWinLossEl = document.getElementById("netWinLoss");
const largestWinEl = document.getElementById("largestWin");
const blackjacksEl = document.getElementById("blackjacks");
const bustsEl = document.getElementById("busts");
const handHistoryEl = document.getElementById("handHistory");
const roiEl = document.getElementById("roi");
const dealerBustRateEl = document.getElementById("dealerBustRate");
const avgBetSizeEl = document.getElementById("avgBetSize");
const ddSuccessRateEl = document.getElementById("ddSuccessRate");
const statsToggle = document.getElementById("statsToggle");
const statsPanelWrapper = document.getElementById("statsPanelWrapper");
const statsToggleIcon = document.getElementById("statsToggleIcon");

// Next cards preview elements
const nextCardsToggle = document.getElementById("nextCardsToggle");
const nextCardsPreview = document.getElementById("nextCardsPreview");
const nextCardsList = document.getElementById("nextCardsList");
const toggleIcon = document.getElementById("toggleIcon");

// Create a 6-deck shoe (312 cards)
// Set random cut card position (1-1.5 decks from end, like real casinos)
function setRandomCutCardPosition() {
	// Random position between 52 cards (1 deck) and 78 cards (1.5 decks)
	cutCardPosition = Math.floor(Math.random() * (78 - 52 + 1)) + 52;
	console.log(`Cut card placed at ${cutCardPosition} cards remaining`);
}

// Set random cut card position (1-1.5 decks from end, like real casinos)
function setRandomCutCardPosition() {
	// Random position between 52 cards (1 deck) and 78 cards (1.5 decks)
	cutCardPosition = Math.floor(Math.random() * (78 - 52 + 1)) + 52;
	console.log(`Cut card placed at ${cutCardPosition} cards remaining`);
}

function createShoe() {
	const newShoe = [];
	for (let deck = 0; deck < 6; deck++) {
		for (let suit of suits) {
			for (let value of values) {
				newShoe.push({value, suit});
			}
		}
	}
	return newShoe;
}

// Shuffle the shoe using Fisher-Yates algorithm
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

// Update next 10 cards preview
function updateNextCardsPreview() {
	if (!nextCardsList) return;

	const next10 = shoe.slice(-10).reverse();
	nextCardsList.innerHTML = next10
		.map((card, index) => {
			const color =
				card.suit === "♥️" || card.suit === "♦️" ? "red" : "black";
			return `
				<div class="next-card-item">
					<span class="next-card-number">${index + 1}</span>
					<span class="next-card-display" style="color: ${color}">
						${card.value}${card.suit}
					</span>
				</div>
			`;
		})
		.join("");
}

// Toggle next cards preview
function toggleNextCards() {
	const isExpanded = nextCardsPreview.classList.toggle("expanded");
	toggleIcon.textContent = isExpanded ? "▲" : "▼";
}

// Toggle stats panel
function toggleStatsPanel() {
	const isExpanded = statsPanelWrapper.classList.toggle("expanded");
	statsToggleIcon.textContent = isExpanded ? "▲" : "▼";
}

// Get dealer upcard value
function getDealerUpcard() {
	if (dealerHand.length === 0) return null;
	const card = dealerHand[0];
	if (card.value === "A") return 11;
	if (["K", "Q", "J"].includes(card.value)) return 10;
	return parseInt(card.value);
}

// Check if hand is soft (has usable Ace)
function isSoftHand(hand) {
	let hasAce = hand.some((card) => card.value === "A");
	if (!hasAce) return false;
	let value = calculateHandValue(hand);
	let valueWithoutAce = 0;
	let aces = 0;
	for (let card of hand) {
		if (card.value === "A") {
			aces++;
		} else if (["K", "Q", "J"].includes(card.value)) {
			valueWithoutAce += 10;
		} else {
			valueWithoutAce += parseInt(card.value);
		}
	}
	return aces > 0 && valueWithoutAce + 11 + (aces - 1) === value;
}

// Basic Strategy decision
function getBasicStrategyMove(hand, dealerUpcard) {
	const playerValue = calculateHandValue(hand);
	const isSoft = isSoftHand(hand);
	const isPair = hand.length === 2 && hand[0].value === hand[1].value;

	// Check for pair splitting
	if (isPair && playerHands.length === 1 && bankroll >= currentBet) {
		const pairValue = hand[0].value;
		// Always split Aces and 8s
		if (pairValue === "A" || pairValue === "8") return "split";
		// Never split 10s, 5s, 4s
		if (
			["K", "Q", "J", "10"].includes(pairValue) ||
			pairValue === "5" ||
			pairValue === "4"
		) {
			// Continue to regular strategy
		} else if (["2", "3", "6", "7"].includes(pairValue)) {
			if (dealerUpcard >= 2 && dealerUpcard <= 6) return "split";
		} else if (pairValue === "9") {
			if (
				(dealerUpcard >= 2 && dealerUpcard <= 6) ||
				dealerUpcard === 8 ||
				dealerUpcard === 9
			) {
				return "split";
			}
			if (
				dealerUpcard === 7 ||
				dealerUpcard === 10 ||
				dealerUpcard === 11
			) {
				return "stand";
			}
		}
	}

	// Soft hands
	if (isSoft) {
		if (playerValue >= 19) return "stand";
		if (playerValue === 18) {
			if (
				hand.length === 2 &&
				dealerUpcard >= 4 &&
				dealerUpcard <= 6 &&
				bankroll >= playerBets[currentHandIndex]
			) {
				return "double";
			}
			if (dealerUpcard >= 2 && dealerUpcard <= 8) return "stand";
			return "hit";
		}
		// Soft 17 or less
		if (hand.length === 2 && playerValue >= 15 && playerValue <= 18) {
			if (
				dealerUpcard >= 4 &&
				dealerUpcard <= 6 &&
				bankroll >= playerBets[currentHandIndex]
			) {
				return "double";
			}
		}
		return "hit";
	}

	// Hard hands
	if (playerValue >= 17) return "stand";

	if (playerValue >= 13 && playerValue <= 16) {
		if (dealerUpcard >= 2 && dealerUpcard <= 6) return "stand";
		return "hit";
	}

	if (playerValue === 12) {
		if (dealerUpcard >= 4 && dealerUpcard <= 6) return "stand";
		return "hit";
	}

	if (playerValue === 11) {
		if (
			hand.length === 2 &&
			dealerUpcard !== 11 &&
			bankroll >= playerBets[currentHandIndex]
		) {
			return "double";
		}
		return "hit";
	}

	if (playerValue === 10) {
		if (
			hand.length === 2 &&
			dealerUpcard >= 2 &&
			dealerUpcard <= 9 &&
			bankroll >= playerBets[currentHandIndex]
		) {
			return "double";
		}
		return "hit";
	}

	if (playerValue === 9) {
		if (
			hand.length === 2 &&
			dealerUpcard >= 3 &&
			dealerUpcard <= 6 &&
			bankroll >= playerBets[currentHandIndex]
		) {
			return "double";
		}
		return "hit";
	}

	return "hit";
}

// Deal a card from the shoe
function dealCard() {
	if (shoe.length === 0) {
		shoe = createShoe();
		shuffle(shoe);
		setRandomCutCardPosition();
		cutCardReached = false;
	}

	// Check if we've reached the cut card position
	if (shoe.length <= cutCardPosition && !cutCardReached) {
		cutCardReached = true;
		console.log(`Cut card reached at ${shoe.length} cards remaining`);
	}

	const card = shoe.pop();
	updateNextCardsPreview();
	return card;
}

// Calculate hand value
function calculateHandValue(hand) {
	let value = 0;
	let aces = 0;

	for (let card of hand) {
		if (card.value === "A") {
			aces++;
			value += 11;
		} else if (["K", "Q", "J"].includes(card.value)) {
			value += 10;
		} else {
			value += parseInt(card.value);
		}
	}

	while (value > 21 && aces > 0) {
		value -= 10;
		aces--;
	}

	return value;
}

// Check if hand is blackjack
function checkBlackjack(hand) {
	return hand.length === 2 && calculateHandValue(hand) === 21;
}

// Get card color based on suit
function getCardColor(suit) {
	return suit === "♥️" || suit === "♦️" ? "red" : "black";
}

// Add a card to player hand without rebuilding
function addPlayerCard(handIndex, card) {
	const handEl = playerHandsEl.children[handIndex];
	if (handEl) {
		const cardsEl = handEl.querySelector(".cards");
		const cardEl = document.createElement("div");
		cardEl.className = `card ${getCardColor(card.suit)}`;
		cardEl.textContent = `${card.value}${card.suit}`;
		cardsEl.appendChild(cardEl);

		// Update total
		const totalEl = handEl.querySelector(".hand-total");
		const value = calculateHandValue(playerHands[handIndex]);
		totalEl.textContent = `Total: ${value}`;
		if (playerBets[handIndex]) {
			totalEl.textContent += ` | Bet: $${playerBets[handIndex]}`;
		}
	}
}

// Add a card to dealer hand without rebuilding
function addDealerCard(card, hidden = false) {
	const cardEl = document.createElement("div");
	if (hidden) {
		cardEl.className = "card hidden";
		cardEl.textContent = "🂠";
	} else {
		cardEl.className = `card ${getCardColor(card.suit)}`;
		cardEl.textContent = `${card.value}${card.suit}`;
	}
	dealerCardsEl.appendChild(cardEl);

	// Update dealer total
	if (dealerHoleCard) {
		const visibleValue = calculateHandValue([dealerHand[0]]);
		dealerTotalEl.textContent = `Total: ${visibleValue}`;
	} else {
		dealerTotalEl.textContent = `Total: ${calculateHandValue(dealerHand)}`;
	}
}

// Update display
function updateDisplay() {
	bankrollEl.textContent = `$${bankroll}`;
	currentBetEl.textContent = `$${currentBet || 0}`;

	// Update basic stats
	handsPlayedEl.textContent = stats.handsPlayed;
	winsEl.textContent = stats.wins;
	lossesEl.textContent = stats.losses;
	pushesEl.textContent = stats.pushes;
	shoeCardsEl.textContent = shoe.length;

	// Update advanced stats
	const winRate =
		stats.handsPlayed > 0
			? ((stats.wins / stats.handsPlayed) * 100).toFixed(1)
			: 0;
	winPercentageEl.textContent = `${winRate}%`;

	longestWinStreakEl.textContent = stats.longestWinStreak;
	longestLossStreakEl.textContent = stats.longestLossStreak;

	const penetration = (((312 - shoe.length) / 312) * 100).toFixed(1);
	penetrationEl.textContent = `${penetration}%`;

	totalWageredEl.textContent = `$${stats.totalWagered}`;

	const netValue = stats.netWinLoss;
	netWinLossEl.textContent = `$${netValue >= 0 ? "+" : ""}${netValue}`;
	netWinLossEl.className = `stat-value ${
		netValue > 0 ? "win" : netValue < 0 ? "lose" : ""
	}`;

	largestWinEl.textContent = `$${stats.largestWin}`;
	blackjacksEl.textContent = stats.blackjacks;
	bustsEl.textContent = stats.busts;

	// Calculate and display new stats
	const roi =
		stats.totalWagered > 0
			? ((stats.netWinLoss / stats.totalWagered) * 100).toFixed(2)
			: 0;
	roiEl.textContent = `${roi}%`;
	roiEl.className = `stat-value ${roi > 0 ? "win" : roi < 0 ? "lose" : ""}`;

	const dealerBustRate =
		stats.handsPlayed > 0
			? ((stats.dealerBusts / stats.handsPlayed) * 100).toFixed(1)
			: 0;
	dealerBustRateEl.textContent = `${dealerBustRate}%`;

	const avgBetSize =
		stats.handsPlayed > 0
			? (stats.totalWagered / stats.handsPlayed).toFixed(2)
			: 0;
	avgBetSizeEl.textContent = `$${avgBetSize}`;

	const ddSuccessRate =
		stats.doubleDownAttempts > 0
			? ((stats.doubleDownWins / stats.doubleDownAttempts) * 100).toFixed(
					1
			  )
			: 0;
	ddSuccessRateEl.textContent = `${ddSuccessRate}%`;
	ddSuccessRateEl.className = `stat-value ${
		ddSuccessRate >= 50 ? "win" : ddSuccessRate > 0 ? "lose" : ""
	}`;

	// Update hand history
	handHistoryEl.innerHTML = "";
	const last30 = stats.handHistory.slice(-30);
	last30.forEach((result) => {
		const badge = document.createElement("div");
		const resultClass =
			result === "W" ? "win" : result === "L" ? "lose" : "push";
		badge.className = `history-badge ${resultClass}`;
		badge.textContent = result;
		handHistoryEl.appendChild(badge);
	});

	if (stats.streak === 0) {
		streakEl.textContent = "-";
		streakEl.className = "stat-value";
	} else if (stats.streakType === "win") {
		streakEl.textContent = `W${stats.streak}`;
		streakEl.className = "stat-value win";
	} else {
		streakEl.textContent = `L${stats.streak}`;
		streakEl.className = "stat-value lose";
	}

	// Display dealer cards
	dealerCardsEl.innerHTML = "";
	dealerHand.forEach((card, index) => {
		const cardEl = document.createElement("div");
		if (index === 1 && dealerHoleCard) {
			cardEl.className = "card hidden";
			cardEl.textContent = "🂠";
		} else {
			cardEl.className = `card ${getCardColor(card.suit)}`;
			cardEl.textContent = `${card.value}${card.suit}`;
		}
		dealerCardsEl.appendChild(cardEl);
	});

	// Display dealer total
	if (dealerHand.length > 0) {
		if (dealerHoleCard) {
			const visibleValue = calculateHandValue([dealerHand[0]]);
			dealerTotalEl.textContent = `Total: ${visibleValue}`;
		} else {
			dealerTotalEl.textContent = `Total: ${calculateHandValue(
				dealerHand
			)}`;
		}
	} else {
		dealerTotalEl.textContent = "";
	}

	// Display player hands
	playerHandsEl.innerHTML = "";
	playerHands.forEach((hand, handIndex) => {
		const handEl = document.createElement("div");
		handEl.className = "hand";
		if (handIndex === currentHandIndex && gameInProgress) {
			handEl.classList.add("active");
		}

		const cardsEl = document.createElement("div");
		cardsEl.className = "cards";
		hand.forEach((card) => {
			const cardEl = document.createElement("div");
			cardEl.className = `card ${getCardColor(card.suit)}`;
			cardEl.textContent = `${card.value}${card.suit}`;
			cardsEl.appendChild(cardEl);
		});

		const totalEl = document.createElement("div");
		totalEl.className = "hand-total";
		if (hand.length > 0) {
			const value = calculateHandValue(hand);
			totalEl.textContent = `Total: ${value}`;
			if (playerBets[handIndex]) {
				totalEl.textContent += ` | Bet: $${playerBets[handIndex]}`;
			}
		}

		handEl.appendChild(cardsEl);
		handEl.appendChild(totalEl);
		playerHandsEl.appendChild(handEl);
	});
}

// Show message
function showMessage(text, type = "info") {
	messageEl.textContent = text;
	messageEl.className = `message ${type}`;
}

// Update buttons
function updateButtons() {
	if (!gameInProgress) {
		hitBtn.disabled = true;
		standBtn.disabled = true;
		doubleBtn.disabled = true;
		splitBtn.disabled = true;
		return;
	}

	const currentHand = playerHands[currentHandIndex];
	hitBtn.disabled = false;
	standBtn.disabled = false;

	// Double down only available on first two cards
	doubleBtn.disabled = !(
		currentHand.length === 2 &&
		canDouble &&
		bankroll >= playerBets[currentHandIndex]
	);

	// Split only available if two cards of same value and enough bankroll
	if (
		currentHand.length === 2 &&
		playerHands.length === 1 &&
		bankroll >= currentBet
	) {
		const firstValue = currentHand[0].value;
		const secondValue = currentHand[1].value;
		canSplit = firstValue === secondValue;
	} else {
		canSplit = false;
	}
	splitBtn.disabled = !canSplit;
}

// Deal initial cards
function deal() {
	const betAmount = parseInt(betInput.value);
	if (isNaN(betAmount) || betAmount <= 0) {
		showMessage("Please enter a valid bet amount", "lose");
		return;
	}

	if (betAmount > bankroll) {
		showMessage("Insufficient funds!", "lose");
		return;
	}

	// Reset game state
	currentBet = betAmount;
	bankroll -= betAmount;
	stats.totalWagered += betAmount;
	playerHands = [[]];
	playerBets = [betAmount];
	doubledDown = []; // Reset double down tracking
	dealerHand = [];
	currentHandIndex = 0;
	gameInProgress = true;
	canDouble = true;
	canSplit = false;

	// Hide betting area and deal button
	bettingArea.style.display = "none";
	dealBtn.disabled = true;

	// Update display to show current bet immediately
	updateDisplay();

	// Deal initial cards with animation
	animateInitialDeal();
}

// Animate initial card dealing
function animateInitialDeal() {
	return new Promise((resolve) => {
		playerHandsEl.innerHTML = "";
		dealerCardsEl.innerHTML = "";

		// Create player hand container
		const handEl = document.createElement("div");
		handEl.className = "hand";
		const cardsEl = document.createElement("div");
		cardsEl.className = "cards";
		const totalEl = document.createElement("div");
		totalEl.className = "hand-total";
		handEl.appendChild(cardsEl);
		handEl.appendChild(totalEl);
		playerHandsEl.appendChild(handEl);

		let delay = 0;

		// First card to player
		setTimeout(() => {
			const card = dealCard();
			playerHands[0].push(card);
			const cardEl = document.createElement("div");
			cardEl.className = `card ${getCardColor(card.suit)}`;
			cardEl.textContent = `${card.value}${card.suit}`;
			cardsEl.appendChild(cardEl);
		}, delay);
		delay += 400;

		// First card to dealer (face up)
		setTimeout(() => {
			const card = dealCard();
			dealerHand.push(card);
			const cardEl = document.createElement("div");
			cardEl.className = `card ${getCardColor(card.suit)}`;
			cardEl.textContent = `${card.value}${card.suit}`;
			dealerCardsEl.appendChild(cardEl);
			dealerTotalEl.textContent = `Total: ${calculateHandValue([card])}`;
		}, delay);
		delay += 400;

		// Second card to player
		setTimeout(() => {
			const card = dealCard();
			playerHands[0].push(card);
			const cardEl = document.createElement("div");
			cardEl.className = `card ${getCardColor(card.suit)}`;
			cardEl.textContent = `${card.value}${card.suit}`;
			cardsEl.appendChild(cardEl);
			totalEl.textContent = `Total: ${calculateHandValue(
				playerHands[0]
			)} | Bet: $${playerBets[0]}`;
		}, delay);
		delay += 400;

		// Second card to dealer (face down)
		setTimeout(() => {
			const card = dealCard();
			dealerHand.push(card);
			dealerHoleCard = card;
			const cardEl = document.createElement("div");
			cardEl.className = "card hidden";
			cardEl.textContent = "🂠";
			dealerCardsEl.appendChild(cardEl);
			checkBlackjacks();
			resolve();
		}, delay);
	});
}

// Check for initial blackjacks
function checkBlackjacks() {
	const playerBlackjack = checkBlackjack(playerHands[0]);
	const dealerBlackjack = checkBlackjack(dealerHand);

	if (playerBlackjack || dealerBlackjack) {
		setTimeout(() => {
			dealerHoleCard = null;
			updateDisplay();

			// Update statistics
			stats.handsPlayed++;

			if (playerBlackjack && dealerBlackjack) {
				bankroll += currentBet;
				showMessage("Both Blackjack! Push", "info");
				stats.pushes++;
				stats.handHistory.push("P");
				stats.streak = 0;
				stats.streakType = null;
			} else if (playerBlackjack) {
				const winnings = Math.floor(currentBet * 2.5);
				const profit = winnings - currentBet;
				bankroll += winnings;
				stats.netWinLoss += profit;
				if (profit > stats.largestWin) stats.largestWin = profit;
				stats.blackjacks++;
				showMessage("Blackjack! You win 3:2", "win");
				stats.wins++;
				stats.handHistory.push("W");
				if (stats.streakType === "win") {
					stats.streak++;
					if (stats.streak > stats.longestWinStreak) {
						stats.longestWinStreak = stats.streak;
					}
				} else {
					stats.streak = 1;
					stats.streakType = "win";
				}
			} else {
				stats.netWinLoss -= currentBet;
				showMessage("Dealer Blackjack! You lose", "lose");
				stats.losses++;
				stats.handHistory.push("L");
				if (stats.streakType === "loss") {
					stats.streak++;
					if (stats.streak > stats.longestLossStreak) {
						stats.longestLossStreak = stats.streak;
					}
				} else {
					stats.streak = 1;
					stats.streakType = "loss";
				}
			}
			endRound();
		}, 1000);
	} else {
		showMessage("Your Turn", "info");
		updateButtons();
	}
}

// Reveal dealer hole card with flip animation
function revealDealerHoleCard() {
	const holeCardEl = dealerCardsEl.children[1];
	if (holeCardEl && holeCardEl.classList.contains("hidden")) {
		holeCardEl.classList.add("flipping");

		// Wait until card is perpendicular (90deg) to change content
		setTimeout(() => {
			holeCardEl.classList.remove("hidden");
			holeCardEl.classList.add(getCardColor(dealerHand[1].suit));
			holeCardEl.textContent = `${dealerHand[1].value}${dealerHand[1].suit}`;
			dealerTotalEl.textContent = `Total: ${calculateHandValue(
				dealerHand
			)}`;
		}, 295); // Just before the 49-51% pause in animation

		setTimeout(() => {
			holeCardEl.classList.remove("flipping");
		}, 600);
	}
}

// Player hits
function hit() {
	const currentHand = playerHands[currentHandIndex];
	const card = dealCard();
	currentHand.push(card);
	canDouble = false;
	addPlayerCard(currentHandIndex, card);
	updateDisplay();

	if (calculateHandValue(currentHand) > 21) {
		stats.busts++;
		showMessage("Bust!", "lose");
		setTimeout(moveToNextHand, 1000);
	} else {
		updateButtons();
	}
}

// Player stands
function stand() {
	moveToNextHand();
}

// Move to next hand or dealer
function moveToNextHand() {
	currentHandIndex++;
	if (currentHandIndex >= playerHands.length) {
		dealerPlay();
	} else {
		canDouble = true;
		updateDisplay();
		updateButtons();
		showMessage(`Playing hand ${currentHandIndex + 1}`, "info");

		// Continue auto-play for next hand
		if (autoPlaying) {
			setTimeout(() => {
				autoPlayCurrentHand();
			}, autoPlayDelay);
		}
	}
}

// Player doubles down
function doubleDown() {
	if (bankroll < playerBets[currentHandIndex]) {
		showMessage("Insufficient funds to double down", "lose");
		return;
	}

	// Track double down attempt
	stats.doubleDownAttempts++;
	doubledDown[currentHandIndex] = true;

	bankroll -= playerBets[currentHandIndex];
	playerBets[currentHandIndex] *= 2;
	currentBet = playerBets.reduce((a, b) => a + b, 0);

	const currentHand = playerHands[currentHandIndex];
	const card = dealCard();
	currentHand.push(card);
	addPlayerCard(currentHandIndex, card);
	updateDisplay();

	if (calculateHandValue(currentHand) > 21) {
		showMessage("Bust!", "lose");
	}

	setTimeout(moveToNextHand, 1000);
}

// Player splits hand
function split() {
	if (bankroll < currentBet) {
		showMessage("Insufficient funds to split", "lose");
		return;
	}

	bankroll -= currentBet;
	const currentHand = playerHands[0];
	const splitCard = currentHand.pop();

	playerHands.push([splitCard]);
	playerBets.push(currentBet);

	playerHands[0].push(dealCard());
	playerHands[1].push(dealCard());

	canSplit = false;
	updateDisplay();
	updateButtons();
	showMessage("Hand split! Playing first hand", "info");
}

// Dealer plays
function dealerPlay() {
	dealerHoleCard = null;
	revealDealerHoleCard();

	setTimeout(() => {
		function dealerHit() {
			const dealerValue = calculateHandValue(dealerHand);
			if (dealerValue < 17) {
				const card = dealCard();
				dealerHand.push(card);
				addDealerCard(card);
				setTimeout(dealerHit, 800);
			} else {
				resolveRound();
			}
		}
		dealerHit();
	}, 1200);
}

// Resolve the round
function resolveRound() {
	const dealerValue = calculateHandValue(dealerHand);
	const dealerBust = dealerValue > 21;

	// Track dealer busts
	if (dealerBust) {
		stats.dealerBusts++;
	}

	let totalWinnings = 0;
	let resultMessages = [];
	let hasWin = false;
	let hasLoss = false;
	let allPush = true;

	playerHands.forEach((hand, index) => {
		const playerValue = calculateHandValue(hand);
		const playerBust = playerValue > 21;
		const bet = playerBets[index];
		const wasDoubled = doubledDown[index] || false;

		if (playerBust) {
			resultMessages.push(`Hand ${index + 1}: Bust`);
			hasLoss = true;
			allPush = false;
		} else if (dealerBust) {
			totalWinnings += bet * 2;
			resultMessages.push(`Hand ${index + 1}: Win!`);
			hasWin = true;
			allPush = false;
			if (wasDoubled) stats.doubleDownWins++;
		} else if (playerValue > dealerValue) {
			totalWinnings += bet * 2;
			resultMessages.push(`Hand ${index + 1}: Win!`);
			hasWin = true;
			allPush = false;
			if (wasDoubled) stats.doubleDownWins++;
		} else if (playerValue === dealerValue) {
			totalWinnings += bet;
			resultMessages.push(`Hand ${index + 1}: Push`);
		} else {
			resultMessages.push(`Hand ${index + 1}: Lose`);
			hasLoss = true;
			allPush = false;
		}
	});

	bankroll += totalWinnings;

	const profit = totalWinnings - currentBet;
	stats.netWinLoss += profit;
	if (profit > stats.largestWin) stats.largestWin = profit;

	// Update statistics
	stats.handsPlayed++;
	if (allPush) {
		stats.pushes++;
		stats.handHistory.push("P");
		stats.streak = 0;
		stats.streakType = null;
	} else if (hasWin && !hasLoss) {
		stats.wins++;
		stats.handHistory.push("W");
		if (stats.streakType === "win") {
			stats.streak++;
			if (stats.streak > stats.longestWinStreak) {
				stats.longestWinStreak = stats.streak;
			}
		} else {
			stats.streak = 1;
			stats.streakType = "win";
		}
	} else if (hasLoss && !hasWin) {
		stats.losses++;
		stats.handHistory.push("L");
		if (stats.streakType === "loss") {
			stats.streak++;
			if (stats.streak > stats.longestLossStreak) {
				stats.longestLossStreak = stats.streak;
			}
		} else {
			stats.streak = 1;
			stats.streakType = "loss";
		}
	} else {
		// Mixed results
		if (totalWinnings - currentBet > 0) {
			stats.wins++;
			stats.handHistory.push("W");
		} else {
			stats.losses++;
			stats.handHistory.push("L");
		}
		stats.streak = 0;
		stats.streakType = null;
	}

	let message = resultMessages.join(" | ");
	if (dealerBust) {
		message = "Dealer Bust! " + message;
	}

	const netResult = totalWinnings - currentBet;
	if (netResult > 0) {
		showMessage(message, "win");
	} else if (netResult === 0) {
		showMessage(message, "info");
	} else {
		showMessage(message, "lose");
	}

	endRound();
}

// End round
function endRound() {
	gameInProgress = false;

	// Update only stats and bankroll, not the cards
	bankrollEl.textContent = `$${bankroll}`;
	handsPlayedEl.textContent = stats.handsPlayed;
	winsEl.textContent = stats.wins;
	lossesEl.textContent = stats.losses;
	pushesEl.textContent = stats.pushes;
	shoeCardsEl.textContent = shoe.length;

	if (stats.streak === 0) {
		streakEl.textContent = "-";
		streakEl.className = "stat-value";
	} else if (stats.streakType === "win") {
		streakEl.textContent = `W${stats.streak}`;
		streakEl.className = "stat-value win";
	} else {
		streakEl.textContent = `L${stats.streak}`;
		streakEl.className = "stat-value lose";
	}

	newRoundBtn.style.display = "inline-block";
	hitBtn.disabled = true;
	standBtn.disabled = true;
	doubleBtn.disabled = true;
	splitBtn.disabled = true;

	if (bankroll <= 0) {
		showMessage("Game Over! Out of money", "lose");
		dealBtn.disabled = true;
		newRoundBtn.textContent = "RESET GAME";
	}

	// Check if cut card was reached and shuffle needed
	if (cutCardReached) {
		setTimeout(() => {
			showMessage("🎴 Shuffling shoe... Cut card reached", "info");
			setTimeout(() => {
				shoe = createShoe();
				shuffle(shoe);
				setRandomCutCardPosition(); // Set new random position
				cutCardReached = false;
				updateDisplay();
				if (!autoPlaying) {
					showMessage(
						"Shoe shuffled. Place your bet to continue",
						"info"
					);
				}
			}, 1500);
		}, 500);
	}

	// Auto-play continues immediately without showing NEW ROUND button
	if (autoPlaying && bankroll > 0) {
		newRoundBtn.style.display = "none";
		const delay = cutCardReached ? 1000 : 600;
		setTimeout(() => {
			autoPlayStartNewRound();
		}, delay);
	}
}

// New round
function newRound() {
	if (bankroll <= 0) {
		bankroll = 1000;
	}

	newRoundBtn.textContent = "NEW ROUND";
	newRoundBtn.style.display = "none";
	dealBtn.disabled = false;
	bettingArea.style.display = "block";
	playerHands = [[]];
	playerBets = [];
	dealerHand = [];
	currentHandIndex = 0;
	currentBet = 0;
	gameInProgress = false;
	dealerHoleCard = null;

	dealerCardsEl.innerHTML = "";
	playerHandsEl.innerHTML = "";

	updateDisplay();
	showMessage("Place your bet and click Deal to start", "info");
	updateButtons();

	// Only continue auto-play if manually triggered
}

// Auto-play functions
function toggleAutoPlay() {
	if (autoPlaying) {
		stopAutoPlay();
	} else {
		startAutoPlay();
	}
}

function startAutoPlay() {
	autoPlaying = true;
	autoPlayRounds = 0;
	autoPlayMaxRounds = parseInt(autoRoundsInput.value) || 10;
	autoPlayBtn.textContent = "STOP AUTO";
	autoPlayBtn.classList.add("active");
	dealBtn.disabled = true;
	betInput.disabled = true;
	autoRoundsInput.disabled = true;
	showMessage(
		`Auto-playing with Basic Strategy (${autoPlayMaxRounds} rounds)`,
		"info"
	);

	if (!gameInProgress) {
		setTimeout(autoPlayNextRound, 500);
	} else {
		autoPlayCurrentHand();
	}
}

function stopAutoPlay() {
	autoPlaying = false;
	autoPlayBtn.textContent = "AUTO PLAY";
	autoPlayBtn.classList.remove("active");
	dealBtn.disabled = false;
	betInput.disabled = false;
	autoRoundsInput.disabled = false;
	showMessage("Auto-play stopped", "info");
}

function autoPlayStartNewRound() {
	if (!autoPlaying || autoPlayRounds >= autoPlayMaxRounds || bankroll <= 0) {
		stopAutoPlay();
		if (bankroll <= 0) {
			showMessage("Auto-play stopped: Out of money", "lose");
			newRoundBtn.style.display = "inline-block";
		} else if (autoPlayRounds >= autoPlayMaxRounds) {
			showMessage(
				`Auto-play completed ${autoPlayMaxRounds} rounds`,
				"info"
			);
			newRoundBtn.style.display = "inline-block";
		}
		return;
	}

	// Reset for new round without clicking NEW ROUND button
	playerHands = [[]];
	playerBets = [];
	dealerHand = [];
	currentHandIndex = 0;
	currentBet = 0;
	gameInProgress = false;
	dealerHoleCard = null;

	dealerCardsEl.innerHTML = "";
	playerHandsEl.innerHTML = "";

	// Immediately start next round
	autoPlayNextRound();
}

function autoPlayNextRound() {
	if (!autoPlaying || autoPlayRounds >= autoPlayMaxRounds || bankroll <= 0) {
		stopAutoPlay();
		if (bankroll <= 0) {
			showMessage("Auto-play stopped: Out of money", "lose");
			newRoundBtn.style.display = "inline-block";
		} else if (autoPlayRounds >= autoPlayMaxRounds) {
			showMessage(
				`Auto-play completed ${autoPlayMaxRounds} rounds`,
				"info"
			);
			newRoundBtn.style.display = "inline-block";
		}
		return;
	}

	autoPlayRounds++;

	if (gameInProgress) {
		return;
	}

	// Start new round
	const betAmount = parseInt(betInput.value);
	if (betAmount > bankroll) {
		stopAutoPlay();
		showMessage("Auto-play stopped: Insufficient funds for bet", "lose");
		newRoundBtn.style.display = "inline-block";
		return;
	}

	deal();
	setTimeout(() => {
		if (autoPlaying && gameInProgress) {
			autoPlayCurrentHand();
		}
	}, 1500);
}

function autoPlayCurrentHand() {
	if (!autoPlaying || !gameInProgress) return;

	const currentHand = playerHands[currentHandIndex];
	const playerValue = calculateHandValue(currentHand);

	if (playerValue > 21) {
		return;
	}

	const dealerUpcard = getDealerUpcard();
	const move = getBasicStrategyMove(currentHand, dealerUpcard);

	setTimeout(() => {
		if (!autoPlaying || !gameInProgress) return;

		switch (move) {
			case "hit":
				hit();
				setTimeout(() => {
					if (autoPlaying && gameInProgress) autoPlayCurrentHand();
				}, autoPlayDelay);
				break;
			case "stand":
				stand();
				break;
			case "double":
				if (!doubleBtn.disabled) {
					doubleDown();
				} else {
					hit();
					setTimeout(() => {
						if (autoPlaying && gameInProgress)
							autoPlayCurrentHand();
					}, autoPlayDelay);
				}
				break;
			case "split":
				if (!splitBtn.disabled) {
					split();
					setTimeout(() => {
						if (autoPlaying && gameInProgress)
							autoPlayCurrentHand();
					}, autoPlayDelay);
				} else {
					const altMove = getBasicStrategyMove(
						currentHand,
						dealerUpcard
					);
					if (altMove === "stand") {
						stand();
					} else {
						hit();
						setTimeout(() => {
							if (autoPlaying && gameInProgress)
								autoPlayCurrentHand();
						}, autoPlayDelay);
					}
				}
				break;
		}
	}, autoPlayDelay);
}

// Event listeners
dealBtn.addEventListener("click", deal);
hitBtn.addEventListener("click", hit);
standBtn.addEventListener("click", stand);
doubleBtn.addEventListener("click", doubleDown);
splitBtn.addEventListener("click", split);
newRoundBtn.addEventListener("click", newRound);
nextCardsToggle.addEventListener("click", toggleNextCards);
statsToggle.addEventListener("click", toggleStatsPanel);
autoPlayBtn.addEventListener("click", toggleAutoPlay);

// Disclaimer toggle
const disclaimerToggle = document.getElementById("disclaimerToggle");
const disclaimerContent = document.getElementById("disclaimerContent");

disclaimerToggle.addEventListener("click", () => {
	disclaimerContent.classList.toggle("expanded");
	disclaimerToggle.classList.toggle("active");
});

// Initialize shoe and display
shoe = createShoe();
shuffle(shoe);
setRandomCutCardPosition(); // Set initial random cut card position
cutCardReached = false;
updateDisplay();
updateNextCardsPreview();
