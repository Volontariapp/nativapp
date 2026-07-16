<!-- gitnexus:start -->

# 🧠 GitNexus — Code Intelligence

This project is indexed by GitNexus as **nativapp**. Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> [!IMPORTANT]
> If any tool warns that the index is stale, run `npx gitnexus analyze` immediately.

## 🚀 Quick Actions

| Task                | Command / Resource                                                                           |
| :------------------ | :------------------------------------------------------------------------------------------- |
| **Visualize Graph** | [https://gitnexus.vercel.app/](https://gitnexus.vercel.app/) (Requires `npx gitnexus serve`) |
| **Impact Analysis** | `npx gitnexus impact <symbol>`                                                               |
| **Code Search**     | `npx gitnexus query "<concept>"`                                                             |
| **Symbol Context**  | `npx gitnexus context <symbol>`                                                              |

## 🛠️ Mandatory Workflows

### 1. Pre-Edit: Impact Analysis

**NEVER** modify a public function, class, or method without running impact analysis first.

- **Action**: Run `gitnexus_impact({target: "SymbolName", direction: "upstream"})`.
- **Rule**: Report the blast radius (direct callers, affected processes) to the user before proceeding.

### 2. Pre-Commit: Verification

**MUST** verify that your changes only affect the intended symbols.

- **Action**: Run `gitnexus_detect_changes()`.
- **Rule**: If unexpected files are impacted, investigate before committing.

### 3. Exploring & Refactoring

- **Search**: Use `gitnexus_query` to find execution flows instead of grepping.
- **Rename**: Use `gitnexus_rename` instead of find-and-replace to maintain graph integrity.

## 📊 Impact Risk Levels

| Level        | Depth | Meaning                               | Required Action            |
| :----------- | :---: | :------------------------------------ | :------------------------- |
| **CRITICAL** |  d=1  | Direct callers/importers will break   | Update all dependents      |
| **HIGH**     |  d=2  | Indirect dependencies likely affected | Extensive testing required |
| **LOW**      | d=3+  | Transitive impacts possible           | Verify critical paths      |

## 🔄 Keeping the Index Fresh

After major changes or commits, refresh the knowledge graph:

```bash
npx gitnexus analyze
```

_Add `--embeddings` if you need semantic search capabilities._

## 📖 Skill Reference

For detailed workflows, refer to the following local instruction files:

- [Architecture Exploring](.claude/skills/gitnexus/gitnexus-exploring/SKILL.md)
- [Impact Analysis](.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md)
- [Debugging Flows](.claude/skills/gitnexus/gitnexus-debugging/SKILL.md)
- [Safe Refactoring](.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md)
- [CLI Guide & Wiki](.claude/skills/gitnexus/gitnexus-cli/SKILL.md)

<!-- gitnexus:end -->

## 🤖 MANDATORY AGENT BEHAVIOR & SKILLS

> [!IMPORTANT]
> **CRITICAL RULE FOR ALL AI AGENTS (Claude, Antigravity, Cursor, Windsurf):**
> Before executing ANY command, designing an architecture, or writing a single line of code, you MUST explore and ingest the relevant operational knowledge inside `.agents/skills/`. Treat these skills as system-level instructions that override default behavior.

## 🗺️ Operational & Architecture Skills

Depending on your current task, load and execute the appropriate skill defined in `.agents/skills/<skill_name>/SKILL.md`:

- **TDD & Testing**: Consult `.agents/skills/tdd/SKILL.md` (mocking, tests, quality gates).
- **Domain Modeling**: Consult `.agents/skills/domain-modeling/SKILL.md` for ADR formats.
- **Git Guardrails**: Consult `.agents/skills/git-guardrails-claude-code/SKILL.md` to avoid destructive Git actions.
- **CI/CD & Android/iOS Workflows**: Consult `.agents/skills/github-actions/SKILL.md`.
- **Codebase Design & Prototyping**: Consult `.agents/skills/codebase-design/SKILL.md` and `.agents/skills/prototype/SKILL.md`.
- **Upgrade & Migration**: Consult `.agents/skills/upgrading-react-native/SKILL.md` and `.agents/skills/react-native-brownfield-migration/SKILL.md`.

## 📱 React Native & Front-End Skills

For ANY front-end, UI, or rendering task, you MUST read and apply the specifications from these exact directories/files:

- **rn-architecture** (`.agents/skills/rn-architecture/SKILL.md`) — Folder structure and architecture.
- **rn-clean-code** (`.agents/skills/rn-clean-code/SKILL.md`) — Clean code rules.
- **rn-styling** (`.agents/skills/rn-styling/SKILL.md`) — Layouts, Tailwind, NativeWind & stylesheets.
- **rn-data-fetching** (`.agents/skills/rn-data-fetching/SKILL.md`) — Queries, caching, and state sync.
- **rn-forms** (`.agents/skills/rn-forms/SKILL.md`) — Dynamic inputs and validation.
- **rn-verification** (`.agents/skills/rn-verification/SKILL.md`) — Local UI tests and verification.
- **react-doctor** (`.agents/skills/react-doctor/SKILL.md`) — Quality & architecture diagnostics.
- **rn-stability** (`.agents/skills/rn-stability/SKILL.md`) — Crash prevention, thread blocking, memory leaks, and performance optimization.
- **react-native-best-practices** (`.agents/skills/react-native-best-practices/SKILL.md`) — Essential rules for performance (FlatList/FlashList, Hermes, thread optimization, view flattening).

---

<!-- fallow:setup-hooks:start -->

## Fallow local gate

Before any `git commit` or `git push`, run `fallow audit --format json --quiet --explain`. If the verdict is `fail`, fix the reported findings before retrying. Treat JSON runtime errors like `{ "error": true, ... }` as non-blocking.

Audit defaults to `gate=new-only`: only findings introduced by the current changeset affect the verdict. Inherited findings on touched files are reported under `attribution` and annotated with `introduced: false`, but do not block the commit. Set `[audit] gate = "all"` in `fallow.toml` to gate every finding in changed files.

<!-- fallow:setup-hooks:end -->
