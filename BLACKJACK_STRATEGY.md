# Casino Blackjack Strategy Guide

## **Basic Strategy (Optimal Play)**

This is the universally recognized **Basic Strategy** - the mathematically proven optimal way to play every blackjack hand. Developed through computer simulations of millions of hands, it's the foundation that professional players use.

## **Fundamental Rules**

### **Hard Totals (no Ace or Ace counting as 1)**

-   **17+**: Always STAND
-   **13-16**: STAND if dealer shows 2-6, HIT if dealer shows 7-Ace
-   **12**: STAND if dealer shows 4-6, HIT otherwise
-   **11 or less**: Always HIT

### **Soft Totals (Ace counting as 11)**

-   **Soft 19-20** (A,8 or A,9): Always STAND
-   **Soft 18** (A,7): STAND if dealer shows 2-8, HIT if dealer shows 9-Ace
-   **Soft 17 or less**: Always HIT

### **Pairs (Splitting)**

-   **Always Split**: Aces and 8s
-   **Never Split**: 10s and 5s
-   **Split if dealer shows 2-7**: 2s, 3s, 7s
-   **Split if dealer shows 2-6**: 6s
-   **Split if dealer shows 5-6**: 4s (only when dealer is weakest)
-   **9s special**: Split if dealer shows 2-9 (except 7), STAND if dealer shows 7, 10, or Ace

### **Doubling Down**

-   **11**: Always double (unless dealer has Ace)
-   **10**: Double if dealer shows 2-9
-   **9**: Double if dealer shows 3-6
-   **Soft 16-18** (A,5 / A,6 / A,7): Double if dealer shows 4-6

## **Key Principles**

1. **Dealer's Weakness**: Dealer busts most often when showing 4, 5, or 6 (40%+ bust rate)
2. **Dealer's Strength**: Dealer showing 7-Ace is strong - assume they have 17+
3. **Never Take Insurance**: Mathematically unfavorable (house edge ~7%)
4. **Manage Bankroll**: Bet 1-2% of total bankroll per hand to survive variance
5. **Know When to Leave**: Set win/loss limits and stick to them

## **Common Mistakes to Avoid**

-   ❌ Hitting on 17+ (dealer will bust enough on their own)
-   ❌ Standing on 12-16 when dealer shows 7-Ace
-   ❌ Splitting 10s (already have 20!)
-   ❌ Taking insurance
-   ❌ Betting emotionally after wins/losses

## **Why This Works**

Following basic strategy reduces the house edge to **~0.5%**, making blackjack one of the best odds in the casino. The strategy is based on computer simulations of millions of hands, showing the mathematically optimal play for every situation.

## **Quick Reference Chart**

| Your Hand    | Dealer Shows 2-6  | Dealer Shows 7-Ace |
| ------------ | ----------------- | ------------------ |
| 17+          | STAND             | STAND              |
| 13-16        | STAND             | HIT                |
| 12           | STAND (4-6 only)  | HIT                |
| 11           | DOUBLE            | DOUBLE/HIT         |
| 10           | DOUBLE            | HIT                |
| 9            | DOUBLE (3-6 only) | HIT                |
| 8 or less    | HIT               | HIT                |
| A,8 or A,9   | STAND             | STAND              |
| A,7          | STAND/DOUBLE      | HIT                |
| A,2 to A,6   | HIT/DOUBLE        | HIT                |
| Pair of A's  | SPLIT             | SPLIT              |
| Pair of 10's | STAND             | STAND              |
| Pair of 9's  | SPLIT (2-9 ex.7)  | STAND (7/10/A)     |
| Pair of 8's  | SPLIT             | SPLIT              |
| Pair of 7's  | SPLIT (2-7)       | HIT (8-A)          |
| Pair of 6's  | SPLIT (2-6)       | HIT (7-A)          |
| Pair of 5's  | DOUBLE (2-9)      | HIT (10-A)         |
| Pair of 4's  | SPLIT (5-6)       | HIT (2-4, 7-A)     |
| Pair of 3's  | SPLIT (2-7)       | HIT (8-A)          |
| Pair of 2's  | SPLIT (2-7)       | HIT (8-A)          |

## **Pair Splitting Explained**

Understanding when to split pairs is crucial for optimal play. Here's the mathematical reasoning behind each pair decision:

### **Always Split**

**Pair of Aces (A,A)**

