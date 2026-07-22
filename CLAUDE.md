## 🚀 RTK - Rust Token Killer (Optimized)

All shell commands (`git`, `npm`, `jest`, etc.) are automatically proxied via `rtk` for 80% token savings.

- **Direct Usage:** `rtk gain` (analytics), `rtk discover` (missed savings).
- **Files:** Use `rtk read <file>`, `rtk ls`, `rtk find`, `rtk grep` for compressed agent output.

## 📱 React Native Front-End Skills (MANDATORY)

At the start of **ANY** front-end task, you **MUST** read the following skills located in `.agents/skills/` before writing any code:

1. `rn-architecture`
2. `rn-clean-code`
3. `rn-data-fetching`
4. `rn-forms`
5. `rn-styling`
6. `rn-verification`
7. `react-doctor` (Code quality & architecture diagnostics)
8. `rn-stability` (Crash prevention, memory leaks, security)

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
