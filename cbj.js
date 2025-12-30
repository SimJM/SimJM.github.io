// Cryptographically secure random number generator
// Replaces Math.random() for fair, unpredictable randomness in casino games
function secureRandom() {
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	return array[0] / (0xffffffff + 1);
}

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

// Super Auto state
let superAutoPlaying = false;
let superAutoRounds = 0;
let superAutoMaxRounds = 10;

// Bankroll history for charting
let bankrollHistory = [];

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
const hintBtn = document.getElementById("hintBtn");
const newRoundBtn = document.getElementById("newRoundBtn");
const autoPlayBtn = document.getElementById("autoPlayBtn");
const superAutoBtn = document.getElementById("superAutoBtn");

// Chart elements
const chartToggle = document.getElementById("chartToggle");
const chartWrapper = document.getElementById("chartWrapper");
const chartToggleIcon = document.getElementById("chartToggleIcon");
const bankrollChart = document.getElementById("bankrollChart");
const chartDataPoints = document.getElementById("chartDataPoints");
const clearChartBtn = document.getElementById("clearChartBtn");

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

// Hint dialog elements
const hintOverlay = document.getElementById("hintOverlay");
const hintClose = document.getElementById("hintClose");
const hintOk = document.getElementById("hintOk");
const hintSituation = document.getElementById("hintSituation");
const hintAction = document.getElementById("hintAction");
const hintExplanation = document.getElementById("hintExplanation");