-   **Why**: Two chances at blackjack (21) or strong totals
-   Starting with 12 or soft 12 is weak - splitting gives you two hands starting with 11
-   Each hand has 30.8% chance of 21 (any 10-value card)
-   **Math**: EV of splitting A,A vs dealer 6 = +1.18 units vs +0.10 for hitting 12
-   **Note**: Most casinos only give one card per split Ace

**Pair of 8s (8,8)**

-   **Why**: 16 is the worst hand in blackjack (highest bust rate when hitting)
-   Splitting gives two hands starting with 8 - much better potential
-   Against dealer 10: Splitting loses less (-0.48) than hitting 16 (-0.54)
-   **Math**: Even vs dealer Ace, splitting is better than staying with 16

### **Never Split**

**Pair of 10s (10,10 or any face cards)**

-   **Why**: You have 20 - the second-best hand possible!
-   Splitting turns one excellent hand into two mediocre 10s
-   **Math**: Standing on 20 wins ~80% vs dealer 6 (+1.56 EV)
-   Splitting wins ~58% per hand (+0.72 EV total) - you lose 0.84 units!
-   **Rule**: Never break up 20, even if dealer shows 5 or 6

**Pair of 5s (5,5)**

-   **Why**: You have 10 - perfect for doubling!
-   Splitting creates two weak hands starting with 5
-   **Math**: Doubling 10 vs dealer 6 = +1.24 EV
-   Splitting 5,5 vs dealer 6 = +0.18 EV - you lose 1.06 units!
-   **Strategy**: Always treat as hard 10 (double vs 2-9, hit vs 10/A)

**Pair of 4s (4,4)**

-   **Why**: 8 is decent, but splitting can work vs weakest dealers
-   **vs 5-6**: Split marginally better - dealer busts 42%+
-   Starting with 4 allows flexible building (can draw up to 7 cards without bust)
-   **Math**:
    -   vs 5: Split EV = +0.11, Hit EV = +0.09 (+0.02 advantage)
    -   vs 4: Split EV = +0.08, Hit EV = +0.08 (equal)
    -   vs 7: Split EV = -0.08, Hit EV = -0.06 (hitting better)
-   **vs 2-4, 7-A**: Hitting 8 is better - can't bust and builds well
-   **Strategy**: Split only vs 5-6 (or just hit all for simplicity)

### **Conditional Splits**

**Pair of 2s (2,2) - Split vs 2-7**

-   **Why**: 4 is weak, splitting works when dealer bust rate >23%
-   **Math by dealer upcard**:
    -   vs 2: Split EV = -0.08, Hit EV = -0.12 (+0.04 gain)
    -   vs 5: Split EV = +0.13, Hit EV = +0.04 (+0.09 gain)
    -   vs 7: Split EV = -0.21, Hit EV = -0.25 (+0.04 gain)
    -   vs 8: Split EV = -0.31, Hit EV = -0.28 (-0.03 loss)
-   **Threshold**: Split profitable through dealer 7 (26% bust rate)
-   **vs 8-A**: Dealer too strong (<24% bust), hitting 4 is better

**Pair of 3s (3,3) - Split vs 2-7**

-   **Why**: 6 is weak, splitting works through dealer 7
-   **Math by dealer upcard**:
    -   vs 2: Split EV = -0.06, Hit EV = -0.10 (+0.04 gain)
    -   vs 5: Split EV = +0.15, Hit EV = +0.06 (+0.09 gain)
    -   vs 7: Split EV = -0.19, Hit EV = -0.22 (+0.03 gain)
    -   vs 8: Split EV = -0.29, Hit EV = -0.26 (-0.03 loss)
-   **Threshold**: Split profitable through dealer 7 (same pattern as 2s)
-   **vs 8-A**: Hitting 6 loses less than splitting into two 3s

**Pair of 6s (6,6) - Split vs 2-6 Only**

-   **Why**: 12 is a bust-prone stiff, split only vs weakest dealers
-   **Math by dealer upcard**:
    -   vs 2: Split EV = -0.12, Hit EV = -0.14 (+0.02 gain)
    -   vs 5: Split EV = +0.18, Hit EV = +0.10 (+0.08 gain)
    -   vs 6: Split EV = +0.22, Hit EV = +0.13 (+0.09 gain)
    -   vs 7: Split EV = -0.30, Hit EV = -0.26 (-0.04 loss)
-   **Threshold**: Only profitable vs 2-6 (35-42% bust)
-   **vs 7-A**: Hitting 12 loses less - dealer too strong
-   **Key**: 12 needs higher bust rate (35%+) to justify split

