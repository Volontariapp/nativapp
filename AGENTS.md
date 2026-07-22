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
