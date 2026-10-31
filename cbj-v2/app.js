const outcomeModel = {
	win: 0.423,
	push: 0.086,
};

const elements = {
	form: document.getElementById("experimentForm"),
	startingBankroll: document.getElementById("startingBankroll"),
	betAmount: document.getElementById("betAmount"),
	rounds: document.getElementById("rounds"),
	winsBeforePause: document.getElementById("winsBeforePause"),
	pauseLength: document.getElementById("pauseLength"),
	clearButton: document.getElementById("clearButton"),
	themeToggle: document.getElementById("themeToggle"),
	statusPill: document.getElementById("statusPill"),
	ruleTrigger: document.getElementById("ruleTrigger"),
	rulePause: document.getElementById("rulePause"),
	ruleTitle: document.getElementById("ruleTitle"),
	ruleSummary: document.getElementById("ruleSummary"),
	finalBankroll: document.getElementById("finalBankroll"),
	bankrollDelta: document.getElementById("bankrollDelta"),
	gamesPlayed: document.getElementById("gamesPlayed"),
	gamesSkipped: document.getElementById("gamesSkipped"),
	winLoss: document.getElementById("winLoss"),
	pushes: document.getElementById("pushes"),
	longestStreak: document.getElementById("longestStreak"),
	pauseCount: document.getElementById("pauseCount"),
	lossesAvoided: document.getElementById("lossesAvoided"),
	lossesAvoidedCount: document.getElementById("lossesAvoidedCount"),
	winsMissed: document.getElementById("winsMissed"),
	winsMissedCount: document.getElementById("winsMissedCount"),
	outcomeRates: document.getElementById("outcomeRates"),
	chart: document.getElementById("bankrollChart"),
	historyList: document.getElementById("historyList"),
	historyLabel: document.getElementById("historyLabel"),
	liveBankroll: document.getElementById("liveBankroll"),
	liveBet: document.getElementById("liveBet"),
	dealGameButton: document.getElementById("dealGameButton"),
	hitGameButton: document.getElementById("hitGameButton"),
	standGameButton: document.getElementById("standGameButton"),
	newGameButton: document.getElementById("newGameButton"),
	skipGameButton: document.getElementById("skipGameButton"),
	dealerCards: document.getElementById("dealerCards"),
	playerCards: document.getElementById("playerCards"),
	dealerTotal: document.getElementById("dealerTotal"),
	playerTotal: document.getElementById("playerTotal"),
	liveMessage: document.getElementById("liveMessage"),
	liveRecord: document.getElementById("liveRecord"),
	liveStreak: document.getElementById("liveStreak"),
};

const liveGame = {
	bankroll: 1000,
	bet: 10,
	deck: [],
	player: [],
	dealer: [],
	inRound: false,
	paused: 0,
	wins: 0,
	losses: 0,
	pushes: 0,
	winStreak: 0,
};

function numberValue(element, minimum) {
	const value = Number(String(element.value).replace(/[$,\s]/g, ""));
	return Number.isFinite(value) && value >= minimum ? value : minimum;
}

function cryptoRandomValues(count) {
	const values = new Uint32Array(count);
	for (let offset = 0; offset < count; offset += 16384) {
		crypto.getRandomValues(
			values.subarray(offset, Math.min(offset + 16384, count)),
		);
	}
	return values;
}

function getOutcome(random) {
	const roll = random();
	if (roll < outcomeModel.win) return "win";
	if (roll < outcomeModel.win + outcomeModel.push) return "push";
	return "loss";
}

