# Interview Preparation

A self-contained 14-day guide for technical interviews: coding, data structures and algorithms, system design, communication, behavioural questions, and questions for interviewers.

## 14-day revision plan

| Days | Focus | Topics and goals |
| --- | --- | --- |
| 1–3 | Coding foundations | Complexity analysis, arrays, strings, hash maps, linked lists, stacks, and queues. Solve 2–3 timed problems a day and narrate your choices aloud. |
| 4–6 | Patterns and problem solving | Two pointers, sliding window, binary search, recursion, trees, graphs, and dynamic programming. Focus on recognising the pattern before writing code. |
| 7–9 | System design | Requirements, estimates, APIs, storage, scaling, and trade-offs. Draw one design every day and identify its bottleneck. |
| 10–11 | Communication | Timed mock answers; practise clarification, structured reasoning, testing, and recovering when stuck. |
| 12–14 | Full simulations | One coding mock and one system-design mock each day. Review mistakes, revisit weak topics, and prepare questions for interviewers. |

## Daily practice routine

- [ ] **15 minutes — Recall:** explain one data-structure or system-design concept without notes.
- [ ] **45 minutes — Solve:** complete one new coding problem under interview conditions.
- [ ] **15 minutes — Review:** write down the pattern, mistake, and cleaner alternative.
- [ ] **15 minutes — Communicate:** speak through an answer or design aloud.

## 1. Technical interview

Coding interviews assess how you reason with incomplete information. Make the reasoning visible: clarify, plan, implement, test, and improve.

### Five-step method

1. **Clarify the prompt.** Restate the input, output, constraints, and edge cases. Ask whether duplicates, empty inputs, negative values, and ordering matter. Do not code until you can explain a small example.
2. **Plan a baseline.** State a straightforward brute-force solution, its time and space cost, and why it will not scale.
3. **Optimise.** Introduce the appropriate data structure or pattern and explain why it improves the baseline.
4. **Implement and narrate.** Explain what each key variable represents. Use readable names and small helpers where they make the logic easier to verify.
5. **Validate.** Trace a normal and edge case, state time and space complexity, and describe any important trade-off.

### Complexity essentials

| Complexity | Meaning | Typical example |
| --- | --- | --- |
| `O(1)` | Constant work | Hash-map lookup on average |
| `O(log n)` | Repeatedly halve the search space | Binary search |
| `O(n)` | Scan each input once | Single array pass |
| `O(n²)` | Compare many pairs | Nested-loop pair search |

Always include auxiliary memory in the analysis. A hash map often trades `O(n)` extra space for faster lookup.

**Example — Two Sum**

- Brute force: try every pair → `O(n²)` time, `O(1)` space.
- Better approach: store each value and its index in a map; for each value `x`, look up `target - x` → `O(n)` time, `O(n)` space.
- Say: “I’ll use a map to trade linear extra memory for constant-time complement lookups, reducing the overall pass from quadratic to linear.”

### Test matrix

Test the smallest valid input, a typical input, duplicates, boundary values, and empty or invalid input when the contract permits it.

```text
twoSum([2, 7, 11, 15], 9) → [0, 1]
twoSum([3, 3], 6)         → [0, 1]  duplicate case
twoSum([], 9)             → []      if empty input is allowed
```

### Practice questions

1. **Two Sum:** solve with nested loops, then a hash map. Explain why storing before or after checking matters.
2. **Valid Parentheses:** use a stack for unmatched opening brackets; trace `"([{}])"`.
3. **Longest Substring Without Repeating Characters:** state the sliding-window invariant and when the left pointer moves.
4. **Merge Intervals:** explain why sorting comes first and state the resulting complexity.

Detailed page: [Technical interview](technical-interview/index.html).

## 2. Data structures and algorithms

For every structure, know its operations, complexity, and the clues in a question that suggest using it.

For Java implementations and reusable code templates, see [DSA in Java](dsa-java.md).

### Core structures

| Structure | Use it for | Key complexity / property |
| --- | --- | --- |
| Hash map / set | Membership, counts, grouping, complements | Average insert and lookup: `O(1)`; maps store key-value pairs, sets store unique values. |
| Array | Indexed, ordered data | Indexed access: `O(1)`; middle insertion: `O(n)`. |
| Linked list | Cheap local insertion/removal | No direct indexed access. |
| Stack | Most recently added item first | LIFO. |
| Queue | First added item first | FIFO. |
| Heap | Repeated min/max or top-*k* work | Insert and remove: `O(log n)`. |
| Balanced binary-search tree | Ordered data with updates | Lookup, insert, delete: `O(log n)`. |

### Pattern recognition

| Question clue | Likely pattern |
| --- | --- |
| Pair / sorted array | Two pointers |
| Contiguous subarray or substring | Sliding window or prefix sum |
| Top *k* / next smallest | Heap |
| All combinations | Backtracking |
| Minimum steps / repeated choice | BFS or dynamic programming |

Patterns do not replace reasoning. State the invariant: for a sliding window, explain exactly what remains true as the window expands or shrinks.

### Graphs, recursion, and dynamic programming

- **BFS:** use for the shortest path in an unweighted graph because it explores nodes by distance layers.
- **DFS:** use for reachability, connected components, cycle detection, and backtracking.
- **Dynamic programming:** use when subproblems overlap and the best answer can be built from smaller answers.

**BFS template**

1. Put the start node in a queue and mark it visited.
2. Remove a node and inspect every unvisited neighbour.
3. Mark and enqueue those neighbours.
4. The first time you reach a target is its shortest path by edge count.

### Practice questions