// Set random cut card position (1-1.5 decks from end, like real casinos)
// Uses cryptographically secure random for fair, unpredictable placement
function setRandomCutCardPosition() {
	// Random position between 52 cards (1 deck) and 78 cards (1.5 decks)
	cutCardPosition = Math.floor(secureRandom() * (78 - 52 + 1)) + 52;
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

// Shuffle the shoe using Fisher-Yates algorithm with cryptographically secure randomness
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(secureRandom() * (i + 1));
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
	// Note: The calling code should check canSplit flag and bankroll availability
	if (isPair) {
		const pairValue = hand[0].value;
		// Always split Aces and 8s
		if (pairValue === "A" || pairValue === "8") return "split";

		// Pair of 9s: Split vs 2-6, 8-9 (skip 7, stand vs 10/A)
		if (pairValue === "9") {
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

		// Pair of 7s: Split vs 2-7
		if (pairValue === "7") {
			if (dealerUpcard >= 2 && dealerUpcard <= 7) return "split";
		}

		// Pair of 6s: Split vs 2-6
		if (pairValue === "6") {
			if (dealerUpcard >= 2 && dealerUpcard <= 6) return "split";
		}

		// Pair of 4s: Split vs 5-6 only
		if (pairValue === "4") {
			if (dealerUpcard >= 5 && dealerUpcard <= 6) return "split";
		}

		// Pair of 3s: Split vs 2-7
		if (pairValue === "3") {
			if (dealerUpcard >= 2 && dealerUpcard <= 7) return "split";
		}

		// Pair of 2s: Split vs 2-7
		if (pairValue === "2") {
			if (dealerUpcard >= 2 && dealerUpcard <= 7) return "split";
		}

		// Never split 10s or 5s - continue to regular strategy
		// 10s: treat as 20 (stand)
		// 5s: treat as 10 (double if possible, else hit)
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
		// Soft 16-17 (A,5 / A,6) - per documented strategy
		if (hand.length === 2 && playerValue >= 16 && playerValue <= 17) {
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

// Get explanation for Basic Strategy decision
function getBasicStrategyExplanation(hand, dealerUpcard, move) {
	const playerValue = calculateHandValue(hand);
	const isSoft = isSoftHand(hand);
	const isPair = hand.length === 2 && hand[0].value === hand[1].value;
	const dealerCard = dealerUpcard === 11 ? "Ace" : dealerUpcard;

	// Pair explanations
	if (isPair && move === "split") {
		const pairValue = hand[0].value;
		if (pairValue === "A") {
			return "Always split Aces! Two chances at blackjack (21) is better than one hand starting at 12. This is a fundamental rule of Basic Strategy.";
		}
		if (pairValue === "8") {
			return "Always split 8s! Starting with 16 is the worst hand in blackjack. Two hands of 8 give you much better chances to improve.";
		}
		if (["2", "3", "6", "7"].includes(pairValue)) {
			return `Split ${pairValue}s against dealer's weak card (${dealerCard}). The dealer has a 40%+ bust rate when showing 2-6, so maximize your advantage with two hands.`;
		}
		if (pairValue === "9") {
			if (dealerUpcard === 7) {
				return "Stand with pair of 9s against dealer 7. You have 18, which likely beats the dealer's probable 17. Splitting risks two weaker hands.";
			}
			return `Split 9s against dealer ${dealerCard}. Two chances at strong hands (19+) is better than standing on 18 against this dealer card.`;
		}
	}

	// Double down explanations
	if (move === "double") {
		if (playerValue === 11) {
			return `Double on 11! This is one of the best doubling situations. You have high odds of getting a 10-value card for 21, and even a low card keeps you competitive.`;
		}
		if (playerValue === 10) {
			return `Double on 10 against dealer ${dealerCard}. Strong chance of making 20, and the dealer's card suggests they may bust or end up weaker.`;
		}
		if (playerValue === 9) {
			return `Double on 9 against dealer's weak ${dealerCard}. The dealer has high bust potential (40%+), so maximize your bet while you have the advantage.`;
		}
		if (isSoft && playerValue === 18) {
			return `Double soft 18 against dealer's weak ${dealerCard}. You can't bust, and there's great upside to improve to 19-21 while the dealer is likely to bust.`;
		}
		if (isSoft && playerValue >= 15 && playerValue <= 17) {
			return `Double this soft hand against dealer ${dealerCard}. You can't bust, the dealer is weak (40%+ bust rate), so double your bet to maximize profit.`;
		}
	}

	// Soft hand explanations
	if (isSoft) {
		if (playerValue >= 19) {
			return `Stand on soft ${playerValue}. This is a strong hand. Hitting risks worsening your position, and you're already in excellent shape.`;
		}
		if (playerValue === 18) {
			if (dealerUpcard >= 2 && dealerUpcard <= 8) {
				return `Stand on soft 18 against dealer ${dealerCard}. This beats most dealer outcomes when they show 2-8. Hitting or doubling (without sufficient bankroll) risks a worse result.`;
			}
			return `Hit soft 18 against dealer's strong ${dealerCard}. The dealer likely has 19-21, so you need to improve. Since the Ace can count as 1, you can't bust.`;
		}
		return `Hit soft ${playerValue}. You can't bust (Ace counts as 1 if needed), so always try to improve soft 17 or less. No risk, potential reward.`;
	}

	// Hard hand explanations
	if (move === "stand") {
		if (playerValue >= 17) {
			return `Always stand on ${playerValue}. The risk of busting is too high. Let the dealer play out their hand - they must hit until 17.`;
		}
		if (playerValue >= 13 && playerValue <= 16) {
			return `Stand on ${playerValue} against dealer's weak ${dealerCard}. The dealer has 40%+ chance to bust when showing 2-6. Don't risk busting - let them play.`;
		}
		if (playerValue === 12) {
			return `Stand on 12 against dealer ${dealerCard}. The dealer's cards (4-6) have the highest bust rates. Your risk of busting (if you hit) is significant, so let the dealer bust instead.`;
		}
		if (isPair && hand[0].value === "9" && dealerUpcard === 7) {
			return "Stand on pair of 9s (18 total) against dealer 7. You likely have the better hand (dealer probably has 17). Don't risk splitting into weaker positions.";
		}
	}

	if (move === "hit") {
		if (playerValue >= 13 && playerValue <= 16) {
			return `Hit on ${playerValue} against dealer's strong ${dealerCard}. Dealer showing 7-Ace likely has 17+. You must improve to have a chance, even with bust risk.`;
		}
		if (playerValue === 12) {
			return `Hit on 12 against dealer ${dealerCard}. While there's some bust risk, dealer's strong card means you need to improve. Standing on 12 against 7-Ace loses most of the time.`;
		}
		if (playerValue <= 11) {
			return `Always hit on ${playerValue} or less. You can't bust, so there's no risk. Keep hitting until you reach at least 12.`;
		}
	}

	return "This is the mathematically optimal play based on computer simulations of millions of hands. Basic Strategy minimizes the house edge to ~0.5%.";
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

// Calculate win probability for a given action using Monte Carlo simulation
function calculateWinProbability(playerHand, dealerUpcard, action) {
	const simulations = 10000; // Number of simulations to run
	let wins = 0;
	let losses = 0;
	let pushes = 0;

	// Dealer probabilities based on upcard (standard infinite deck probabilities)
	const dealerFinalValues = simulateDealerOutcomes(dealerUpcard, simulations);

	for (let i = 0; i < simulations; i++) {
		let playerValue = calculateHandValue(playerHand);
		let playerBusted = false;

		// Simulate player action
		if (action === "hit" || action === "double") {
			// Draw one card (for double) or keep hitting (for hit)
			const drawCount =
				action === "double" ? 1 : getHitSimulation(playerValue);
			for (let j = 0; j < drawCount; j++) {
				const card = getRandomCardValue();
				playerValue = addCardToValue(playerValue, card, playerHand);
				if (playerValue > 21) {
					playerBusted = true;
					break;
				}
			}
		}
		// For 'stand', player value stays the same
		// For 'split', we'll calculate based on one hand averaging

		// Compare with dealer outcome
		const dealerValue = dealerFinalValues[i];
		const dealerBusted = dealerValue > 21;

		if (playerBusted) {
			losses++;
		} else if (dealerBusted) {
			wins++;
		} else if (playerValue > dealerValue) {
			wins++;
		} else if (playerValue < dealerValue) {
			losses++;
		} else {
			pushes++;
		}
	}

	const winRate = (wins / simulations) * 100;
	const loseRate = (losses / simulations) * 100;
	const pushRate = (pushes / simulations) * 100;

	return {winRate, loseRate, pushRate};
}

// Simulate dealer final outcomes based on upcard
function simulateDealerOutcomes(dealerUpcard, count) {
	const outcomes = [];
	for (let i = 0; i < count; i++) {
		let dealerValue = dealerUpcard;
		// Dealer draws hole card
		const holeCard = getRandomCardValue();
		dealerValue = addCardToValue(dealerValue, holeCard, []);

		// Dealer hits until 17+
		while (dealerValue < 17) {
			const card = getRandomCardValue();
			dealerValue = addCardToValue(dealerValue, card, []);
			if (dealerValue > 21) break;
		}
		outcomes.push(dealerValue);
	}
	return outcomes;
}

// Get random card value (1-11, where 1 is Ace, 10 for face cards)
function getRandomCardValue() {
	const rand = Math.random();
	if (rand < 1 / 13) return 11; // Ace (treated as 11 initially)
	if (rand < 5 / 13) return Math.floor(rand * 13) + 2; // 2-5
	if (rand < 9 / 13) return Math.floor((rand - 5 / 13) * (13 * 4)) + 6; // 6-9
	return 10; // 10, J, Q, K (4 cards worth 10)
}

// Add card value to total, handling soft aces
function addCardToValue(currentValue, cardValue, hand) {
	let newValue = currentValue + cardValue;
	// If bust and we have a soft ace, convert it
	if (newValue > 21 && cardValue === 11) {
		newValue -= 10; // Convert ace from 11 to 1
	}
	return newValue;
}

// Simulate how many hits a player would take for a given value (conservative)
function getHitSimulation(playerValue) {
	if (playerValue >= 17) return 0;
	if (playerValue >= 12) return 1; // Conservative, typically would stand on some
	return Math.floor(Math.random() * 2) + 1; // 1-2 hits for low values
}

// Show hint dialog
function showHint() {
	if (!gameInProgress) return;

	const currentHand = playerHands[currentHandIndex];
	const playerValue = calculateHandValue(currentHand);
	const isSoft = isSoftHand(currentHand);
	const isPair =
		currentHand.length === 2 &&
		currentHand[0].value === currentHand[1].value;
	const dealerUpcard = getDealerUpcard();
	const dealerCard = dealerUpcard === 11 ? "Ace" : dealerUpcard;

	// Get recommended move
	const move = getBasicStrategyMove(currentHand, dealerUpcard);

	// Build situation description
	let handType = "";
	if (isPair) {
		handType = `Pair of ${currentHand[0].value}s (${playerValue} total)`;
	} else if (isSoft) {
		handType = `Soft ${playerValue}`;
	} else {
		handType = `Hard ${playerValue}`;
	}

	const situation = `You have: ${handType}<br>Dealer shows: ${dealerCard}`;

	// Calculate probabilities for each possible action
	const standProb = calculateWinProbability(
		currentHand,
		dealerUpcard,
		"stand"
	);
	const hitProb = calculateWinProbability(currentHand, dealerUpcard, "hit");

	let probabilities = `
		<div class="probability-grid">
			<div class="prob-item ${move === "stand" ? "recommended" : ""}">
				<div class="prob-action">STAND</div>
				<div class="prob-stats">
					<span class="prob-win">Win: ${standProb.winRate.toFixed(1)}%</span>
					<span class="prob-lose">Lose: ${standProb.loseRate.toFixed(1)}%</span>
					<span class="prob-push">Push: ${standProb.pushRate.toFixed(1)}%</span>
				</div>
			</div>
			<div class="prob-item ${move === "hit" ? "recommended" : ""}">
				<div class="prob-action">HIT</div>
				<div class="prob-stats">
					<span class="prob-win">Win: ${hitProb.winRate.toFixed(1)}%</span>
					<span class="prob-lose">Lose: ${hitProb.loseRate.toFixed(1)}%</span>
					<span class="prob-push">Push: ${hitProb.pushRate.toFixed(1)}%</span>
				</div>
			</div>
	`;

	// Add double probability if available
	if (
		currentHand.length === 2 &&
		canDouble &&
		bankroll >= playerBets[currentHandIndex]
	) {
		const doubleProb = calculateWinProbability(
			currentHand,
			dealerUpcard,
			"double"
		);
		probabilities += `
			<div class="prob-item ${move === "double" ? "recommended" : ""}">
				<div class="prob-action">DOUBLE</div>
				<div class="prob-stats">
					<span class="prob-win">Win: ${doubleProb.winRate.toFixed(1)}%</span>
					<span class="prob-lose">Lose: ${doubleProb.loseRate.toFixed(1)}%</span>
					<span class="prob-push">Push: ${doubleProb.pushRate.toFixed(1)}%</span>
				</div>
			</div>
		`;
	}

	// Add split probability if available
	if (isPair && canSplit && bankroll >= currentBet) {
		const splitProb = calculateWinProbability(
			[currentHand[0]],
			dealerUpcard,
			"hit"
		);
		probabilities += `
			<div class="prob-item ${move === "split" ? "recommended" : ""}">
				<div class="prob-action">SPLIT</div>
				<div class="prob-stats">
					<span class="prob-win">Win: ${splitProb.winRate.toFixed(1)}%</span>
					<span class="prob-lose">Lose: ${splitProb.loseRate.toFixed(1)}%</span>
					<span class="prob-push">Push: ${splitProb.pushRate.toFixed(1)}%</span>
				</div>
				<div class="prob-note">Per hand average</div>
			</div>
		`;
	}

	probabilities += `</div>`;

	// Get action text
	const actionText = move.toUpperCase();

	// Get explanation
	const explanation = getBasicStrategyExplanation(
		currentHand,
		dealerUpcard,
		move
	);

	// Update dialog content
	hintSituation.innerHTML = situation;
	hintAction.textContent = actionText;
	hintExplanation.innerHTML =
		probabilities + '<p class="explanation-text">' + explanation + "</p>";

	// Show dialog
	hintOverlay.classList.add("active");
}

// Close hint dialog
function closeHint() {
	hintOverlay.classList.remove("active");
}

// Update buttons
function updateButtons() {
	// During auto-play, disable all action buttons
	if (autoPlaying) {
		hitBtn.disabled = true;
		standBtn.disabled = true;
		doubleBtn.disabled = true;
		splitBtn.disabled = true;
		hintBtn.disabled = true;
		dealBtn.disabled = true;
		newRoundBtn.disabled = true;
		return;
	}

	if (!gameInProgress) {
		hitBtn.disabled = true;
		standBtn.disabled = true;
		doubleBtn.disabled = true;
		splitBtn.disabled = true;
		hintBtn.disabled = true;
		return;
	}

	const currentHand = playerHands[currentHandIndex];
	hitBtn.disabled = false;
	standBtn.disabled = false;
	hintBtn.disabled = false;

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

			// Track bankroll for chart
			addBankrollDataPoint();

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

	// Track bankroll for chart
	addBankrollDataPoint();

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
	newRoundBtn.disabled = true;
	updateButtons(); // Disable all game action buttons
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
	newRoundBtn.disabled = false;
	showMessage("Auto-play stopped", "info");
	updateButtons(); // Re-enable game buttons based on current state
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

// Super Auto functions - instant play without animations
function toggleSuperAuto() {
	if (superAutoPlaying) {
		stopSuperAuto();
	} else {
		startSuperAuto();
	}
}

function startSuperAuto() {
	superAutoPlaying = true;
	superAutoRounds = 0;
	superAutoMaxRounds = parseInt(autoRoundsInput.value) || 10;
	superAutoBtn.textContent = "STOP SUPER AUTO";
	superAutoBtn.classList.add("active");
	dealBtn.disabled = true;
	betInput.disabled = true;
	autoRoundsInput.disabled = true;
	autoPlayBtn.disabled = true;
	newRoundBtn.disabled = true;
	updateButtons();
	showMessage(`Super Auto-playing (${superAutoMaxRounds} rounds)...`, "info");

	// Run all rounds instantly
	runSuperAutoRounds();
}

function stopSuperAuto() {
	superAutoPlaying = false;
	superAutoBtn.textContent = "SUPER AUTO";
	superAutoBtn.classList.remove("active");
	dealBtn.disabled = false;
	betInput.disabled = false;
	autoRoundsInput.disabled = false;
	autoPlayBtn.disabled = false;
	newRoundBtn.disabled = false;
	updateDisplay();
	updateButtons();
	showMessage("Super Auto stopped", "info");
}

function runSuperAutoRounds() {
	let roundsCompleted = 0;

	while (roundsCompleted < superAutoMaxRounds && bankroll > 0) {
		const betAmount = parseInt(betInput.value);

		if (betAmount > bankroll) {
			break;
		}

		// Instant deal without animations
		instantDeal();

		// Play hands using basic strategy
		while (currentHandIndex < playerHands.length) {
			instantPlayHand();
		}

		// Dealer plays
		instantDealerPlay();

		// Resolve hands
		instantResolveHands();

		// Check for shuffle
		if (cutCardReached) {
			shoe = createShoe();
			shuffle(shoe);
			setRandomCutCardPosition();
			cutCardReached = false;
		}

		// Reset for next round
		playerHands = [[]];
		playerBets = [];
		doubledDown = [];
		dealerHand = [];
		currentHandIndex = 0;
		currentBet = 0;
		gameInProgress = false;
		dealerHoleCard = null;

		roundsCompleted++;
		superAutoRounds++;

		// Track bankroll for chart after every round
		addBankrollDataPoint();
	}

	// Update display with final results
	stopSuperAuto();

	if (bankroll <= 0) {
		showMessage(
			`Super Auto completed ${roundsCompleted} rounds - Out of money!`,
			"lose"
		);
		newRoundBtn.textContent = "RESET GAME";
		newRoundBtn.style.display = "inline-block";
	} else {
		showMessage(`Super Auto completed ${roundsCompleted} rounds`, "info");
		newRoundBtn.style.display = "inline-block";
	}
}

function instantDeal() {
	const betAmount = parseInt(betInput.value);
	currentBet = betAmount;
	bankroll -= betAmount;
	stats.totalWagered += betAmount;

	playerHands = [[]];
	playerBets = [betAmount];
	doubledDown = [false];
	dealerHand = [];
	currentHandIndex = 0;
	gameInProgress = true;
	canDouble = true;
	canSplit = false;

	// Deal cards instantly
	playerHands[0].push(dealCard());
	dealerHand.push(dealCard());
	playerHands[0].push(dealCard());
	dealerHand.push(dealCard());
	dealerHoleCard = dealerHand[1];

	// Check for splits
	if (
		playerHands[0][0].value === playerHands[0][1].value &&
		bankroll >= betAmount
	) {
		canSplit = true;
	}

	// Handle blackjacks instantly
	const playerBlackjack = checkBlackjack(playerHands[0]);
	const dealerBlackjack = checkBlackjack(dealerHand);

	if (playerBlackjack || dealerBlackjack) {
		stats.handsPlayed++;

		if (playerBlackjack && dealerBlackjack) {
			bankroll += currentBet;
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
			// Dealer blackjack
			stats.netWinLoss -= currentBet;
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

		gameInProgress = false;
		currentHandIndex = playerHands.length;
	}
}

function instantPlayHand() {
	if (currentHandIndex >= playerHands.length || !gameInProgress) return;

	const currentHand = playerHands[currentHandIndex];
	let playerValue = calculateHandValue(currentHand);

	// Player busted or has 21
	if (playerValue > 21) {
		stats.busts++;
		currentHandIndex++;
		return;
	}

	if (playerValue === 21) {
		currentHandIndex++;
		return;
	}

	// Use basic strategy
	while (playerValue < 21) {
		const dealerUpcard = getDealerUpcard();
		const move = getBasicStrategyMove(currentHand, dealerUpcard);

		if (move === "stand") {
			break;
		} else if (move === "hit") {
			const card = dealCard();
			currentHand.push(card);
			playerValue = calculateHandValue(currentHand);
		} else if (
			move === "double" &&
			currentHand.length === 2 &&
			bankroll >= playerBets[currentHandIndex]
		) {
			// Double down
			bankroll -= playerBets[currentHandIndex];
			stats.totalWagered += playerBets[currentHandIndex];
			currentBet += playerBets[currentHandIndex];
			playerBets[currentHandIndex] *= 2;
			doubledDown[currentHandIndex] = true;
			stats.doubleDownAttempts++;
			canDouble = false;

			const card = dealCard();
			currentHand.push(card);
			playerValue = calculateHandValue(currentHand);
			break;
		} else if (
			move === "split" &&
			canSplit &&
			currentHand.length === 2 &&
			currentHand[0].value === currentHand[1].value &&
			bankroll >= playerBets[currentHandIndex]
		) {
			// Split
			const splitCard = currentHand.pop();
			playerHands.push([splitCard]);
			playerBets.push(playerBets[currentHandIndex]);
			doubledDown.push(false);
			bankroll -= playerBets[currentHandIndex];
			stats.totalWagered += playerBets[currentHandIndex];
			currentBet += playerBets[currentHandIndex];

			// Deal new cards
			currentHand.push(dealCard());
			playerHands[playerHands.length - 1].push(dealCard());

			canSplit = false;
			canDouble = true; // Allow doubling after split on first hand
			playerValue = calculateHandValue(currentHand);
		} else {
			// Can't perform preferred action, hit instead
			const card = dealCard();
			currentHand.push(card);
			playerValue = calculateHandValue(currentHand);
		}
	}

	if (playerValue > 21) {
		stats.busts++;
	}

	currentHandIndex++;
}

function instantDealerPlay() {
	if (!gameInProgress) return;

	// Check if all player hands busted
	const allBusted = playerHands.every(
		(hand) => calculateHandValue(hand) > 21
	);

	if (allBusted) {
		return;
	}

	// Dealer draws to 17
	let dealerValue = calculateHandValue(dealerHand);
	while (dealerValue < 17) {
		dealerHand.push(dealCard());
		dealerValue = calculateHandValue(dealerHand);
	}

	if (dealerValue > 21) {
		stats.dealerBusts++;
	}
}

function instantResolveHands() {
	// Skip if game already ended (e.g., blackjacks were handled in instantDeal)
	if (!gameInProgress && currentHandIndex >= playerHands.length) {
		return;
	}

	const dealerValue = calculateHandValue(dealerHand);
	const dealerBust = dealerValue > 21;

	let totalWinnings = 0;
	let hasWin = false;
	let hasLoss = false;
	let allPush = true;

	playerHands.forEach((hand, index) => {
		const playerValue = calculateHandValue(hand);
		const bet = playerBets[index];
		const wasDoubled = doubledDown[index];

		if (playerValue > 21) {
			// Player busted
			hasLoss = true;
			allPush = false;
		} else if (dealerBust) {
			totalWinnings += bet * 2;
			hasWin = true;
			allPush = false;
			if (wasDoubled) stats.doubleDownWins++;
		} else if (playerValue > dealerValue) {
			totalWinnings += bet * 2;
			hasWin = true;
			allPush = false;
			if (wasDoubled) stats.doubleDownWins++;
		} else if (playerValue === dealerValue) {
			totalWinnings += bet;
		} else {
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

	gameInProgress = false;
}

// ============================================
// BANKROLL CHART SYSTEM
// ============================================

// Chart state
let chartExpanded = false;
let chartCtx = null;
let chartInitialized = false;

// Toggle chart visibility
function toggleChart() {
	chartExpanded = !chartExpanded;
	chartWrapper.classList.toggle("expanded");
	chartToggle.classList.toggle("active");
	chartToggleIcon.textContent = chartExpanded ? "▲" : "▼";

	if (chartExpanded && !chartInitialized) {
		initChart();
	}

	if (chartExpanded) {
		drawChart();
	}
}

// Initialize chart canvas
function initChart() {
	const canvas = bankrollChart;
	const container = canvas.parentElement;

	// Set canvas size to match container
	const resizeCanvas = () => {
		const dpr = window.devicePixelRatio || 1;
		const rect = container.getBoundingClientRect();
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		canvas.style.width = rect.width + "px";
		canvas.style.height = rect.height + "px";
		chartCtx = canvas.getContext("2d");
		chartCtx.scale(dpr, dpr);
		if (chartExpanded) drawChart();
	};

	resizeCanvas();
	window.addEventListener("resize", resizeCanvas);
	chartInitialized = true;

	// Initialize with starting bankroll
	if (bankrollHistory.length === 0) {
		bankrollHistory.push({hands: 0, bankroll: 1000});
	}
}

// Add data point to bankroll history
function addBankrollDataPoint() {
	bankrollHistory.push({
		hands: stats.handsPlayed,
		bankroll: bankroll,
	});

	updateChartInfo();

	if (chartExpanded) {
		// Only redraw periodically for performance
		if (
			bankrollHistory.length % 10 === 0 ||
			bankrollHistory.length < 1000
		) {
			drawChart();
		}
	}
}

// Update chart info display
function updateChartInfo() {
	const count = bankrollHistory.length;
	if (count > 1000000) {
		chartDataPoints.textContent = `${(count / 1000000).toFixed(
			2
		)}M data points`;
	} else if (count > 1000) {
		chartDataPoints.textContent = `${(count / 1000).toFixed(
			1
		)}K data points`;
	} else {
		chartDataPoints.textContent = `${count} data points`;
	}
}

// Clear chart data
function clearChartData() {
	bankrollHistory = [{hands: stats.handsPlayed, bankroll: bankroll}];
	updateChartInfo();
	if (chartExpanded) {
		drawChart();
	}
}

// Downsample data using Largest-Triangle-Three-Buckets algorithm
// This reduces 10M points to ~2000 while preserving visual trends
function downsampleData(data, threshold) {
	if (data.length <= threshold) {
		return data;
	}

	const sampled = [];
	const bucketSize = (data.length - 2) / (threshold - 2);

	sampled.push(data[0]); // Always keep first point

	for (let i = 0; i < threshold - 2; i++) {
		const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
		const avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
		const avgRangeLength = avgRangeEnd - avgRangeStart;

		let avgX = 0,
			avgY = 0;
		for (let j = avgRangeStart; j < avgRangeEnd; j++) {
			avgX += data[j].hands;
			avgY += data[j].bankroll;
		}
		avgX /= avgRangeLength;
		avgY /= avgRangeLength;

		const rangeStart = Math.floor(i * bucketSize) + 1;
		const rangeEnd = Math.floor((i + 1) * bucketSize) + 1;

		const pointA = sampled[sampled.length - 1];
		let maxArea = -1;
		let maxAreaPoint = null;

		for (let j = rangeStart; j < rangeEnd; j++) {
			const area = Math.abs(
				(pointA.hands - avgX) * (data[j].bankroll - pointA.bankroll) -
					(pointA.hands - data[j].hands) * (avgY - pointA.bankroll)
			);
			if (area > maxArea) {
				maxArea = area;
				maxAreaPoint = data[j];
			}
		}

		sampled.push(maxAreaPoint);
	}

	sampled.push(data[data.length - 1]); // Always keep last point
	return sampled;
}

// Draw the chart
function drawChart() {
	if (!chartCtx || bankrollHistory.length < 2) return;

	const canvas = bankrollChart;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const ctx = chartCtx;

	// Clear canvas
	ctx.clearRect(0, 0, width, height);

	// Downsample data if needed (max 2000 points for smooth rendering)
	const data = downsampleData(bankrollHistory, 2000);

	// Calculate bounds
	const minHands = 0;
	const maxHands = data[data.length - 1].hands;
	const minBankroll = Math.min(...data.map((d) => d.bankroll), 0);
	const maxBankroll = Math.max(...data.map((d) => d.bankroll));

	// Add padding
	const padding = {top: 20, right: 20, bottom: 40, left: 60};
	const chartWidth = width - padding.left - padding.right;
	const chartHeight = height - padding.top - padding.bottom;

	// Scale functions
	const scaleX = (hands) => padding.left + (hands / maxHands) * chartWidth;
	const scaleY = (bankroll) => {
		const range = maxBankroll - minBankroll;
		return (
			padding.top +
			chartHeight -
			((bankroll - minBankroll) / range) * chartHeight
		);
	};

	// Draw grid
	ctx.strokeStyle = "rgba(255, 215, 0, 0.1)";
	ctx.lineWidth = 1;

	// Horizontal grid lines (5 lines)
	for (let i = 0; i <= 5; i++) {
		const y = padding.top + (chartHeight / 5) * i;
		ctx.beginPath();
		ctx.moveTo(padding.left, y);
		ctx.lineTo(width - padding.right, y);
		ctx.stroke();

		// Y-axis labels
		const value = maxBankroll - ((maxBankroll - minBankroll) / 5) * i;
		ctx.fillStyle = "#ffd700";
		ctx.font = "11px Arial";
		ctx.textAlign = "right";
		ctx.fillText(`$${Math.round(value)}`, padding.left - 5, y + 4);
	}

	// Vertical grid lines (5 lines)
	for (let i = 0; i <= 5; i++) {
		const x = padding.left + (chartWidth / 5) * i;
		ctx.beginPath();
		ctx.moveTo(x, padding.top);
		ctx.lineTo(x, height - padding.bottom);
		ctx.stroke();

		// X-axis labels
		const value = (maxHands / 5) * i;
		ctx.fillStyle = "#ffd700";
		ctx.font = "11px Arial";
		ctx.textAlign = "center";
		let label;
		if (value > 1000000) {
			label = `${(value / 1000000).toFixed(1)}M`;
		} else if (value > 1000) {
			label = `${(value / 1000).toFixed(0)}K`;
		} else {
			label = Math.round(value).toString();
		}
		ctx.fillText(label, x, height - padding.bottom + 20);
	}

	// Draw zero line if visible
	if (minBankroll < 0 && maxBankroll > 0) {
		const zeroY = scaleY(0);
		ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(padding.left, zeroY);
		ctx.lineTo(width - padding.right, zeroY);
		ctx.stroke();
	}

	// Draw line chart
	ctx.strokeStyle = "#00ff00";
	ctx.lineWidth = 2;
	ctx.beginPath();

	for (let i = 0; i < data.length; i++) {
		const x = scaleX(data[i].hands);
		const y = scaleY(data[i].bankroll);

		if (i === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	}
	ctx.stroke();

	// Draw area under curve with gradient
	const gradient = ctx.createLinearGradient(
		0,
		padding.top,
		0,
		height - padding.bottom
	);
	gradient.addColorStop(0, "rgba(0, 255, 0, 0.3)");
	gradient.addColorStop(1, "rgba(0, 255, 0, 0.05)");
	ctx.fillStyle = gradient;

	ctx.beginPath();
	ctx.moveTo(scaleX(data[0].hands), height - padding.bottom);
	for (let i = 0; i < data.length; i++) {
		const x = scaleX(data[i].hands);
		const y = scaleY(data[i].bankroll);
		ctx.lineTo(x, y);
	}
	ctx.lineTo(scaleX(data[data.length - 1].hands), height - padding.bottom);
	ctx.closePath();
	ctx.fill();

	// Axis labels
	ctx.fillStyle = "#ffd700";
	ctx.font = "bold 12px Arial";
	ctx.textAlign = "center";
	ctx.fillText("Hands Played", width / 2, height - 5);

	ctx.save();
	ctx.translate(15, height / 2);
	ctx.rotate(-Math.PI / 2);
	ctx.fillText("Bankroll ($)", 0, 0);
	ctx.restore();

	// Current value indicator
	if (data.length > 0) {
		const lastPoint = data[data.length - 1];
		const x = scaleX(lastPoint.hands);
		const y = scaleY(lastPoint.bankroll);

		ctx.fillStyle = "#00ff00";
		ctx.beginPath();
		ctx.arc(x, y, 4, 0, Math.PI * 2);
		ctx.fill();

		ctx.strokeStyle = "#ffd700";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(x, y, 6, 0, Math.PI * 2);
		ctx.stroke();
	}
}

// Event listeners
dealBtn.addEventListener("click", deal);
hitBtn.addEventListener("click", hit);
standBtn.addEventListener("click", stand);
doubleBtn.addEventListener("click", doubleDown);
splitBtn.addEventListener("click", split);
hintBtn.addEventListener("click", showHint);
newRoundBtn.addEventListener("click", newRound);
nextCardsToggle.addEventListener("click", toggleNextCards);
statsToggle.addEventListener("click", toggleStatsPanel);
autoPlayBtn.addEventListener("click", toggleAutoPlay);
superAutoBtn.addEventListener("click", toggleSuperAuto);
chartToggle.addEventListener("click", toggleChart);
clearChartBtn.addEventListener("click", clearChartData);

// Hint dialog listeners
hintClose.addEventListener("click", closeHint);
hintOk.addEventListener("click", closeHint);
hintOverlay.addEventListener("click", (e) => {
	if (e.target === hintOverlay) closeHint();
});

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

// Initialize bankroll history with starting point
bankrollHistory.push({hands: 0, bankroll: 1000});
updateChartInfo();