function simulate({
	startingBankroll,
	betAmount,
	rounds,
	winsBeforePause,
	pauseLength,
	outcomes,
	pauseEnabled,
}) {
	let bankroll = startingBankroll;
	let winStreak = 0;
	let longestStreak = 0;
	let pauseRemaining = 0;
	let gamesPlayed = 0;
	let gamesSkipped = 0;
	let wins = 0;
	let losses = 0;
	let pushes = 0;
	let pauses = 0;
	let lossesAvoided = 0;
	let lossesAvoidedCount = 0;
	let winsMissed = 0;
	let winsMissedCount = 0;
	const history = [];
	const bankrollPath = [{round: 0, bankroll}];

	for (let round = 1; round <= rounds; round++) {
		if (pauseEnabled && pauseRemaining > 0) {
			const pausedOutcome = outcomes[round - 1];
			pauseRemaining--;
			gamesSkipped++;
			if (pausedOutcome === "loss") {
				lossesAvoided += betAmount;
				lossesAvoidedCount++;
			} else if (pausedOutcome === "win") {
				winsMissed += betAmount;
				winsMissedCount++;
			}
			history.push({
				type: "pause",
				round,
				label: "PAUSE",
				detail: `${pauseRemaining} left`,
			});
			bankrollPath.push({round, bankroll});
			continue;
		}

		if (bankroll < betAmount) break;
		const outcome = outcomes[round - 1];
		gamesPlayed++;
		if (outcome === "win") {
			bankroll += betAmount;
			wins++;
			winStreak++;
			longestStreak = Math.max(longestStreak, winStreak);
			if (pauseEnabled && winStreak >= winsBeforePause) {
				pauseRemaining = pauseLength;
				pauses++;
				winStreak = 0;
			}
		} else if (outcome === "loss") {
			bankroll -= betAmount;
			losses++;
			winStreak = 0;
		} else {
			pushes++;
		}

		history.push({
			type: outcome,
			round,
			label: outcome.toUpperCase(),
			detail: `$${bankroll}`,
		});
		bankrollPath.push({round, bankroll});
	}

	return {
		bankroll,
		gamesPlayed,
		gamesSkipped,
		wins,
		losses,
		pushes,
		longestStreak,
		pauses,
		lossesAvoided,
		lossesAvoidedCount,
		winsMissed,
		winsMissedCount,
		history,
		bankrollPath,
	};
}

function formatMoney(value) {
	return `$${Math.round(value).toLocaleString()}`;
}

function formatPause(value) {
	return value === 1 ? "1 game" : `${value} games`;
}

function formatRate(count, total) {
	return total > 0 ? `${((count / total) * 100).toFixed(1)}%` : "0.0%";
}

function readSettings() {
	return {
		startingBankroll: numberValue(elements.startingBankroll, 1),
		betAmount: numberValue(elements.betAmount, 1),
		rounds: Math.floor(Math.min(numberValue(elements.rounds, 1), 1000000)),
		winsBeforePause: Math.floor(
			Math.min(numberValue(elements.winsBeforePause, 1), 20),
		),
		pauseLength: Math.floor(
			Math.min(numberValue(elements.pauseLength, 1), 1000),
		),
	};
}

function updateRule(settings) {
	elements.ruleTrigger.textContent = settings.winsBeforePause;
	elements.rulePause.textContent = formatPause(settings.pauseLength);
	elements.ruleTitle.textContent = `Pause ${formatPause(settings.pauseLength)} after ${settings.winsBeforePause} wins`;
}

function updateMetrics(result, baseline, settings) {
	elements.finalBankroll.textContent = formatMoney(result.bankroll);
	const delta = result.bankroll - settings.startingBankroll;
	elements.bankrollDelta.textContent = `${delta >= 0 ? "+" : "-"}${formatMoney(Math.abs(delta))} from start`;
	elements.gamesPlayed.textContent = result.gamesPlayed.toLocaleString();
	elements.gamesSkipped.textContent = `${result.gamesSkipped.toLocaleString()} paused`;
	elements.winLoss.textContent = `${result.wins.toLocaleString()} / ${result.losses.toLocaleString()}`;
	elements.pushes.textContent = `${result.pushes.toLocaleString()} pushes`;
	elements.longestStreak.textContent = result.longestStreak.toLocaleString();
	elements.pauseCount.textContent = `${result.pauses.toLocaleString()} pauses`;
	elements.lossesAvoided.textContent = formatMoney(result.lossesAvoided);
	elements.lossesAvoidedCount.textContent = `${result.lossesAvoidedCount.toLocaleString()} paused losses`;
	elements.winsMissed.textContent = formatMoney(result.winsMissed);
	elements.winsMissedCount.textContent = `${result.winsMissedCount.toLocaleString()} paused wins`;
	elements.outcomeRates.textContent = `Win ${formatRate(result.wins, result.gamesPlayed)} · Push ${formatRate(result.pushes, result.gamesPlayed)} · Loss ${formatRate(result.losses, result.gamesPlayed)}`;

	const difference = result.bankroll - baseline.bankroll;
	elements.ruleSummary.textContent = `The pause rule activated ${result.pauses.toLocaleString()} times and skipped ${result.gamesSkipped.toLocaleString()} games. With the same outcomes and no pause, the final bankroll was ${formatMoney(baseline.bankroll)} (${difference >= 0 ? "+" : "-"}${formatMoney(Math.abs(difference))} versus this run).`;
	elements.historyLabel.textContent = `${result.history.length.toLocaleString()} rounds shown from ${settings.rounds.toLocaleString()}`;
}

