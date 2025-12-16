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
-   **Never Split**: 10s, 5s, and 4s
-   **Split if dealer shows 2-6**: 2s, 3s, 6s, 7s, 9s
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

| Your Hand          | Dealer Shows 2-6  | Dealer Shows 7-Ace |
| ------------------ | ----------------- | ------------------ |
| 17+                | STAND             | STAND              |
| 13-16              | STAND             | HIT                |
| 12                 | STAND (4-6 only)  | HIT                |
| 11                 | DOUBLE            | DOUBLE/HIT         |
| 10                 | DOUBLE            | HIT                |
| 9                  | DOUBLE (3-6 only) | HIT                |
| 8 or less          | HIT               | HIT                |
| A,8 or A,9         | STAND             | STAND              |
| A,7                | STAND/DOUBLE      | HIT                |
| A,2 to A,6         | HIT/DOUBLE        | HIT                |
| Pair of A's or 8's | SPLIT             | SPLIT              |
| Pair of 10's       | STAND             | STAND              |

## **About This Game**

This blackjack implementation uses a 6-deck shoe (312 cards) with Continuous Shuffling Machine simulation, which reshuffles when depleted. This makes traditional card counting ineffective, so focus on basic strategy for optimal play.

**Game Rules:**

-   Blackjack pays 3:2
-   Dealer stands on all 17s
-   Split once maximum
-   Double down on first two cards only
-   No insurance option (it's a bad bet anyway!)

---

_Good luck at the tables! Remember: the house always has an edge, but basic strategy minimizes it to the bare minimum._
