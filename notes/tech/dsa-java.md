# DSA in Java

Java-focused notes for common interview data structures, algorithms, and patterns. Prefer clear standard-library code unless an interviewer asks you to implement a structure yourself.

## Setup and essentials

```java
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Queue;
```

Use only the imports needed by the final solution. You can use `import java.util.*;` in most coding platforms, but explicit imports make it clear which collections you chose and why.

| Java type | Use | Typical cost |
| --- | --- | --- |
| `HashMap<K, V>` | Lookup, counting, grouping, complements | Average `O(1)` get/put |
| `HashSet<E>` | Membership and uniqueness | Average `O(1)` add/contains |
| `ArrayDeque<E>` | Stack or queue | `O(1)` end operations |
| `PriorityQueue<E>` | Repeated min/max or top-*k* | `O(log n)` add/remove |
| `TreeMap` / `TreeSet` | Ordered keys / values | `O(log n)` operations |

Use `ArrayDeque` rather than Java's legacy `Stack` class.

## Arrays and strings

- Array indexed access is `O(1)`; scanning is `O(n)`; middle insertion is `O(n)`.
- `String` is immutable. Use `StringBuilder` when repeatedly appending.

```java
StringBuilder builder = new StringBuilder();
builder.append('a');
builder.append("bc");
String result = builder.toString();

char ch = s.charAt(i);
char[] chars = s.toCharArray();
String reversed = new StringBuilder(s).reverse().toString();
```

## Hash maps and sets

### Frequency map

```java
Map<Character, Integer> count = new HashMap<>();
for (char ch : s.toCharArray()) {
    count.put(ch, count.getOrDefault(ch, 0) + 1);
}
```

### Two Sum

```java
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> indexByValue = new HashMap<>();

    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (indexByValue.containsKey(complement)) {
            return new int[] {indexByValue.get(complement), i};
        }
        indexByValue.put(nums[i], i);
    }
    return new int[0];
}
```

Time: `O(n)`. Space: `O(n)`. Check the complement before storing the current item so one element is not used twice.

## Stack and queue

```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(10);
int top = stack.pop();

Deque<Integer> queue = new ArrayDeque<>();
queue.offer(10);
int first = queue.poll();
```

### Valid Parentheses

```java
public boolean isValid(String s) {
    Map<Character, Character> openingFor = Map.of(
        ')', '(', ']', '[', '}', '{'
    );
    Deque<Character> stack = new ArrayDeque<>();

    for (char ch : s.toCharArray()) {
        if (openingFor.containsKey(ch)) {
            if (stack.isEmpty() || stack.pop() != openingFor.get(ch)) {
                return false;
            }
        } else {
            stack.push(ch);
        }
    }
    return stack.isEmpty();
}
```

Invariant: the stack contains unmatched opening brackets in the order they must be closed.

## Two pointers and sliding window

### Pair sum in a sorted array

```java
public boolean hasPairWithSum(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left < right) {
        int sum = nums[left] + nums[right];
        if (sum == target) return true;
        if (sum < target) left++;
        else right--;
    }
    return false;
}
```

On sorted input, moving `left` increases the sum and moving `right` decreases it. Time: `O(n)`.

### Longest substring without repeating characters

```java
public int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> lastSeen = new HashMap<>();
    int left = 0, best = 0;

    for (int right = 0; right < s.length(); right++) {
        char ch = s.charAt(right);
        if (lastSeen.containsKey(ch)) {
            left = Math.max(left, lastSeen.get(ch) + 1);
        }
        lastSeen.put(ch, right);
        best = Math.max(best, right - left + 1);
    }
    return best;
}
```

Invariant: `s[left..right]` has no repeated character. Time: `O(n)`.

## Binary search

Use on sorted data or a monotonic condition.

```java
public int binarySearch(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```

Time: `O(log n)`. The midpoint form avoids integer overflow.

## Linked lists

```java
class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

public ListNode reverseList(ListNode head) {
    ListNode previous = null;
    ListNode current = head;
    while (current != null) {
        ListNode next = current.next;
        current.next = previous;
        previous = current;
        current = next;
    }
    return previous;
}
```

Time: `O(n)`, space: `O(1)`. Save `next` before changing a pointer.

## Trees and graphs

### Breadth-first search

Use BFS for shortest paths in an unweighted graph, since it visits nodes by distance layers.

```java
public int shortestPath(List<List<Integer>> graph, int start, int target) {
    Queue<Integer> queue = new ArrayDeque<>();
    boolean[] visited = new boolean[graph.size()];
    queue.offer(start);
    visited[start] = true;
    int distance = 0;

    while (!queue.isEmpty()) {
        for (int size = queue.size(); size > 0; size--) {
            int node = queue.poll();
            if (node == target) return distance;
            for (int neighbour : graph.get(node)) {
                if (!visited[neighbour]) {
                    visited[neighbour] = true;
                    queue.offer(neighbour);
                }
            }
        }
        distance++;
    }
    return -1;
}
```

Time: `O(V + E)`. Mark nodes visited when enqueuing, not dequeuing.

### Depth-first search

Use DFS for reachability, connected components, cycle detection, and backtracking.

```java
public void dfs(int node, List<List<Integer>> graph, boolean[] visited) {
    visited[node] = true;
    for (int neighbour : graph.get(node)) {
        if (!visited[neighbour]) {
            dfs(neighbour, graph, visited);
        }
    }
}
```

## Heap / priority queue

`PriorityQueue` is a min-heap by default; use `Comparator.reverseOrder()` for a max-heap.

```java
public int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>();
    for (int num : nums) {
        minHeap.offer(num);
        if (minHeap.size() > k) minHeap.poll();
    }
    return minHeap.peek();
}
```

This keeps the largest `k` items seen so far. Time: `O(n log k)`, space: `O(k)`.

## Dynamic programming

State the **state**, **base case**, **transition**, and **answer**.

### Coin Change

```java
public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);
    dp[0] = 0;

    for (int current = 1; current <= amount; current++) {
        for (int coin : coins) {
            if (coin <= current) {
                dp[current] = Math.min(dp[current], dp[current - coin] + 1);
            }
        }
    }
    return dp[amount] == amount + 1 ? -1 : dp[amount];
}
```

- State: `dp[current]` is the fewest coins needed to make `current`.
- Base case: `dp[0] = 0`.
- Transition: try every possible last coin.
- Time: `O(amount × coins.length)`; space: `O(amount)`.

## Interview checklist

- [ ] Clarify inputs, outputs, constraints, and edge cases.
- [ ] Work through a small example before coding.
- [ ] Describe the brute-force solution and its complexity.
- [ ] Identify the pattern and state its invariant.
- [ ] Choose the Java collection deliberately.
- [ ] Test normal, boundary, duplicate, and empty cases.
- [ ] State time and auxiliary-space complexity.