function drawChart(path, baselinePath, startingBankroll) {
	const canvas = elements.chart;
	const bounds = canvas.getBoundingClientRect();
	const ratio = window.devicePixelRatio || 1;
	canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
	canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
	const context = canvas.getContext("2d");
	context.scale(ratio, ratio);
	const width = bounds.width;
	const height = bounds.height;
	const padding = {top: 14, right: 12, bottom: 28, left: 44};
	const allValues = [...path, ...baselinePath].map((point) => point.bankroll);
	const min = Math.min(...allValues, startingBankroll);
	const max = Math.max(...allValues, startingBankroll);
	const spread = Math.max(max - min, 1);
	const yMin = min - spread * 0.08;
	const yMax = max + spread * 0.08;
	const maxRound = Math.max(path[path.length - 1].round, 1);
	const x = (round) =>
		padding.left +
		(round / maxRound) * (width - padding.left - padding.right);
	const y = (value) =>
		height -
		padding.bottom -
		((value - yMin) / (yMax - yMin)) *
			(height - padding.top - padding.bottom);

	context.clearRect(0, 0, width, height);
	context.strokeStyle = "#dce4dc";
	context.lineWidth = 1;
	context.beginPath();
	context.moveTo(padding.left, y(startingBankroll));
	context.lineTo(width - padding.right, y(startingBankroll));
	context.stroke();

	function drawPath(points, color, lineWidth) {
		context.strokeStyle = color;
		context.lineWidth = lineWidth;
		context.beginPath();
		points.forEach((point, index) => {
			if (index === 0) context.moveTo(x(point.round), y(point.bankroll));
			else context.lineTo(x(point.round), y(point.bankroll));
		});
		context.stroke();
	}

	drawPath(baselinePath, "#b8c5bd", 1.5);
	drawPath(path, "#e27b42", 2.5);
	context.fillStyle = "#6d7b75";
	context.font = "11px DM Mono, monospace";
	context.fillText(formatMoney(yMax), 4, padding.top + 4);
	context.fillText(formatMoney(yMin), 4, height - padding.bottom);
	context.fillText("no pause", width - 58, height - 8);
}

function renderHistory(history) {
	elements.historyList.innerHTML = "";
	history
		.slice(-80)
		.reverse()
		.forEach((item) => {
			const element = document.createElement("div");
			element.className = `history-item ${item.type}`;
			element.textContent = item.label;
			const detail = document.createElement("small");
			detail.textContent = `#${item.round} · ${item.detail}`;
			element.appendChild(detail);
			elements.historyList.appendChild(element);
		});
}

function runExperiment(event) {
	event?.preventDefault();
	const settings = readSettings();
	const randomValues = cryptoRandomValues(settings.rounds);
	const outcomes = Array.from(randomValues, (value) =>
		getOutcome(() => value / 4294967296),
	);
	updateRule(settings);
	const result = simulate({...settings, outcomes, pauseEnabled: true});
	const baseline = simulate({...settings, outcomes, pauseEnabled: false});
	updateMetrics(result, baseline, settings);
	drawChart(
		result.bankrollPath,
		baseline.bankrollPath,
		settings.startingBankroll,
	);
	renderHistory(result.history);
	elements.statusPill.textContent = "TEST COMPLETE";
}

