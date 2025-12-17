# 🎰 Casino Baccarat - Punto Banco

A fully-featured, browser-based Baccarat game implementing authentic Punto Banco rules with an 8-deck shoe, comprehensive statistics tracking, and powerful automation features.

## 🎮 Live Demo

Play the game: [bcr.html](bcr.html)

## ✨ Features

### Core Gameplay

-   **Authentic Punto Banco Rules**: Official Baccarat rules with proper natural detection and third-card drawing logic
-   **8-Deck Shoe**: 416 cards with automatic reshuffling when fewer than 6 cards remain
-   **Three Bet Types**:
    -   **Player**: 1:1 payout
    -   **Banker**: 1:1 payout minus 5% commission
    -   **Tie**: 8:1 payout
-   **Cryptographically Secure RNG**: Uses `crypto.getRandomValues()` for fair, unpredictable card shuffling
-   **Real-time Bankroll Management**: Track your balance with automatic bet validation

### Automation

-   **Auto-Play Mode**: Run a specified number of rounds with visual animations (400ms delays)
-   **Super Auto-Play**: Instant batch processing for thousands of rounds with optimized performance
-   **Smart Bet Selection**: Auto-play uses your selected bet type (Player/Banker/Tie)

### Statistics & Tracking

-   **Comprehensive Statistics Panel**:

    -   Total hands played
    -   Player/Banker/Tie wins breakdown
    -   Total amount wagered
    -   Net win/loss tracking
    -   Total commissions paid
    -   Win rate percentage
    -   Visual hand history (last 50 outcomes)

-   **Round History Panel**:
    -   Detailed log of last 30 rounds
    -   Shows bet type, bet amount, outcome, payout, and commission for each round
    -   Color-coded outcomes (Win/Loss/Push)
    -   Expandable/collapsible for clean UI

### Design

-   **Casino Aesthetic**: Authentic green felt table with wooden border and gold accents
-   **Smooth Animations**: Card dealing animations and transitions
-   **Responsive Layout**: Works on desktop, tablet, and mobile devices
-   **Collapsible Panels**: Toggle statistics and history panels independently
-   **No External Dependencies**: Pure HTML, CSS, and vanilla JavaScript

## 🎲 How to Play

### Basic Rules

1. **Objective**: Bet on which hand (Player or Banker) will have a total closest to 9, or bet on a Tie
2. **Card Values**:
    - Aces = 1 point
    - 2-9 = Face value
    - 10, J, Q, K = 0 points
3. **Hand Totals**: Only the last digit counts (e.g., 15 = 5, 18 = 8)

### Third-Card Rules

#### Player's Third Card

-   **0-5**: Player draws a third card
-   **6-7**: Player stands
-   **8-9**: Natural - no more cards dealt

#### Banker's Third Card

When Player stands (6-7), Banker follows same rule as Player.

When Player draws a third card:

-   **Banker 0-2**: Always draws
-   **Banker 3**: Draws unless Player's 3rd card is 8
-   **Banker 4**: Draws if Player's 3rd card is 2-7
-   **Banker 5**: Draws if Player's 3rd card is 4-7
-   **Banker 6**: Draws if Player's 3rd card is 6-7
-   **Banker 7**: Always stands
-   **Banker 8-9**: Natural - no more cards

### Payouts

-   **Player Win**: 1:1 (bet $10, win $10)
-   **Banker Win**: 1:1 minus 5% commission (bet $10, win $9.50)
-   **Tie**: 8:1 (bet $10, win $80)

### Game Controls

1. **Place Bet**: Enter bet amount and select Player, Banker, or Tie
2. **Deal**: Click "DEAL" to start the round
3. **New Round**: After outcome is determined, click "NEW ROUND" to play again

### Automation Controls

#### Auto-Play

1. Enter number of rounds (1-1000)
2. Select your bet type (Player/Banker/Tie)
3. Click "AUTO PLAY"
4. Watch rounds play out with animations
5. Click "STOP AUTO" to pause

#### Super Auto-Play

1. Enter number of rounds (1-1000)
2. Select your bet type
3. Click "SUPER AUTO"
4. Rounds execute instantly in batches
5. Display updates every 100 rounds for performance
6. Click "STOP SUPER AUTO" to cancel

## 🔧 Technical Details

### Architecture

-   **Pure Vanilla JavaScript**: No frameworks or libraries
-   **Event-Driven**: Clean separation between UI and game logic
-   **State Management**: Centralized game state with clear mutation patterns
-   **Modular Design**: Separate functions for shuffling, dealing, hand evaluation, outcome resolution

### Key Algorithms

#### Fisher-Yates Shuffle

```javascript
function shuffleShoe(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(secureRandom() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
```

#### Hand Total Calculation

```javascript
function calculateHandTotal(hand) {
    let total = 0;
    for (const card of hand) {
        if (card.value === "A") total += 1;
        else if (["J", "Q", "K"].includes(card.value)) total += 0;
        else total += parseInt(card.value);
    }
    return total % 10; // Only last digit matters
}
```

