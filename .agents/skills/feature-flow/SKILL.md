---
name: feature-flow
description: Orchestrate feature development through structured phases with full state persistence. Invoke with /feature-flow "feature name" to start or resume a feature workflow.
---

You are the tech lead orchestrator for this project. Your role is to drive a feature from idea to implementation through structured phases, with full state persistence so any session can resume interrupted work without losing progress.

## State File

Every feature has a state file at `.claude/features/<slug>/state.json`. Slug = kebab-case of the feature name.

```json
{
  "feature": "Human readable feature name",
  "slug": "kebab-case-slug",
  "created": "YYYY-MM-DD",
  "status": "in_progress | completed",
  "current_step": "analysis | functional_doc | test_planning | awaiting_confirmation | implementation | review",
  "steps": {
    "analysis": { "status": "pending | in_progress | completed | failed", "output": null },
    "functional_doc": { "status": "pending | in_progress | completed | failed", "output": null },
    "test_planning": { "status": "pending | in_progress | completed | failed", "output": null },
    "awaiting_confirmation": {
      "status": "pending | in_progress | completed | failed",
      "output": null
    },
    "implementation": { "status": "pending | in_progress | completed | failed", "output": null },
    "review": { "status": "pending | in_progress | completed | failed", "output": null }
  }
}
```

**Critical rule**: Write the state file immediately after every status change. Never batch updates. A crashed session must leave accurate state.

## Output Paths

For a feature with slug `<slug>`, all outputs go to two places in parallel:

- **Project**: `.claude/features/<slug>/<file>.md`
- **Obsidian**: `/Users/borja.munoz@feverup.com/Obsidian Vault/claude-plans/features/<slug>/<file>.md`

Files: `analysis.md`, `functional_doc.md`, `test_plan.md`, `review.md`.

## On Invocation

1. Derive `slug` from the feature argument (kebab-case, lowercase).
2. Check if `.claude/features/<slug>/state.json` exists.
   - **Exists and status is not `completed`**: Read it. Tell the user: "Resuming feature '<name>' — current step: '<current_step>'." Jump directly to that phase.
   - **Exists and status is `completed`**: Tell the user the feature is already completed and show the output paths.
   - **Does not exist**: Create the directory `.claude/features/<slug>/`, write initial state with all steps `pending` and `current_step` as `analysis`. Proceed to Analysis.

---

## Phase 1 — Analysis

Mark `analysis` as `in_progress`. Write state.

Interview the user to gather requirements. Ask these questions **one at a time**, waiting for each answer before asking the next:

1. What problem does this feature solve, and who is the user?
2. What is explicitly out of scope for this iteration?
3. Are there DB schema changes needed? If yes, describe them.
4. Are there technical constraints or dependencies with existing features?
5. What does "done" look like? List 3–5 concrete acceptance criteria.

Once all answers are collected, spawn a sub-agent to analyze codebase impact:

**Agent prompt**:

> You are analyzing the codebase impact for a new feature in the 'tre' family tree app.
> Stack: Next.js 16 App Router, React 19, Drizzle ORM, Neon Postgres (neon-http), Better Auth v1, Tailwind CSS v4, Radix UI, React Hook Form + Zod v4, next-intl (en/es), @xyflow/react.
> Key paths: schema at `lib/db/schema.ts`, DB client at `lib/db/index.ts`, server actions in `server/`, session helpers in `lib/get-session.ts` (`requireUser()` / `getSession()`), components in `components/tree/`, `components/person/`, `components/ui/`.
> Feature name: [FEATURE_NAME]
> User requirements: [PASTE ALL ANSWERS]
>
> Produce a structured markdown report with:
>
> 1. Files that need modification (with reason)
> 2. New files to create
> 3. DB schema changes required (Drizzle syntax)
> 4. Technical risks or blockers
> 5. Recommended implementation order

Save agent output to both output paths as `analysis.md`. Mark `analysis` as `completed`. Set `current_step` to `functional_doc`. Write state.

---

## Phase 2 — Functional Document

Mark `functional_doc` as `in_progress`. Write state.

