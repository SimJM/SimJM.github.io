# Casino Blackjack (CBJ) - Technical Documentation

## Overview

A fully-featured, casino-realistic Blackjack game built with vanilla JavaScript, HTML5, and CSS3. Features authentic casino rules, card animations, comprehensive statistics tracking, Basic Strategy automation, and a realistic cut card shuffle system.

---

## Table of Contents

-   [Game Rules](#game-rules)
-   [Core Algorithms](#core-algorithms)
-   [Features & Implementation](#features--implementation)
-   [Statistics Tracking](#statistics-tracking)
-   [Auto-Play System](#auto-play-system)
-   [UI/UX Design](#uiux-design)

---

## Game Rules

### Standard Blackjack Rules

-   **Objective**: Beat the dealer by getting closer to 21 without going over
-   **Card Values**:
    -   Number cards (2-10): Face value
    -   Face cards (J, Q, K): 10
    -   Aces: 1 or 11 (whichever is more favorable)
-   **Blackjack**: Ace + 10-value card on first two cards
-   **Blackjack Payout**: 3:2 (bet $10, win $15)
-   **Regular Win**: 1:1 (bet $10, win $10)
-   **Push**: Tie with dealer, bet returned
-   **Bust**: Hand exceeds 21, automatic loss

### House Rules

-   **Dealer Rules**: Dealer stands on all 17s (including soft 17)
-   **Number of Decks**: 6-deck shoe (312 cards)
-   **Cut Card System**: Placed randomly at 52-78 cards remaining (1-1.5 decks from end)
-   **Shuffle Timing**: After current round completes when cut card is reached
-   **Splitting**: Split once per hand, split aces receive only one card each
-   **Doubling**: Allowed on any first two cards
-   **Insurance**: Not implemented
-   **Surrender**: Not implemented

---

## Core Algorithms

### 1. Cryptographically Secure Random Number Generation

**Purpose**: Provide unpredictable, fair randomness for casino gameplay

**Why crypto.getRandomValues() over Math.random()**:

-   **Math.random() Issues**:

    -   Not cryptographically secure
    -   Predictable with sufficient observations
    -   Pseudorandom with deterministic seed
    -   Unsuitable for gambling/casino applications
    -   Can be exploited if pattern is discovered

-   **crypto.getRandomValues() Benefits**:
    -   Cryptographically secure random number generator (CSPRNG)
    -   Uses OS-level entropy sources
    -   Unpredictable and cannot be reverse-engineered
    -   Industry standard for security-sensitive applications
    -   Ensures genuine fairness in card shuffling

**Implementation**:

```javascript
function secureRandom() {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
}
```

**How it works**:

-   Creates a Uint32Array with one element
-   Fills it with cryptographically secure random bits
-   Normalizes to [0, 1) range (compatible with Math.random())
-   Used for all randomness: shuffling and cut card placement

### 2. Fisher-Yates Shuffle Algorithm

**Purpose**: Randomize the shoe fairly and efficiently using cryptographic randomness

**Implementation**:

```javascript
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(secureRandom() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
```

**How it works**:

-   Iterate backwards through the array
-   For each position `i`, select a random position `j` from 0 to `i` using **secureRandom()**
-   Swap elements at positions `i` and `j`
-   Time Complexity: O(n)
-   Guarantees uniform distribution (each permutation equally likely)
-   Enhanced with cryptographic randomness for casino-grade fairness

### 3. Hand Value Calculation Algorithm

**Purpose**: Calculate the optimal value of a blackjack hand

**Implementation**:

```javascript
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

    // Adjust for aces
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }

    return value;
}
```

**How it works**:

1. Initially count all Aces as 11
2. Add face cards as 10, number cards as face value
3. If total exceeds 21 and Aces exist, convert Aces from 11 to 1 (subtract 10) until under 22 or no Aces remain
4. Returns the highest value ≤21, or lowest value if busted

### 4. Soft Hand Detection Algorithm

**Purpose**: Determine if a hand contains an Ace counted as 11

**Implementation**:

```javascript
function isSoftHand(hand) {
    let value = 0;
    let hasAce = false;

    for (let card of hand) {
        if (card.value === "A") hasAce = true;
        if (card.value === "A") {
            value += 11;
        } else if (["K", "Q", "J"].includes(card.value)) {
            value += 10;
        } else {
            value += parseInt(card.value);
        }
    }

    return hasAce && value <= 21;
}
```

**How it works**:

-   Calculate hand value with all Aces as 11
-   A hand is "soft" if it contains an Ace AND the total is ≤21
-   Soft hands can't bust on the next hit (Ace converts to 1 if needed)

### 5. Basic Strategy Decision Algorithm

**Purpose**: Make mathematically optimal decisions based on player hand and dealer upcard

**Decision Tree**:

#### Pair Splitting Logic

```
IF pair AND can split (first hand, sufficient bankroll):
    IF Aces OR 8s → SPLIT (always)
    IF 10s, 5s, 4s → Continue to regular strategy (never split)
    IF 2s, 3s, 6s, 7s AND dealer shows 2-6 → SPLIT
    IF 9s:
        IF dealer shows 2-6, 8, 9 → SPLIT
        IF dealer shows 7, 10, A → STAND
```

#### Soft Hand Strategy

```
IF soft hand:
    IF total ≥19 → STAND
    IF total = 18:
        IF two cards AND dealer 4-6 AND can double → DOUBLE
        IF dealer 2-8 → STAND
        ELSE → HIT
    IF total 15-17:
        IF two cards AND dealer 4-6 AND can double → DOUBLE
        ELSE → HIT
    IF total ≤14 → HIT
```

#### Hard Hand Strategy

```
IF hard hand:
    IF total ≥17 → STAND
    IF total 13-16:
        IF dealer shows 2-6 → STAND
        ELSE → HIT
    IF total = 12:
        IF dealer shows 4-6 → STAND
        ELSE → HIT
    IF total = 11:
        IF two cards AND dealer not Ace AND can double → DOUBLE
        ELSE → HIT
    IF total = 10:
        IF two cards AND dealer 2-9 AND can double → DOUBLE
        ELSE → HIT
    IF total = 9:
        IF two cards AND dealer 3-6 AND can double → DOUBLE
        ELSE → HIT
    IF total ≤8 → HIT
```

**Algorithm Characteristics**:

-   Based on computer simulations and mathematical probability
-   Minimizes house edge to approximately 0.5%
-   Considers dealer upcard, player total, soft/hard distinction
-   Accounts for available actions (split, double) and bankroll

### 6. Cut Card Placement Algorithm

**Purpose**: Simulate realistic casino shuffle timing

**Implementation**:

```javascript
function setRandomCutCardPosition() {
    // Random position between 52 cards (1 deck) and 78 cards (1.5 decks)
    cutCardPosition = Math.floor(Math.random() * (78 - 52 + 1)) + 52;
}
```

**How it works**:

-   Generates random integer between 52-78 (inclusive)
-   Represents 1-1.5 decks remaining from bottom of shoe
-   Mimics dealer manually inserting cut card
-   New random position set after each shuffle
-   When shoe reaches ≤ cutCardPosition cards, shuffle flag is set
-   Shuffle occurs after current round completes

**Casino Realism**:

-   Real casinos: ~75-80% penetration (60-80 cards remaining)
-   This implementation: Random 52-78 cards (~67-75% penetration)
-   Prevents card counting advantages
-   Adds variance like real casino play

---

## Features & Implementation

### 1. Card Animations

#### Deal Animation

**Purpose**: Animate cards dealing from shoe to table

**CSS Keyframes**:

```css
@keyframes dealCard {
    0% {
        transform: translateY(-200px) rotateY(180deg);
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        transform: translateY(0) rotateY(0deg);
        opacity: 1;
    }
}
```

**Algorithm**:

-   Card starts 200px above final position, rotated 180° (face down)
-   Animates to final position while rotating to face up
-   Duration: 500ms with ease-out timing
-   Delay applied incrementally for sequential dealing effect

#### Flip Animation

**Purpose**: Reveal dealer's hole card smoothly

**CSS Keyframes**:

```css
@keyframes flipCard {
    0% { transform: rotateY(180deg); }
    49% { transform: rotateY(90deg); }
    51% { transform: rotateY(90deg); }
    100% { transform: rotateY(0deg); }
}
```

**Algorithm**:

-   Rotates from 180° (face down) to 0° (face up)
-   Pauses at 90° (49-51%) to change card content
-   Prevents visible flickering during content swap
-   Duration: 600ms with ease-in-out timing

#### Chip Toss Animation

**Purpose**: Animate betting chips to table

**CSS Keyframes**:

```css
@keyframes chipToss {
    0% {
        transform: translateY(-100px) scale(0.5) rotate(0deg);
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        transform: translateY(0) scale(1) rotate(360deg);
        opacity: 1;
    }
}
```

**Algorithm**:

-   Chip starts 100px above, scaled to 50%, no rotation
-   Falls to position while growing to full size and rotating 360°
-   Duration: 800ms with cubic-bezier easing
-   Applied on deal, double down, and split actions

### 2. Shoe Management System

**Initialization**:

```javascript
shoe = createShoe();      // Create 6 decks (312 cards)
shuffle(shoe);            // Randomize using Fisher-Yates with crypto.getRandomValues()
setRandomCutCardPosition(); // Place cut card randomly
```

**Card Dealing**:

```javascript
function dealCard() {
    if (shoe.length === 0) {
        // Emergency shuffle (shouldn't occur with cut card)
        shoe = createShoe();
        shuffle(shoe);
        setRandomCutCardPosition();
        cutCardReached = false;
    }

    // Check for cut card
    if (shoe.length <= cutCardPosition && !cutCardReached) {
        cutCardReached = true;
    }

    const card = shoe.pop();
    updateNextCardsPreview();
    return card;
}
```

**Shuffle Sequence**:

1. Cut card reached during dealing
2. Current hand completes normally
3. At end of round, check `cutCardReached` flag
4. Display "🎴 Shuffling shoe... Cut card reached"
5. Wait 1.5s for visual feedback
6. Create new shoe, shuffle, set new random cut card position
7. Reset flag, continue play

### 3. Split Hand Management

**Data Structure**:

```javascript
playerHands = [[]];     // Array of hands (supports multiple from splits)
playerBets = [];        // Parallel array of bets per hand
currentHandIndex = 0;   // Which hand is currently being played
```

**Split Algorithm**:

```javascript
function split() {
    const hand = playerHands[currentHandIndex];

    // Create new hand with second card
    const newHand = [hand.pop()];
    playerHands.splice(currentHandIndex + 1, 0, newHand);

    // Match the bet
    playerBets.push(currentBet);
    bankroll -= currentBet;

    // Deal one card to each hand
    addPlayerCard(dealCard(), currentHandIndex);
    addPlayerCard(dealCard(), currentHandIndex + 1);

    // Special rule: Split aces get only one card each
    if (hand[0].value === "A") {
        moveToNextHand();
    }
}
```

**Rendering**:

-   Each hand displayed in separate container
-   Active hand highlighted with gold border
-   Inactive hands dimmed (opacity 0.6)
-   Hand totals calculated independently

### 4. Next Cards Preview

**Purpose**: Show upcoming 10 cards from shoe (for transparency, not cheating)

**Update Algorithm**:

```javascript
function updateNextCardsPreview() {
    const next10 = shoe.slice(-10).reverse();
    nextCardsList.innerHTML = "";

    next10.forEach((card, index) => {
        const cardEl = document.createElement("div");
        cardEl.className = "mini-card";
        cardEl.innerHTML = `
            <span>${card.value}</span>
            <span>${card.suit}</span>
        `;
        nextCardsList.appendChild(cardEl);
    });
}
```

**Implementation Details**:

-   `shoe.slice(-10)` gets last 10 cards (next to be dealt)
-   `.reverse()` shows in order they'll be dealt
-   Updates after every card dealt
-   Expandable/collapsible container
-   Mini card design (smaller than game cards)

### 5. Double Down System

**Rules**:

-   Allowed only on first two cards
-   Doubles the bet and takes exactly one more card
-   Automatically stands after receiving the card

**Algorithm**:

```javascript
function doubleDown() {
    if (!canDouble || bankroll < playerBets[currentHandIndex]) return;

    // Show chip animation
    showChipAnimation(2);

    // Double the bet
    bankroll -= playerBets[currentHandIndex];
    playerBets[currentHandIndex] *= 2;

    // Take exactly one card
    addPlayerCard(dealCard(), currentHandIndex);

    // Automatically stand
    setTimeout(() => {
        if (calculateHandValue(playerHands[currentHandIndex]) <= 21) {
            moveToNextHand();
        } else {
            // Busted
            showMessage("Bust!", "lose");
            moveToNextHand();
        }
    }, 600);
}
```

---

## Statistics Tracking

### Metrics Tracked (21 Total)

1. **Hands Played**: Total rounds completed
2. **Wins**: Player beats dealer
3. **Losses**: Dealer beats player
4. **Pushes**: Ties with dealer
5. **Win Percentage**: `(wins / (wins + losses)) * 100`
6. **Current Streak**: Consecutive wins/losses
7. **Longest Win Streak**: Maximum consecutive wins
8. **Longest Loss Streak**: Maximum consecutive losses
9. **Total Wagered**: Sum of all bets placed
10. **Net Win/Loss**: Total profit or loss
11. **Largest Win**: Biggest single-hand profit
12. **Blackjacks**: Natural 21s dealt to player
13. **Busts**: Times player exceeded 21
14. **Deck Penetration**: `((312 - shoe.length) / 312) * 100`
15. **Shoe Cards Remaining**: Current cards in shoe
16. **Table Rules**: Display of game rules
17. **Last 30 Hands History**: Visual W/L/P badges
18. **ROI (Return on Investment)**: `(netWinLoss / totalWagered) * 100` - Shows betting efficiency
19. **Dealer Bust Rate**: `(dealerBusts / handsPlayed) * 100` - Tracks dealer bust frequency
20. **Average Bet Size**: `totalWagered / handsPlayed` - Shows average bet amount per hand
21. **Double Down Win %**: `(doubleDownWins / doubleDownAttempts) * 100` - Validates double down strategy

### Update Algorithm

**Incremental Updates**:

```javascript
stats.handsPlayed++;
stats.wins++; // or losses++, pushes++
stats.totalWagered += currentBet;
stats.netWinLoss += winAmount; // positive for wins, negative for losses

// Streak tracking
if (won) {
    stats.streak = (stats.streakType === 'win') ? stats.streak + 1 : 1;
    stats.streakType = 'win';
    stats.longestWinStreak = Math.max(stats.longestWinStreak, stats.streak);
} else if (lost) {
    stats.streak = (stats.streakType === 'loss') ? stats.streak + 1 : 1;
    stats.streakType = 'loss';
    stats.longestLossStreak = Math.max(stats.longestLossStreak, stats.streak);
} else {
    // Push resets streak
    stats.streak = 0;
    stats.streakType = null;
}

// Hand history
stats.handHistory.push('W'); // or 'L', 'P'

// Track dealer busts
if (dealerBust) {
    stats.dealerBusts++;
}

// Track double down attempts and wins
if (doubledDown) {
    stats.doubleDownAttempts++;
    if (won) stats.doubleDownWins++;
}
```

**Calculated Metrics**:

```javascript
// ROI - Return on Investment
const roi = stats.totalWagered > 0
    ? (stats.netWinLoss / stats.totalWagered) * 100
    : 0;

// Dealer Bust Rate
const dealerBustRate = stats.handsPlayed > 0
    ? (stats.dealerBusts / stats.handsPlayed) * 100
    : 0;

// Average Bet Size
const avgBetSize = stats.handsPlayed > 0
    ? stats.totalWagered / stats.handsPlayed
    : 0;

// Double Down Success Rate
const ddSuccessRate = stats.doubleDownAttempts > 0
    ? (stats.doubleDownWins / stats.doubleDownAttempts) * 100
    : 0;
```

### Hand History Visualization

**Data Structure**:

```javascript
stats.handHistory = ['W', 'L', 'W', 'P', 'W', ...] // Last 30 results
```

**Rendering**:

```javascript
const last30 = stats.handHistory.slice(-30);
last30.forEach((result) => {
    const badge = document.createElement("div");
    const resultClass = result === 'W' ? 'win' : result === 'L' ? 'lose' : 'push';
    badge.className = `history-badge ${resultClass}`;
    badge.textContent = result;
    handHistoryEl.appendChild(badge);
});
```

**Visual Design**:

-   **W**: White text on green circle
-   **L**: White text on red circle
-   **P**: White text on transparent circle with border
-   Circular badges (30px diameter)
-   Flex layout with wrapping
-   Most recent on the right

---

## Auto-Play System

### Purpose

Automatically play multiple rounds using optimal Basic Strategy decisions

### Configuration

-   **Rounds**: User selectable 1-100
-   **Bet**: Uses current bet input amount
-   **Speed**: 400ms delay between actions, 1000ms when shuffle occurs
-   **Strategy**: Full Basic Strategy implementation

### Control Flow

```
START AUTO-PLAY
    ↓
Check bankroll sufficient
    ↓
Set autoPlaying = true
    ↓
Set autoPlayRounds = 0
    ↓
Update UI (disable manual controls)
    ↓
┌─────────────────────┐
│  Start New Round    │
│  - Reset hands      │
│  - Place bet        │
│  - Deal cards       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Process Hand       │
│  - Get BS decision  │
│  - Execute action   │
│  - 400ms delay      │
│  - If split occurs  │
│    play all hands   │
└──────────┬──────────┘
           ↓
    More hands? (from splits)
    YES → Loop back to Process Hand
    NO ↓
┌─────────────────────┐
│  Complete Round     │
│  - Dealer plays     │
│  - Resolve bets     │
│  - Update stats     │
└──────────┬──────────┘
           ↓
    autoPlayRounds++
           ↓
    Check: More rounds? Bankroll OK?
    YES → Loop back to Start New Round (600ms delay, or 1000ms if shuffle)
    NO ↓
STOP AUTO-PLAY
```

### Key Functions

**Toggle Auto-Play**:

```javascript
function toggleAutoPlay() {
    if (autoPlaying) {
        // Stop auto-play
        autoPlaying = false;
        autoPlayRounds = 0;
        autoPlayBtn.textContent = "START AUTO";
    } else {
        // Start auto-play
        autoPlayMaxRounds = parseInt(autoRoundsInput.value) || 10;
        autoPlayRounds = 0;
        autoPlaying = true;
        autoPlayBtn.textContent = "STOP AUTO";
        autoPlayStartNewRound();
    }
}
```

**Auto Decision Making**:

```javascript
function autoPlayCurrentHand() {
    const hand = playerHands[currentHandIndex];
    const dealerUpcard = getDealerUpcard();
    const move = getBasicStrategyMove(hand, dealerUpcard);

    setTimeout(() => {
        switch(move) {
            case 'hit': hit(); break;
            case 'stand': stand(); break;
            case 'double': doubleDown(); break;
            case 'split': split(); break;
        }
    }, autoPlayDelay);
}
```

**Round Continuation**:

```javascript
function autoPlayNextRound() {
    if (!autoPlaying) return;
    if (bankroll < currentBet) {
        // Insufficient funds
        autoPlaying = false;
        showMessage("Auto-play stopped: Insufficient bankroll", "info");
        return;
    }
    if (autoPlayRounds >= autoPlayMaxRounds) {
        // Completed all rounds
        autoPlaying = false;
        showMessage(`Auto-play completed: ${autoPlayMaxRounds} rounds`, "info");
        return;
    }

    // Continue to next round
    const delay = cutCardReached ? 1000 : 600;
    setTimeout(() => {
        autoPlayStartNewRound();
    }, delay);
}
```

**Split Hand Handling**:

```javascript
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
```

**How It Works**:

-   When a split occurs during auto-play, the game creates two hands
-   After playing the first hand, `moveToNextHand()` is called
-   If auto-play is active, it automatically continues with the second hand
-   All split hands are played sequentially using Basic Strategy
-   No manual intervention needed

### Safety Features

-   Validates bankroll before each round
-   Stops if insufficient funds
-   Can be manually interrupted
-   Shows completion message
-   Re-enables manual controls on stop
-   Handles split hands automatically - continues playing all split hands sequentially
-   Seamlessly transitions between hands during auto-play

---

## UI/UX Design

### Casino Visual Theme

**Color Palette**:

-   **Felt Green**: `#0a5f0a` (table surface)
-   **Wood Trim**: `#8B4513`, `#654321` (table border)
-   **Gold Accents**: `#ffd700` (buttons, highlights)
-   **Purple Theme**: `#9b59b6` (auto-play area)
-   **Dark Background**: `linear-gradient(135deg, #1a1a2e, #16213e)`

**Oval Table Design**:

```css
.game-container {
    border-radius: 50% / 30%;  /* Creates oval shape */
    background: linear-gradient(to bottom, #0a5f0a 0%, #084d08 100%);
    box-shadow:
        0 0 0 15px #8b4513,        /* Inner wood border */
        0 0 0 20px #654321,        /* Outer wood border */
        0 20px 60px rgba(0,0,0,0.5), /* Drop shadow */
        inset 0 0 100px rgba(0,0,0,0.3); /* Inner shadow for depth */
}
```

**Felt Texture**:

-   Radial gradient for lighting effect
-   Repeating linear gradient for fabric texture
-   Semi-transparent overlays for realism

### Responsive Design

**Breakpoints**:

**Desktop (>768px)**:

-   Stats panel: 5 columns
-   Full card size: 70px × 100px
-   All controls visible

**Tablet (≤768px)**:

-   Stats panel: 3 columns
-   Card size: 60px × 86px
-   Compact button layout

**Mobile (≤480px)**:

-   Stats panel: 2 columns
-   Card size: 50px × 72px
-   Stacked controls
-   Smaller betting chips

**Tiny Mobile (≤360px)**:

-   Card size: 45px × 65px
-   Minimal padding
-   Condensed stats

### Expandable Panels

**Stats Panel**:

```javascript
function toggleStatsPanel() {
    const isExpanded = statsPanelWrapper.style.display !== 'none';
    statsPanelWrapper.style.display = isExpanded ? 'none' : 'block';
    statsToggleIcon.textContent = isExpanded ? '▼' : '▲';
}
```

**Next Cards Preview**:

```javascript
function toggleNextCards() {
    const isExpanded = nextCardsPreview.style.display !== 'none';
    nextCardsPreview.style.display = isExpanded ? 'none' : 'block';
    nextCardsToggle.querySelector('span').textContent =
        isExpanded ? '▼' : '▲';
}
```

**CSS Animation**:

```css
.stats-panel-wrapper {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out;
}

.stats-panel-wrapper.expanded {
    max-height: 1000px;
}
```

### Accessibility Features

-   High contrast text and backgrounds
-   Clear visual feedback for all actions
-   Disabled states for unavailable actions
-   Message system for game events
-   Keyboard-accessible controls
-   Color-coded statistics (green=positive, red=negative)

---

## Technology Stack

**Frontend**:

-   **HTML5**: Semantic structure
-   **CSS3**: Animations, gradients, flexbox, grid
-   **Vanilla JavaScript ES6+**: No external dependencies

**Browser Compatibility**:

-   Modern browsers (Chrome, Firefox, Safari, Edge)
-   Requires ES6 support
-   CSS Grid and Flexbox support
-   CSS animations and transforms

**Performance**:

-   Zero network requests after initial load
-   Lightweight (~50KB total)
-   Smooth 60fps animations
-   Efficient DOM updates

---

## File Structure

```
cbj.html        - Game structure and UI elements
cbj.css         - Styling, animations, responsive design
cbj.js          - Game logic, algorithms, event handlers
CBJ_README.md   - This documentation file
```

---

## Future Enhancement Ideas

1. **Sound Effects**: Card dealing, chip sounds, win/lose audio
2. **Multiple Players**: Multi-seat gameplay
3. **Side Bets**: Insurance, Perfect Pairs, 21+3
4. **Surrender Option**: Late surrender feature
5. **Card Counting Trainer**: Practice mode with running count
6. **Leaderboards**: High scores and session tracking
7. **Betting Strategies**: Martingale, Paroli, Fibonacci simulators
8. **Save/Load**: Session persistence with localStorage
9. **Statistics Export**: CSV download of session data
10. **Theme Customization**: Different table colors and card designs

---

## Credits

**Developer**: SimJM  
**Version**: 1.0  
**Last Updated**: December 2025  
**License**: MIT

Built with ♠️♥️♦️♣️ and lots of coffee.
