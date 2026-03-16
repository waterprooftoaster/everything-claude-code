- Code samples go in fenced blocks with the language specified.
- TC and SC are always written inline after the code block: `O(x)` TC, `O(x)` SC.
- Python is the default language for DSA code samples.
- Prefer manual implementations over library imports. If a library version exists, include it separately below the manual one.
- For DSA notes: code first, then TC/SC, then brief description of the algorithm.

After every solution or algorithm code block, follow this structure:

1. `` `O(x)` TC, `O(x)` SC. ``
2. One blank line.
3. A numbered list explaining the steps of the solution or algorithm.
4. `Notes:` section for additional observations.

- For trivial solutions that are simply a known algorithm (e.g., just topological sort, or just the merge step of merge sort), the numbered list can be omitted. Instead, wikilink the algorithm directly.
- Leetcode questions should bridge DSA concepts together. If a question uses a data structure or algorithm, link it naturally in the explanation (e.g., "Build a directed `[[graph]]` to represent dependencies, then check for valid `[[topological sort]]`.").
