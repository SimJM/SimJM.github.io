// Game state
let shoe = [];
let dealerHand = [];
let playerHands = [[]];
let playerBets = [];
let currentHandIndex = 0;
let bankroll = 1000;
let currentBet = 0;
let gameInProgress = false;
let canDouble = true;
let canSplit = false;
let dealerHoleCard = null;

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
const bettingArea = document.getElementById("bettingArea");
const dealBtn = document.getElementById("dealBtn");
const hitBtn = document.getElementById("hitBtn");
const standBtn = document.getElementById("standBtn");
const doubleBtn = document.getElementById("doubleBtn");
const splitBtn = document.getElementById("splitBtn");
const newRoundBtn = document.getElementById("newRoundBtn");

// Create a 6-deck shoe (312 cards)
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

// Deal a card from the shoe
function dealCard() {
	if (shoe.length === 0) {
		shoe = createShoe();
		shuffle(shoe);
	}
	return shoe.pop();
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
	currentBetEl.textContent = `$${currentBet}`;

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
	playerHands = [[]];
	playerBets = [betAmount];
	dealerHand = [];
	currentHandIndex = 0;
	gameInProgress = true;
	canDouble = true;
	canSplit = false;

	// Hide betting area and deal button
	bettingArea.style.display = "none";
	dealBtn.disabled = true;

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

			if (playerBlackjack && dealerBlackjack) {
				bankroll += currentBet;
				showMessage("Both Blackjack! Push", "info");
			} else if (playerBlackjack) {
				const winnings = Math.floor(currentBet * 2.5);
				bankroll += winnings;
				showMessage("Blackjack! You win 3:2", "win");
			} else {
				showMessage("Dealer Blackjack! You lose", "lose");
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

		setTimeout(() => {
			holeCardEl.className = `card ${getCardColor(dealerHand[1].suit)}`;
			holeCardEl.textContent = `${dealerHand[1].value}${dealerHand[1].suit}`;
			dealerTotalEl.textContent = `Total: ${calculateHandValue(
				dealerHand
			)}`;

			setTimeout(() => {
				holeCardEl.classList.remove("flipping");
			}, 600);
		}, 300);
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
	}
}

// Player doubles down
function doubleDown() {
	if (bankroll < playerBets[currentHandIndex]) {
		showMessage("Insufficient funds to double down", "lose");
		return;
	}

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

	let totalWinnings = 0;
	let resultMessages = [];

	playerHands.forEach((hand, index) => {
		const playerValue = calculateHandValue(hand);
		const playerBust = playerValue > 21;
		const bet = playerBets[index];

		if (playerBust) {
			resultMessages.push(`Hand ${index + 1}: Bust`);
		} else if (dealerBust) {
			totalWinnings += bet * 2;
			resultMessages.push(`Hand ${index + 1}: Win!`);
		} else if (playerValue > dealerValue) {
			totalWinnings += bet * 2;
			resultMessages.push(`Hand ${index + 1}: Win!`);
		} else if (playerValue === dealerValue) {
			totalWinnings += bet;
			resultMessages.push(`Hand ${index + 1}: Push`);
		} else {
			resultMessages.push(`Hand ${index + 1}: Lose`);
		}
	});

	bankroll += totalWinnings;

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
	updateDisplay();
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
}

// Event listeners
dealBtn.addEventListener("click", deal);
hitBtn.addEventListener("click", hit);
standBtn.addEventListener("click", stand);
doubleBtn.addEventListener("click", doubleDown);
splitBtn.addEventListener("click", split);
newRoundBtn.addEventListener("click", newRound);

// Initialize shoe and display
shoe = createShoe();
shuffle(shoe);
updateDisplay();
