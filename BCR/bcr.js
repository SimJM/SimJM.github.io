// Cryptographically secure random number generator for fair gameplay
function secureRandom() {
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	return array[0] / (0xffffffff + 1);
}

// Game state
let shoe = [];
let playerHand = [];
let bankerHand = [];
let bankroll = 1000;
let currentBet = 0;
let betType = "player"; // 'player', 'banker', or 'tie'
let gameInProgress = false;

// Auto-play state
let autoPlaying = false;
let autoPlayRounds = 0;
let autoPlayMaxRounds = 10;
let autoPlayDelay = 400;

// Super Auto state
let superAutoPlaying = false;
let superAutoRounds = 0;
let superAutoMaxRounds = 10;

// Statistics
let stats = {
	handsPlayed: 0,
	playerWins: 0,
	bankerWins: 0,
	ties: 0,
	totalWagered: 0,
	netWinLoss: 0,
	totalCommissions: 0,
	handHistory: [], // 'P', 'B', 'T'
	roundHistory: [], // Detailed round information
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
const shoeCardsEl = document.getElementById("shoeCards");
const messageEl = document.getElementById("message");
const playerCardsEl = document.getElementById("playerCards");
const playerTotalEl = document.getElementById("playerTotal");
const bankerCardsEl = document.getElementById("bankerCards");
const bankerTotalEl = document.getElementById("bankerTotal");
const betInput = document.getElementById("betInput");
const autoRoundsInput = document.getElementById("autoRoundsInput");
const bettingArea = document.getElementById("bettingArea");
const dealBtn = document.getElementById("dealBtn");
const autoPlayBtn = document.getElementById("autoPlayBtn");
const superAutoBtn = document.getElementById("superAutoBtn");
const newRoundBtn = document.getElementById("newRoundBtn");
const statsToggle = document.getElementById("statsToggle");
const statsPanel = document.getElementById("statsPanel");
const historyToggle = document.getElementById("historyToggle");
const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");

// Stats elements
const handsPlayedEl = document.getElementById("handsPlayed");
const playerWinsEl = document.getElementById("playerWins");
const bankerWinsEl = document.getElementById("bankerWins");
const tiesEl = document.getElementById("ties");
const totalWageredEl = document.getElementById("totalWagered");
const netWinLossEl = document.getElementById("netWinLoss");
const totalCommissionsEl = document.getElementById("totalCommissions");
const winRateEl = document.getElementById("winRate");
const handHistoryEl = document.getElementById("handHistory");

// Create an 8-deck shoe (416 cards)
function createShoe() {
	const newShoe = [];
	for (let deck = 0; deck < 8; deck++) {
		for (const suit of suits) {
			for (const value of values) {
				newShoe.push({suit, value});
			}
		}
	}
	return newShoe;
}

// Fisher-Yates shuffle algorithm
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(secureRandom() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

// Deal a card from the shoe
function dealCard() {
	if (shoe.length < 6) {
		// Reshuffle if fewer than 6 cards remain
		shoe = createShoe();
		shuffle(shoe);
		showMessage("🎴 Shuffling new shoe...", "info");
	}
	return shoe.pop();
}

// Calculate Baccarat hand total (modulo 10)
function calculateHandTotal(hand) {
	let total = 0;
	for (const card of hand) {
		if (card.value === "A") {
			total += 1;
		} else if (["J", "Q", "K"].includes(card.value)) {
			total += 0;
		} else {
			total += parseInt(card.value);
		}
	}
	return total % 10;
}

// Check if hand is a natural (8 or 9)
function isNatural(total) {
	return total === 8 || total === 9;
}

// Determine if Player draws a third card
function playerDrawsThirdCard(playerTotal) {
	return playerTotal >= 0 && playerTotal <= 5;
}

// Determine if Banker draws a third card
function bankerDrawsThirdCard(bankerTotal, playerThirdCard) {
	if (bankerTotal <= 2) return true;
	if (bankerTotal >= 7) return false;

	// If player didn't draw a third card
	if (playerThirdCard === null) {
		return bankerTotal <= 5;
	}

	// Get the value of player's third card
	const playerThirdValue = getCardValue(playerThirdCard);

	if (bankerTotal === 3) {
		return playerThirdValue !== 8;
	}
	if (bankerTotal === 4) {
		return playerThirdValue >= 2 && playerThirdValue <= 7;
	}
	if (bankerTotal === 5) {
		return playerThirdValue >= 4 && playerThirdValue <= 7;
	}
	if (bankerTotal === 6) {
		return playerThirdValue === 6 || playerThirdValue === 7;
	}

	return false;
}

// Get numeric value of a card for banker draw logic
function getCardValue(card) {
	if (card.value === "A") return 1;
	if (["J", "Q", "K"].includes(card.value)) return 0;
	return parseInt(card.value);
}

// Format card for display
function formatCard(card) {
	const isRed = card.suit === "♥️" || card.suit === "♦️";
	const colorClass = isRed ? "red-card" : "black-card";
	return `<div class="card ${colorClass}">${card.value}${card.suit}</div>`;
}

// Show message
function showMessage(text, type = "info") {
	messageEl.textContent = text;
	messageEl.className = `message ${type}`;
}

// Update display
function updateDisplay() {
	bankrollEl.textContent = `$${bankroll}`;
	currentBetEl.textContent = `$${currentBet || 0}`;
	shoeCardsEl.textContent = shoe.length;

	// Update stats
	handsPlayedEl.textContent = stats.handsPlayed;
	playerWinsEl.textContent = stats.playerWins;
	bankerWinsEl.textContent = stats.bankerWins;
	tiesEl.textContent = stats.ties;
	totalWageredEl.textContent = `$${stats.totalWagered}`;

	const netValue = stats.netWinLoss;
	netWinLossEl.textContent = `${netValue >= 0 ? "+" : ""}$${netValue}`;
	netWinLossEl.className =
		netValue >= 0 ? "stat-value win" : "stat-value lose";

	totalCommissionsEl.textContent = `$${stats.totalCommissions.toFixed(2)}`;

	const winRate =
		stats.handsPlayed > 0
			? (
					((stats.playerWins + stats.bankerWins) /
						stats.handsPlayed) *
					100
			  ).toFixed(1)
			: 0;
	winRateEl.textContent = `${winRate}%`;

	// Update hand history
	updateHandHistory();
	updateRoundHistory();
}

// Update hand history display
function updateHandHistory() {
	handHistoryEl.innerHTML = "";
	const recentHands = stats.handHistory.slice(-20);

	for (const result of recentHands) {
		const badge = document.createElement("div");
		badge.className = "history-badge";

		if (result === "P") {
			badge.textContent = "P";
			badge.classList.add("player");
		} else if (result === "B") {
			badge.textContent = "B";
			badge.classList.add("banker");
		} else {
			badge.textContent = "T";
			badge.classList.add("tie");
		}

		handHistoryEl.appendChild(badge);
	}
}

// Update detailed round history display
function updateRoundHistory() {
	historyList.innerHTML = "";

	if (stats.roundHistory.length === 0) {
		historyList.innerHTML =
			'<div class="no-history">No rounds played yet</div>';
		return;
	}

	const recentRounds = stats.roundHistory.slice(-30).reverse();

	for (let i = 0; i < recentRounds.length; i++) {
		const round = recentRounds[i];
		const roundEl = document.createElement("div");
		roundEl.className = `round-item ${round.outcome}`;

		roundEl.innerHTML = `
			<div class="round-header">
				<span class="round-number">#${round.roundNumber}</span>
				<span class="round-result ${round.netChange >= 0 ? "win" : "lose"}">
					${round.netChange >= 0 ? "+" : ""}$${round.netChange.toFixed(2)}
				</span>
			</div>
			<div class="round-details">
				<div class="round-bet">
					<span class="bet-type-badge ${
						round.betType
					}">${round.betType.toUpperCase()}</span>
					<span class="bet-amount">$${round.betAmount}</span>
				</div>
				<div class="round-outcome">
					<span class="outcome-label">Result:</span>
					<span class="outcome-text">${round.outcomeText}</span>
				</div>
				${
					round.commission > 0
						? `<div class="round-commission">Commission: $${round.commission.toFixed(
								2
						  )}</div>`
						: ""
				}
			</div>
		`;

		historyList.appendChild(roundEl);
	}
}

// Update hand displays
function updateHandDisplays() {
	// Player hand
	playerCardsEl.innerHTML = playerHand
		.map((card) => formatCard(card))
		.join("");
	const playerTotal = calculateHandTotal(playerHand);
	playerTotalEl.textContent = `Total: ${playerTotal}`;

	// Banker hand
	bankerCardsEl.innerHTML = bankerHand
		.map((card) => formatCard(card))
		.join("");
	const bankerTotal = calculateHandTotal(bankerHand);
	bankerTotalEl.textContent = `Total: ${bankerTotal}`;
}

// Deal initial cards and resolve the hand
async function deal() {
	const betAmount = parseInt(betInput.value);
	if (isNaN(betAmount) || betAmount <= 0) {
		showMessage("Please enter a valid bet amount", "lose");
		return;
	}

	if (betAmount > bankroll) {
		showMessage("Insufficient funds!", "lose");
		return;
	}

	// Get selected bet type
	const selectedBet = document.querySelector('input[name="betType"]:checked');
	betType = selectedBet ? selectedBet.value : "player";

	// Set up bet
	currentBet = betAmount;
	bankroll -= betAmount;
	stats.totalWagered += betAmount;
	gameInProgress = true;

	// Hide betting controls
	bettingArea.style.display = "none";
	dealBtn.disabled = true;

	updateDisplay();

	// Reset hands
	playerHand = [];
	bankerHand = [];

	// Deal initial cards with animation
	showMessage("Dealing...", "info");

	await sleep(300);
	playerHand.push(dealCard());
	updateHandDisplays();
	await sleep(300);

	bankerHand.push(dealCard());
	updateHandDisplays();
	await sleep(300);

	playerHand.push(dealCard());
	updateHandDisplays();
	await sleep(300);

	bankerHand.push(dealCard());
	updateHandDisplays();
	await sleep(500);

	// Check for naturals
	const playerTotal = calculateHandTotal(playerHand);
	const bankerTotal = calculateHandTotal(bankerHand);

	if (isNatural(playerTotal) || isNatural(bankerTotal)) {
		showMessage("Natural!", "info");
		await sleep(800);
		resolveOutcome();
		return;
	}

	// Player third card rule
	let playerThirdCard = null;
	if (playerDrawsThirdCard(playerTotal)) {
		showMessage("Player draws third card...", "info");
		await sleep(600);
		playerThirdCard = dealCard();
		playerHand.push(playerThirdCard);
		updateHandDisplays();
		await sleep(600);
	} else {
		showMessage("Player stands", "info");
		await sleep(600);
	}

	// Banker third card rule
	const newBankerTotal = calculateHandTotal(bankerHand);
	if (bankerDrawsThirdCard(newBankerTotal, playerThirdCard)) {
		showMessage("Banker draws third card...", "info");
		await sleep(600);
		bankerHand.push(dealCard());
		updateHandDisplays();
		await sleep(600);
	} else {
		showMessage("Banker stands", "info");
		await sleep(600);
	}

	// Resolve outcome
	resolveOutcome();
}

// Resolve the outcome and payouts
function resolveOutcome() {
	const playerTotal = calculateHandTotal(playerHand);
	const bankerTotal = calculateHandTotal(bankerHand);

	let winner;
	let payout = 0;
	let commission = 0;
	let resultMessage = "";

	// Determine winner
	if (playerTotal > bankerTotal) {
		winner = "player";
		stats.playerWins++;
		stats.handHistory.push("P");
		resultMessage = `Player Wins! ${playerTotal} vs ${bankerTotal}`;

		if (betType === "player") {
			payout = currentBet * 2; // Return bet + 1:1
			resultMessage += ` - You Win $${currentBet}!`;
		} else if (betType === "tie") {
			resultMessage += ` - Tie bet loses`;
		} else {
			resultMessage += ` - Banker bet loses`;
		}
	} else if (bankerTotal > playerTotal) {
		winner = "banker";
		stats.bankerWins++;
		stats.handHistory.push("B");
		resultMessage = `Banker Wins! ${bankerTotal} vs ${playerTotal}`;

		if (betType === "banker") {
			const winAmount = currentBet;
			commission = winAmount * 0.05; // 5% commission
			payout = currentBet + winAmount - commission;
			stats.totalCommissions += commission;
			resultMessage += ` - You Win $${winAmount.toFixed(
				2
			)} (Commission: $${commission.toFixed(2)})`;
		} else if (betType === "tie") {
			resultMessage += ` - Tie bet loses`;
		} else {
			resultMessage += ` - Player bet loses`;
		}
	} else {
		winner = "tie";
		stats.ties++;
		stats.handHistory.push("T");
		resultMessage = `Tie! Both ${playerTotal}`;

		if (betType === "tie") {
			payout = currentBet * 9; // Return bet + 8:1
			resultMessage += ` - You Win $${currentBet * 8}!`;
		} else {
			payout = currentBet; // Push - return bet
			resultMessage += ` - Push (bet returned)`;
		}
	}

	// Update bankroll
	bankroll += payout;
	const netChange = payout - currentBet;
	stats.netWinLoss += netChange;

	// Update stats
	stats.handsPlayed++;

	// Add to detailed round history
	stats.roundHistory.push({
		roundNumber: stats.handsPlayed,
		betType: betType,
		betAmount: currentBet,
		outcome: winner,
		outcomeText: `${
			winner.charAt(0).toUpperCase() + winner.slice(1)
		} (${playerTotal} vs ${bankerTotal})`,
		payout: payout,
		netChange: netChange,
		commission: commission,
	});

	// Show result
	const messageType = netChange > 0 ? "win" : netChange < 0 ? "lose" : "info";
	showMessage(resultMessage, messageType);

	updateDisplay();

	// Show new round button
	newRoundBtn.style.display = "inline-block";
	gameInProgress = false;

	// Check if player is out of money
	if (bankroll <= 0) {
		showMessage("Game Over! Out of money. Refresh to restart.", "lose");
		newRoundBtn.textContent = "GAME OVER";
		newRoundBtn.disabled = true;
		if (autoPlaying) stopAutoPlay();
		if (superAutoPlaying) stopSuperAuto();
	}

	// Auto-play continues
	if (autoPlaying && bankroll > 0) {
		newRoundBtn.style.display = "none";
		setTimeout(() => {
			autoPlayStartNewRound();
		}, 600);
	}
}

// New round
function newRound() {
	if (bankroll <= 0) {
		location.reload();
		return;
	}

	newRoundBtn.style.display = "none";
	newRoundBtn.textContent = "NEW ROUND";
	newRoundBtn.disabled = false;
	dealBtn.disabled = false;
	bettingArea.style.display = "block";
	playerHand = [];
	bankerHand = [];
	currentBet = 0;
	gameInProgress = false;

	playerCardsEl.innerHTML = "";
	bankerCardsEl.innerHTML = "";
	playerTotalEl.textContent = "";
	bankerTotalEl.textContent = "";

	updateDisplay();
	showMessage("Place your bet and choose Player, Banker, or Tie", "info");
}

// Helper sleep function for animations
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
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
	superAutoBtn.disabled = true;

	const selectedBet = document.querySelector('input[name="betType"]:checked');
	betType = selectedBet ? selectedBet.value : "player";

	showMessage(`Auto-playing (${autoPlayMaxRounds} rounds)...`, "info");

	// Start first round
	if (!gameInProgress) {
		deal();
	}
}

function stopAutoPlay() {
	autoPlaying = false;
	autoPlayBtn.textContent = "AUTO PLAY";
	autoPlayBtn.classList.remove("active");
	dealBtn.disabled = false;
	betInput.disabled = false;
	autoRoundsInput.disabled = false;
	superAutoBtn.disabled = false;
	updateDisplay();
	showMessage("Auto-play stopped", "info");
}

function autoPlayStartNewRound() {
	if (!autoPlaying || autoPlayRounds >= autoPlayMaxRounds || bankroll <= 0) {
		stopAutoPlay();
		if (bankroll > 0) {
			newRoundBtn.style.display = "inline-block";
		}
		return;
	}

	autoPlayRounds++;
	newRound();
	setTimeout(() => {
		if (autoPlaying) {
			deal();
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

	const selectedBet = document.querySelector('input[name="betType"]:checked');
	betType = selectedBet ? selectedBet.value : "player";

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
	showMessage("Super Auto stopped", "info");
}

function runSuperAutoRounds() {
	let roundsCompleted = 0;

	while (
		roundsCompleted < superAutoMaxRounds &&
		bankroll > 0 &&
		superAutoPlaying
	) {
		const betAmount = parseInt(betInput.value);

		if (betAmount > bankroll) {
			break;
		}

		// Instant deal
		instantDeal();

		roundsCompleted++;
		superAutoRounds++;

		// Update display periodically
		if (roundsCompleted % 100 === 0) {
			updateDisplay();
		}
	}

	// Final update
	updateDisplay();
	stopSuperAuto();

	if (bankroll <= 0) {
		showMessage("Game Over! Out of money.", "lose");
		newRoundBtn.textContent = "GAME OVER";
		newRoundBtn.disabled = true;
	} else {
		showMessage(`Super Auto completed ${roundsCompleted} rounds`, "info");
		newRoundBtn.style.display = "inline-block";
	}
}

function instantDeal() {
	const betAmount = parseInt(betInput.value);

	if (betAmount > bankroll) {
		return;
	}

	// Set up bet
	currentBet = betAmount;
	bankroll -= betAmount;
	stats.totalWagered += betAmount;

	// Reset hands
	playerHand = [];
	bankerHand = [];

	// Deal initial cards
	playerHand.push(dealCard());
	bankerHand.push(dealCard());
	playerHand.push(dealCard());
	bankerHand.push(dealCard());

	// Check for naturals
	const playerTotal = calculateHandTotal(playerHand);
	const bankerTotal = calculateHandTotal(bankerHand);

	if (isNatural(playerTotal) || isNatural(bankerTotal)) {
		instantResolveOutcome();
		return;
	}

	// Player third card rule
	let playerThirdCard = null;
	if (playerDrawsThirdCard(playerTotal)) {
		playerThirdCard = dealCard();
		playerHand.push(playerThirdCard);
	}

	// Banker third card rule
	const newBankerTotal = calculateHandTotal(bankerHand);
	if (bankerDrawsThirdCard(newBankerTotal, playerThirdCard)) {
		bankerHand.push(dealCard());
	}

	// Resolve outcome
	instantResolveOutcome();
}

function instantResolveOutcome() {
	const playerTotal = calculateHandTotal(playerHand);
	const bankerTotal = calculateHandTotal(bankerHand);

	let winner;
	let payout = 0;
	let commission = 0;

	// Determine winner
	if (playerTotal > bankerTotal) {
		winner = "player";
		stats.playerWins++;
		stats.handHistory.push("P");

		if (betType === "player") {
			payout = currentBet * 2;
		} else if (betType === "tie") {
			payout = 0;
		} else {
			payout = 0;
		}
	} else if (bankerTotal > playerTotal) {
		winner = "banker";
		stats.bankerWins++;
		stats.handHistory.push("B");

		if (betType === "banker") {
			const winAmount = currentBet;
			commission = winAmount * 0.05;
			payout = currentBet + winAmount - commission;
			stats.totalCommissions += commission;
		} else if (betType === "tie") {
			payout = 0;
		} else {
			payout = 0;
		}
	} else {
		winner = "tie";
		stats.ties++;
		stats.handHistory.push("T");

		if (betType === "tie") {
			payout = currentBet * 9;
		} else {
			payout = currentBet; // Push
		}
	}

	// Update bankroll
	bankroll += payout;
	const netChange = payout - currentBet;
	stats.netWinLoss += netChange;

	// Update stats
	stats.handsPlayed++;

	// Add to detailed round history
	stats.roundHistory.push({
		roundNumber: stats.handsPlayed,
		betType: betType,
		betAmount: currentBet,
		outcome: winner,
		outcomeText: `${
			winner.charAt(0).toUpperCase() + winner.slice(1)
		} (${playerTotal} vs ${bankerTotal})`,
		payout: payout,
		netChange: netChange,
		commission: commission,
	});
}

// Helper sleep function for animations
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Toggle stats panel
function toggleStats() {
	statsPanel.classList.toggle("expanded");
	statsToggle.classList.toggle("active");
}

// Toggle history panel
function toggleHistory() {
	historyPanel.classList.toggle("expanded");
	historyToggle.classList.toggle("active");
}

// Event listeners
dealBtn.addEventListener("click", deal);
newRoundBtn.addEventListener("click", newRound);
autoPlayBtn.addEventListener("click", toggleAutoPlay);
superAutoBtn.addEventListener("click", toggleSuperAuto);
statsToggle.addEventListener("click", toggleStats);
historyToggle.addEventListener("click", toggleHistory);

// Initialize game
shoe = createShoe();
shuffle(shoe);
updateDisplay();
showMessage(
	"Welcome to Baccarat! Place your bet and choose Player, Banker, or Tie",
	"info"
);