**Pair of 7s (7,7) - Split vs 2-7**

-   **Why**: 14 is mediocre, splitting works through dealer 7
-   **Math by dealer upcard**:
    -   vs 2: Split EV = -0.04, Hit EV = -0.08 (+0.04 gain)
    -   vs 5: Split EV = +0.25, Hit EV = +0.12 (+0.13 gain)
    -   vs 7: Split EV = -0.11, Hit EV = -0.16 (+0.05 gain)
    -   vs 8: Split EV = -0.27, Hit EV = -0.23 (-0.04 loss)
-   **Threshold**: Split through dealer 7 (each 7 can make 17 to match dealer's likely 17)
-   **vs 8-A**: Dealer too strong, hitting 14 better than two vulnerable 7s

### **Special Case**

**Pair of 9s (9,9)**

-   **Why**: 18 is decent but not great - selectively split for improvement
-   **SPLIT vs 2-6**: Dealer busts 35-42%, two 9s build to 19-21 frequently
-   **SPLIT vs 8-9**: Your 18 pushes 8, loses to 9 - splitting improves both scenarios
-   **STAND vs 7**: Your 18 beats dealer's likely 17 (can't make 18 with 7)
-   **STAND vs 10/A**: Dealer likely has 20/21, splitting makes two losing hands
-   **Math**:
    -   vs 6: Splitting EV = +1.04, Standing = +0.66 (+0.38 gain)
    -   vs 7: Splitting EV = +0.38, Standing = +0.40 (stand slightly better)
    -   vs 10: Splitting EV = -0.36, Standing = -0.18 (stand much better)

### **Mathematical Thresholds**

**Dealer Bust Rates & Split Decisions:**

-   **Dealer 2**: 35.3% bust → Split 2s, 3s, 6s, 7s worth +0.02-0.04 units
-   **Dealer 3**: 37.6% bust → Stronger split advantage (+0.05-0.07 units)
-   **Dealer 4-6**: 40-43% bust → Maximum split advantage (+0.08-0.13 units)
-   **Dealer 7**: 26.2% bust → Marginal splits (2s, 3s, 7s) still profitable (+0.03-0.05)
-   **Dealer 8-A**: 11-24% bust → Only split A's and 8s (escape hands)

**Split Threshold Rules:**

1. **2s, 3s, 7s**: Profitable through dealer 7 (26%+ bust) = **Split vs 2-7**
2. **4s**: Only profitable vs 5-6 (42%+ bust) = **Split vs 5-6**
3. **6s**: Profitable through dealer 6 (35-42% bust) = **Split vs 2-6**
4. **9s**: Skip dealer 7 (you win with 18), split 2-6 and 8-9 = **Split vs 2-9 except 7**

**Expected Value Gains from Splitting (vs hitting):**
| Pair | vs 2 | vs 5 | vs 7 | vs 8 |
|------|--------|--------|--------|--------|
| 2,2 | +0.04 | +0.09 | +0.04 | -0.03 |
| 3,3 | +0.04 | +0.09 | +0.03 | -0.03 |
| 4,4 | -0.02 | +0.02 | -0.02 | -0.04 |
| 6,6 | +0.02 | +0.08 | -0.04 | -0.05 |
| 7,7 | +0.04 | +0.13 | +0.05 | -0.04 |

_Positive = split better, Negative = hit better_

### **Key Principles**

1. **Dealer Weakness Drives Splits**: More bust risk = more split opportunities
2. **2s/3s/7s extend to dealer 7**: 26% bust rate is the threshold
3. **6s stop at dealer 6**: 12 is so bad it needs 35%+ bust rate
4. **4s only vs 5-6**: Marginal improvement, need 42%+ bust rate
5. **Always Split Aces/8s**: Mathematical advantage in all situations
6. **Never Split 10s/5s**: Strong hands/doubling opportunities
7. **When in Doubt vs 8-A**: Only split A's and 8's (escape terrible situations)

This blackjack implementation uses a 6-deck shoe (312 cards) with Continuous Shuffling Machine simulation, which reshuffles when depleted. This makes traditional card counting ineffective, so focus on basic strategy for optimal play.

**Game Rules:**

-   Blackjack pays 3:2
-   Dealer stands on all 17s
-   Split once maximum
-   Double down on first two cards only
-   No insurance option (it's a bad bet anyway!)

---

_Good luck at the tables! Remember: the house always has an edge, but basic strategy minimizes it to the bare minimum._