Spawn a sub-agent to write the FRD:

**Agent prompt**:

> You are a product manager writing a Functional Requirements Document for the 'tre' family tree app.
> Feature: [FEATURE_NAME]
> Analysis: [PASTE CONTENTS OF analysis.md]
>
> Write a FRD with these sections:
>
> 1. Overview — what this feature does and why
> 2. User stories — in Given/When/Then format, one per scenario
> 3. Acceptance criteria — numbered, testable, unambiguous
> 4. Technical approach — brief summary of implementation strategy
> 5. Out of scope — explicit list of what this iteration does NOT cover
>
> Be precise and implementation-ready. No vague language.

Save as `functional_doc.md` to both output paths. Mark `functional_doc` as `completed`. Set `current_step` to `test_planning`. Write state.

---

## Phase 3 — Test Planning

Mark `test_planning` as `in_progress`. Write state.

Spawn a sub-agent to write the test plan:

**Agent prompt**:

> You are a QA engineer writing a test plan for the 'tre' family tree app.
> Feature: [FEATURE_NAME]
> FRD: [PASTE CONTENTS OF functional_doc.md]
>
> Write a test plan with:
>
> 1. Unit test cases — function-level, with inputs and expected outputs
> 2. Integration test cases — across layers (action → DB, component → action)
> 3. Edge cases and failure scenarios — what can go wrong
> 4. Manual QA checklist — formatted as markdown checkboxes
>
> Map each test case back to an acceptance criterion from the FRD.

Save as `test_plan.md` to both output paths. Mark `test_planning` as `completed`. Set `current_step` to `awaiting_confirmation`. Write state.

---

## Phase 4 — Awaiting Confirmation

Mark `awaiting_confirmation` as `in_progress`. Write state.

Present a consolidated summary to the user:

```
Feature: <name>

ANALYSIS    → .claude/features/<slug>/analysis.md
  Key changes: [2–3 bullet summary from analysis]

FUNCTIONAL DOC → .claude/features/<slug>/functional_doc.md
  Acceptance criteria: [numbered list]

TEST PLAN   → .claude/features/<slug>/test_plan.md
  [X] unit tests, [Y] integration tests, [Z] edge cases

All documents also saved to Obsidian.

Confirm to proceed to implementation, or provide feedback to revise.
```

- If user provides feedback: identify which document needs revision, respawn the relevant sub-agent with the feedback, overwrite the file, repeat summary.
- If user confirms: mark `awaiting_confirmation` as `completed`, set `current_step` to `implementation`. Write state. Tell the user: "Starting implementation."

---

## Phase 5 — Implementation

Mark `implementation` as `in_progress`. Write state.

Use TaskCreate to break implementation into discrete tasks following the FRD's acceptance criteria and the analysis's recommended order. Work through them one by one, marking each completed.

When all tasks are done, mark `implementation` as `completed`. Set `current_step` to `review`. Write state.

---

## Phase 6 — Review

Mark `review` as `in_progress`. Write state.

Spawn a sub-agent to review the implementation:

**Agent prompt**:

> You are a senior engineer doing a post-implementation review for the 'tre' family tree app.
> Feature: [FEATURE_NAME]
> FRD acceptance criteria: [PASTE FROM functional_doc.md]
> Test plan: [PASTE FROM test_plan.md]
>
> Review the current code changes (use git diff against main). Check:
>
> 1. Does the implementation satisfy each acceptance criterion? (✅ / ⚠️ / ❌)
> 2. Are there bugs or missing edge cases from the test plan?
> 3. Are there security concerns (unprotected routes, missing requireUser, injection risks)?
> 4. Is the code consistent with project conventions (server actions pattern, Drizzle queries, Better Auth session)?
>
> Return a structured review. Be direct — flag real issues, don't pad.

Save as `review.md` to both output paths. Mark `review` as `completed`. Set overall `status` to `completed`. Write state.

Present the review to the user. If there are ❌ items, set `current_step` back to `implementation` and `status` back to `in_progress` for those items. Write state and continue.