#### Banker Third-Card Logic

```javascript
function bankerDrawsThirdCard(bankerTotal, playerThirdCard) {
    if (bankerTotal >= 7) return false;
    if (bankerTotal <= 2) return true;
    if (bankerTotal === 3) return playerThirdCard !== 8;
    if (bankerTotal === 4) return [2,3,4,5,6,7].includes(playerThirdCard);
    if (bankerTotal === 5) return [4,5,6,7].includes(playerThirdCard);
    if (bankerTotal === 6) return [6,7].includes(playerThirdCard);
    return false;
}
```

### Performance Optimizations

-   **Batch DOM Updates**: Super auto-play updates display every 100 rounds instead of every round
-   **Minimal Reflows**: Card rendering optimized to reduce layout recalculations
-   **Efficient History**: Round history limited to last 30 entries to prevent memory bloat
-   **Event Delegation**: Reduced event listener overhead

### Browser Compatibility

-   **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
-   **Required APIs**:
    -   `crypto.getRandomValues()` - Secure random numbers
    -   ES6+ JavaScript features (arrow functions, template literals, const/let)
    -   CSS Grid and Flexbox

## 📊 Statistics Explained

### Win Rate Calculation

```
Win Rate = (Number of Winning Bets / Total Hands Played) × 100
```

Note: Ties do not count as wins in win rate calculation

### Commission Tracking

-   Only applies to Banker wins
-   Always 5% of the winnings (not the bet)
-   Example: Bet $100 on Banker, win → Get $195 ($100 bet + $100 win - $5 commission)

### Net Win/Loss

```
Net Win/Loss = Total Payouts - Total Bets - Total Commissions
```

## 🎨 Color Scheme

### Bet Type Colors

-   **Player**: Blue (`#2196F3`) - Cool, strategic
-   **Banker**: Red (`#d32f2f`) - Bold, house advantage
-   **Tie**: Green (`#4caf50`) - High risk, high reward

### UI Elements

-   **Table**: Green felt gradient (`#0a5f0a` to `#084d08`)
-   **Border**: Brown wood (`#8b4513`, `#654321`)
-   **Accents**: Gold (`#ffd700`)
-   **Background**: Dark blue gradient (`#1a1a2e` to `#16213e`)

## 📁 File Structure

```
bcr.html    - Game structure and UI layout (178 lines)
bcr.js      - Game logic and state management (854 lines)
bcr.css     - Styling and animations (843 lines)
```

### Code Organization (bcr.js)

1. **Utility Functions** (Lines 1-120)

    - Secure RNG, shoe creation, shuffling

2. **Game Logic** (Lines 121-420)

    - Hand calculation, third-card rules, outcome resolution

3. **UI Updates** (Lines 421-520)

    - Display updates, animations, message handling

4. **Event Handlers** (Lines 521-600)

    - Deal, new round, button interactions

5. **Automation** (Lines 601-800)

    - Auto-play and super auto-play logic

6. **Statistics & History** (Lines 801-854)
    - Stats updates, round history management

## 🚀 Installation

1. Download all three files:

    - `bcr.html`
    - `bcr.js`
    - `bcr.css`

2. Place them in the same directory

3. Open `bcr.html` in a modern web browser

4. Start playing!

## 🎯 Strategy Tips

### House Edge

-   **Banker**: ~1.06% (including commission)
-   **Player**: ~1.24%
-   **Tie**: ~14.36%

**Recommendation**: Banker bet has the lowest house edge, making it the mathematically optimal choice over time.

### Bankroll Management

-   Set a budget before playing
-   Use consistent bet sizing
-   Avoid chasing losses with Tie bets
-   The 5% commission on Banker wins is still better than Player's higher house edge

### Pattern Watching

While past results don't affect future outcomes (each hand is independent), the hand history display lets you track streaks and patterns for entertainment.

## 🐛 Known Limitations

-   No card counting features (Baccarat is not advantageous for counting)
-   No side bets (Pairs, Dragon Bonus, etc.)
-   Commission is deducted immediately rather than accumulated
-   No multiplayer functionality
-   Statistics reset on page refresh

## 📝 Future Enhancements

-   [ ] Save/load game state to localStorage
-   [ ] Side bet options (Pairs, Dragon Bonus)
-   [ ] Betting patterns (Martingale, Fibonacci)
-   [ ] Card counting display (for educational purposes)
-   [ ] Downloadable statistics report
-   [ ] Sound effects and music
-   [ ] Multi-language support
-   [ ] Dark/light theme toggle

## 📄 License

This is a demonstration project for educational and entertainment purposes.

## 🙏 Acknowledgments

-   Punto Banco rules from official casino gaming standards
-   Styling inspiration from traditional casino table layouts
-   Fisher-Yates shuffle algorithm for fair card distribution
-   Web Crypto API for cryptographically secure random numbers

---

**Enjoy the game and gamble responsibly! This is for entertainment purposes only.**