function clearResults() {
	elements.statusPill.textContent = "READY";
	elements.ruleTitle.textContent = "Waiting for a test";
	elements.ruleSummary.textContent =
		"Run an experiment to see how often the rule activates.";
	elements.historyLabel.textContent = "No rounds recorded";
	elements.historyList.innerHTML =
		'<p class="empty-state">Your latest 80 rounds will appear here.</p>';
	["finalBankroll", "gamesPlayed", "longestStreak"].forEach(
		(id) =>
			(elements[id].textContent = id === "finalBankroll" ? "$0" : "0"),
	);
	elements.bankrollDelta.textContent = "No test yet";
	elements.gamesSkipped.textContent = "0 paused";
	elements.winLoss.textContent = "0 / 0";
	elements.pushes.textContent = "0 pushes";
	elements.pauseCount.textContent = "0 pauses";
	elements.lossesAvoided.textContent = "$0";
	elements.lossesAvoidedCount.textContent = "0 paused losses";
	elements.winsMissed.textContent = "$0";
	elements.winsMissedCount.textContent = "0 paused wins";
	elements.outcomeRates.textContent = "Run an experiment to calculate rates.";
	const context = elements.chart.getContext("2d");
	context.clearRect(0, 0, elements.chart.width, elements.chart.height);
}