1. **Group Anagrams:** choose a stable key for each word and analyse the cost of creating it.
2. **Number of Islands:** model the grid as a graph; compare recursive DFS with an explicit stack.
3. **Kth Largest Element:** compare sorting with a size-*k* min-heap.
4. **Coin Change:** define the DP state, base case, recurrence, and answer location.

Detailed page: [Data structures & algorithms](data-structures/index.html).

## 3. System design

A strong system-design interview is a guided discussion. Tie every technical choice to a requirement, estimate, or known bottleneck.

### Design framework

1. **Scope the system.** Identify users and core operations. Confirm whether freshness, availability, latency, durability, or consistency matters most. Explicitly defer out-of-scope features.
2. **Estimate scale.** Estimate requests per second, read/write ratio, object size, storage growth, and bandwidth. Approximate figures show when you need a cache or asynchronous pipeline.
3. **Design and refine.** Draw clients, APIs, services, data stores, and the main data flow. Then address caching, partitioning, replication, queues, observability, and failure modes.

### Building blocks

| Component | Why it exists | Consideration |
| --- | --- | --- |
| Load balancer | Distributes traffic and enables horizontal scaling | Health checks and routing |
| Cache | Lowers read latency and database load | Needs invalidation or refresh strategy |
| Queue | Absorbs bursts and decouples slow background work | Consumers, retries, and ordering |
| Database | Durable source of truth | Relational databases suit joins and transactions |
| CDN | Serves static, cacheable content near users | Cache-control and invalidation |
| Replication | Improves read availability | May introduce replication lag |

**Trade-off phrasing:** “For this read-heavy feed, I would cache popular results. I would accept brief staleness, but invalidate or refresh after a write so users do not see old content for long.”

### Worked example — URL shortener

**Requirements:** create a short URL, redirect quickly, and optionally record clicks.

```text
Client → load balancer → URL service → cache → key-value store
                                      └→ event queue → analytics worker
```

- `POST /urls`: generate a unique ID, encode it, and store the code-to-URL mapping.
- `GET /{code}`: check cache, then the primary store, then return a redirect.
- Prevent code collisions with a distributed ID generator or a retry after a uniqueness check.
- Cache popular mappings. Send click analytics to a queue so redirect latency does not depend on logging.

### Practice prompts

1. **Rate limiter:** compare token bucket and fixed-window counters; decide where counters live.
2. **News feed:** compare fan-out on write with fan-out on read, especially for celebrity accounts.
3. **File storage:** separate metadata from file bytes; explain upload and download flows.
4. **Chat service:** cover connection management, delivery order, presence, and offline messages.

Detailed page: [System design](system-design/index.html).

## 4. Interview approach and behavioural answers

The interviewer needs a clear view of how you analyse, choose, test, and adapt—not silence followed by a perfect answer.

### Communicating while solving

- **Before coding:** say, “I’ll confirm assumptions, work through an example, describe a baseline, then optimise before implementing.”
- **During coding:** narrate decisions, invariants, variables, and meaningful branches—not every keystroke. Pause when a requirement changes.
- **After coding:** test with an example, state complexity, and offer a possible extension. Do not claim optimality unless you can justify it.

### When stuck

State what you know: input, output, a small example, and a working baseline. Then ask a targeted question or propose a constrained next step. Do not guess silently for several minutes.

```text
“The brute-force version is clear and runs in O(n²). I suspect we can avoid
revisiting earlier values with a map. May I explore that approach?”

“I am deciding between BFS and DFS. Since we need the fewest edges in an
unweighted graph, I will choose BFS and keep a visited set.”
```

Precise questions are a strength: they show exactly where you need information and let the interviewer help productively.

### Behavioural stories: STAR + reflection

- **Situation:** enough context to explain the stakes.
- **Task:** your responsibility.
- **Action:** what you personally did and why.
- **Result:** the measurable outcome.
- **Reflection:** what you learned or would change.

Example: during a disagreement over a migration plan, write down latency, risk, and rollout criteria; prototype both paths; choose a staged migration and avoid a planned outage. Reflection: shared decision criteria turn preferences into testable choices.

### Practice prompts

1. For “find the most frequent item,” list five assumptions you would clarify.
2. Explain how to find a cycle in a linked list without writing code.
3. Practise a 30-second response after discovering that your first approach is too slow.
4. Prepare STAR + reflection stories about conflict, failure, ownership, ambiguity, and learning quickly.

Detailed page: [Interview approach](interview-approach/index.html).

## 5. Questions to ask interviewers

Choose questions that cannot be answered from the company website. Refer to something you learned during the interview, ask for specific behaviours or examples, and keep 8–10 questions ready so you can choose the best two or three.

### Role and impact

1. What would make someone exceed expectations in this role within the first six months?
2. What are the most important problems you would want this person to help solve first?
3. How are priorities set when product needs, reliability work, and technical debt compete?
4. What measurable outcomes tell you that this team’s work is successful?

### Team and engineering culture

1. Can you walk me through how an idea moves from discovery to production here?
2. How does the team approach design reviews and decisions with meaningful trade-offs?
3. What recent challenge did the team face, and what did you learn from it?
4. How do engineers receive feedback and develop new skills on this team?

Tailor your questions: ask an engineering manager about expectations and team health, an engineer about day-to-day collaboration and technical decisions, and a product partner about customer outcomes.

### Closing and follow-up

Ask: “Is there anything in my background or answers that you would like me to clarify?” Then thank the interviewer, briefly restate your interest, and follow up within a day.

```text
Thank you for the conversation about [team/project]. I particularly enjoyed
learning about [specific point]. The role's focus on [relevant challenge]
matches the work I enjoy, and I would be excited to contribute.
```

Detailed page: [Questions to ask](questions-to-ask/index.html).
