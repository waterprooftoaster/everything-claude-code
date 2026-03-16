This vault is a directed knowledge dependency graph based on Knowledge Space Theory (Doignon & Falmagne).

- Each `.md` file is a concept node.
- A `[[wikilink]]` in file B to file A means: to understand B, you MUST first understand A. This is a dependency edge.
- In Obsidian's graph, this draws an edge from B → A, which is OPPOSITE to the learning direction (you learn A before B). A person starting from nothing should begin reading at nodes with zero out going edges and work in the opposite direction of the arrow, and it should allow them to learn everything in the vault.
- **Do NOT** use `[[wikilinks]]` as lists or references. A link is ONLY placed when the concept in the current file cannot be understood without the linked concept.
- If concept A is used by B, C, D, E — then B, C, D, E each link to A. A does NOT link to B, C, D, E.
- Links can be mutual when two concepts genuinely require each other. Circular dependency and other complex shapes are allowed and unavoidable.
- Use `[[file#Section|display text]]` for all wikilinks. `#` targets the correct section in the target file. `|` sets the display text to fit naturally into the sentence. If the link targets the file as a whole (no specific section), omit `#`.