function createLiveDeck() {
	const deck = [];
	const suits = ["S", "H", "D", "C"];
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
	values.forEach((value) =>
		suits.forEach((suit) => deck.push({value, suit})),
	);
	const randomValues = cryptoRandomValues(deck.length);
	for (let index = deck.length - 1; index > 0; index--) {
		const swapIndex = randomValues[index] % (index + 1);
		[deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
	}
	return deck;
}

function liveCardValue(card) {
	if (card.value === "A") return 11;
	return ["J", "Q", "K"].includes(card.value) ? 10 : Number(card.value);
}

function liveHandValue(hand) {
	let total = hand.reduce((sum, card) => sum + liveCardValue(card), 0);
	let aces = hand.filter((card) => card.value === "A").length;
	while (total > 21 && aces > 0) {
		total -= 10;
		aces--;
	}
	return total;
}

function liveBlackjack(hand) {
	return hand.length === 2 && liveHandValue(hand) === 21;
}

function renderLiveHand(container, hand, hideHoleCard = false) {
	container.innerHTML = "";
	hand.forEach((card, index) => {
		const cardElement = document.createElement("span");
		cardElement.className = `card ${["H", "D"].includes(card.suit) ? "red" : ""}`;
		cardElement.textContent =
			hideHoleCard && index === 1 ? "?" : `${card.value}${card.suit}`;
		container.appendChild(cardElement);
	});
}

function updateLiveDisplay() {
	elements.liveBankroll.textContent = formatMoney(liveGame.bankroll);
	renderLiveHand(elements.playerCards, liveGame.player);
	renderLiveHand(elements.dealerCards, liveGame.dealer, liveGame.inRound);
	elements.playerTotal.textContent = liveGame.player.length
		? liveHandValue(liveGame.player)
		: "--";
	elements.dealerTotal.textContent = liveGame.dealer.length
		? liveGame.inRound
			? liveHandValue([liveGame.dealer[0]])
			: liveHandValue(liveGame.dealer)
		: "--";
	elements.liveRecord.textContent = `${liveGame.wins} wins · ${liveGame.losses} losses · ${liveGame.pushes} pushes`;
	elements.liveStreak.textContent = `Win streak: ${liveGame.winStreak}`;
	elements.dealGameButton.disabled = liveGame.inRound || liveGame.paused > 0;
	elements.hitGameButton.disabled = !liveGame.inRound;
	elements.standGameButton.disabled = !liveGame.inRound;
	elements.skipGameButton.hidden = liveGame.paused === 0;
}

function resetLiveGame() {
	liveGame.bankroll = numberValue(elements.startingBankroll, 1);
	liveGame.bet = numberValue(elements.liveBet, 1);
	liveGame.deck = [];
	liveGame.player = [];
	liveGame.dealer = [];
	liveGame.inRound = false;
	liveGame.paused = 0;
	liveGame.wins = 0;
	liveGame.losses = 0;
	liveGame.pushes = 0;
	liveGame.winStreak = 0;
	elements.liveMessage.textContent = "New game ready. Place your bet.";
	updateLiveDisplay();
}

function drawLiveCard() {
	if (liveGame.deck.length < 10) liveGame.deck = createLiveDeck();
	return liveGame.deck.pop();
}

function finishLiveRound(result, blackjack = false) {
	liveGame.inRound = false;
	if (result === "win") {
		liveGame.bankroll += blackjack ? liveGame.bet * 2.5 : liveGame.bet * 2;
		liveGame.wins++;
		liveGame.winStreak++;
		const threshold = Math.floor(numberValue(elements.winsBeforePause, 1));
		if (liveGame.winStreak >= threshold) {
			liveGame.paused = Math.floor(numberValue(elements.pauseLength, 1));
			liveGame.winStreak = 0;
		}
	} else if (result === "loss") {
		liveGame.losses++;
		liveGame.winStreak = 0;
	} else {
		liveGame.bankroll += liveGame.bet;
		liveGame.pushes++;
	}
	const pauseMessage =
		liveGame.paused > 0
			? ` Pause active for ${liveGame.paused} game(s).`
			: "";
	elements.liveMessage.textContent = `${result === "win" ? "You win" : result === "loss" ? "You lose" : "Push"}.${pauseMessage}`;
	updateLiveDisplay();
}

function resolveLiveHand() {
	while (liveHandValue(liveGame.dealer) < 17)
		liveGame.dealer.push(drawLiveCard());
	const playerTotal = liveHandValue(liveGame.player);
	const dealerTotal = liveHandValue(liveGame.dealer);
	let result = "push";
	if (playerTotal > 21 || (dealerTotal <= 21 && dealerTotal > playerTotal))
		result = "loss";
	else if (dealerTotal > 21 || playerTotal > dealerTotal) result = "win";
	finishLiveRound(result);
}

function dealLiveHand() {
	if (liveGame.paused > 0) {
		elements.liveMessage.textContent = `Pause active. Skip ${liveGame.paused} paused game(s) first.`;
		return;
	}
	const bet = numberValue(elements.liveBet, 1);
	if (bet > liveGame.bankroll) {
		elements.liveMessage.textContent =
			"Bet is larger than the live bankroll.";
		return;
	}
	liveGame.bet = bet;
	if (liveGame.deck.length < 10) liveGame.deck = createLiveDeck();
	liveGame.bankroll -= bet;
	liveGame.player = [drawLiveCard(), drawLiveCard()];
	liveGame.dealer = [drawLiveCard(), drawLiveCard()];
	liveGame.inRound = true;
	if (liveBlackjack(liveGame.player) || liveBlackjack(liveGame.dealer)) {
		const bothBlackjack =
			liveBlackjack(liveGame.player) && liveBlackjack(liveGame.dealer);
		finishLiveRound(
			bothBlackjack
				? "push"
				: liveBlackjack(liveGame.player)
					? "win"
					: "loss",
			liveBlackjack(liveGame.player),
		);
	} else {
		elements.liveMessage.textContent = "Your turn. Hit or stand.";
		updateLiveDisplay();
	}
}

function hitLiveHand() {
	if (!liveGame.inRound) return;
	liveGame.player.push(drawLiveCard());
	if (liveHandValue(liveGame.player) >= 21) resolveLiveHand();
	else updateLiveDisplay();
}

function standLiveHand() {
	if (liveGame.inRound) resolveLiveHand();
}

function skipLiveRound() {
	if (liveGame.paused === 0) return;
	liveGame.paused--;
	elements.liveMessage.textContent =
		liveGame.paused > 0
			? `Paused. ${liveGame.paused} game(s) remaining.`
			: "Pause complete. You may deal again.";
	updateLiveDisplay();
}

elements.form.addEventListener("submit", runExperiment);
elements.clearButton.addEventListener("click", clearResults);
elements.dealGameButton.addEventListener("click", dealLiveHand);
elements.hitGameButton.addEventListener("click", hitLiveHand);
elements.standGameButton.addEventListener("click", standLiveHand);
elements.newGameButton.addEventListener("click", resetLiveGame);
elements.skipGameButton.addEventListener("click", skipLiveRound);
function setDarkMode(enabled) {
	document.body.classList.toggle("dark-mode", enabled);
	elements.themeToggle.setAttribute("aria-pressed", String(enabled));
	elements.themeToggle.lastChild.textContent = enabled ? " LIGHT" : " DARK";
	localStorage.setItem("cbj-v2-dark-mode", enabled ? "enabled" : "disabled");
}

const savedDarkMode = localStorage.getItem("cbj-v2-dark-mode") === "enabled";
setDarkMode(savedDarkMode);
elements.themeToggle.addEventListener("click", () => {
	setDarkMode(!document.body.classList.contains("dark-mode"));
});
window.addEventListener("resize", () => {
	if (elements.statusPill.textContent === "TEST COMPLETE") runExperiment();
});
updateRule(readSettings());
resetLiveGame();
