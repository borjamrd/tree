# Functional Requirements Document: Child-Partner Selection

**Feature:** Child-Partner Selection when Adding a Child
**App:** tre — Family Tree Builder
**Date:** 2026-05-15
**Status:** Draft

---

## 1. Overview

When a user adds a child to a person on the tree canvas, the app currently has no mechanism to associate that child with an existing union (couple relationship). Instead, it always creates a new union, which produces duplicate union nodes and an incorrect graph structure when the anchor person already has one or more partners.

This feature introduces a partner selection step in the Add Person sidebar flow. When the user selects "Child" as the relationship type, the sidebar fetches the anchor person's existing unions and presents a selector. The user can choose an existing union (i.e., the child's other parent) or explicitly indicate that there is no other parent (single-parent union). The resulting `parentage` record is linked to the correct union, preserving graph integrity.

---

## 2. User Stories

**Story 1 — Anchor person has one existing union**

Given I am viewing a tree canvas and the anchor person has exactly one existing union,
When I open the Add Person sidebar for that person and select "Child" as the relationship type,
Then the sidebar silently pre-selects the single union and displays the name of the partner, with no manual selection required from me.

---

**Story 2 — Anchor person has multiple existing unions**

Given I am viewing a tree canvas and the anchor person has two or more existing unions,
When I open the Add Person sidebar for that person and select "Child" as the relationship type,
Then a partner selector is rendered listing all unions, each identified by the partner's name (or "Unknown partner" if `person2Id` is null), and I must select one before I can submit the form.

---

**Story 3 — Anchor person has no existing unions**

Given I am viewing a tree canvas and the anchor person has no existing unions,
When I open the Add Person sidebar for that person and select "Child" as the relationship type,
Then the sidebar displays an informational message indicating that no partner exists yet, and the form proceeds with a new single-parent union created on submission.

---

**Story 4 — User opts for no other parent explicitly**

Given I am viewing a tree canvas and the anchor person has one or more existing unions,
When I open the Add Person sidebar and select "Child" as the relationship type,
Then a "No other parent" option is available in the partner selector, and selecting it causes the form to create a new single-parent union on submission.

---

**Story 5 — Successful child submission with existing union**

Given I have selected an existing union in the partner selector and filled in the child's required fields,
When I submit the Add Person form,
Then a new person record is created, a `parentage` record linking that person to the selected union is inserted, no new union node is created, and the child node appears on the canvas connected to the existing union node.

---

**Story 6 — Successful child submission with new single-parent union**

Given I have selected "No other parent" or the anchor person had no unions,
When I submit the Add Person form,
Then a new person record is created, a new union is created with `person2Id = null`, a `parentage` record linking the child to that new union is inserted, and both the union node and child node appear on the canvas.

---

**Story 7 — Non-child relationship type unaffected**

Given I open the Add Person sidebar for any anchor person,
When I select a relationship type other than "Child",
Then no partner selector is rendered and the form behaves identically to the current implementation.

---

## 3. Acceptance Criteria

**Sidebar behavior**

1. The `AddPersonSidebar` component accepts an `originPersonId` prop of type `string | undefined`.
2. When `relationshipType` is set to `"child"` and `originPersonId` is defined, the sidebar issues a request to `getPersonUnions(treeId, originPersonId)` and enters a loading state until the response resolves.
3. While unions are loading, the submit button is disabled and a loading indicator is visible in the partner selector area.
4. If the fetch returns zero unions, no selector is rendered; instead a static message reads "This person has no existing partners. A single-parent family will be created."
5. If the fetch returns exactly one union, the selector is not rendered; the union is pre-selected silently; the partner's name is displayed as read-only text below the relationship type field.
6. If the fetch returns two or more unions, a select/dropdown control is rendered listing each union. Each option label is the full name of the partner, or "Unknown partner" if the partner record has no name. A final option labeled "No other parent" is always appended.
7. The submit button remains disabled until a union is explicitly selected (in the multiple-union case).
8. Selecting "No other parent" from the dropdown is a valid selection that enables form submission.
9. When `relationshipType` changes away from `"child"`, the `selectedUnionId` state resets to `undefined` and the partner selector unmounts.

**Server action — `getPersonUnions`**

10. `getPersonUnions(treeId, personId)` returns all union records where `person1Id = personId` OR `person2Id = personId`, scoped to `treeId`.
11. Each returned union includes the joined person record for both `person1` and `person2` (nullable).
12. `getPersonUnions` calls `requireUser()` and returns `{ success: false, error: "Unauthorized" }` if no session exists.

**Server action — `addRelativeToUnion`**

13. `addRelativeToUnion(treeId, anchorPersonId, unionId | null, personData, anchorPosition)` is the submission target for child additions.
14. When `unionId` is a valid existing union ID, no new union is created; only a `parentage` record is inserted linking the new person to that union.
15. When `unionId` is `null` (no other parent path), a new union is created with `anchorPersonId` as `person1Id` and `person2Id = null`, then a `parentage` record is inserted.
16. The action returns `{ success: false, error: string }` if `unionId` is provided but does not belong to `treeId`.
17. The action calls `revalidatePath` on the tree route after all inserts complete.
18. On success the action returns `{ success: true; data: { personId, unionId } }`.

**Canvas state**

19. `TreeCanvas` replaces the `showAddPerson: boolean` state with `addPersonContext: { open: boolean; originPersonId?: string }`.
20. Every existing call site that sets `showAddPerson = true` is updated to set `addPersonContext = { open: true, originPersonId: <id of anchor node> }`.
21. `AddPersonSidebar` receives `originPersonId` from `addPersonContext.originPersonId`.

**Optimistic UI**

22. On form submission, the canvas applies an optimistic update adding the child node and an edge from union to child before the server response arrives.
23. If the server action returns `{ success: false }`, the optimistic update is rolled back and an error toast is displayed.

**Regression**

24. Adding a Parent, Sibling, or Partner via the sidebar produces identical behavior to the current implementation.
25. The single existing test path for `addRelative` (non-child types) continues to pass without modification.

---

## 4. Technical Approach

- **TreeCanvas state**: `showAddPerson: boolean` → `addPersonContext: { open: boolean; originPersonId?: string }`.
- **New server helper**: `getPersonUnions` in `server/persons.ts` — single Drizzle query with `or()` condition, joins both person sides.
- **New server action**: `addRelativeToUnion` in `server/relationships.ts` — branches on `unionId` presence; uses DB transaction.
- **Client fetch**: `useEffect` in sidebar triggers `getPersonUnions` when `relationshipType === 'child'`. Auto-selects if single result.
- **Form submission**: calls `addRelativeToUnion` (child path) or existing `addRelative` (all other types).

No schema migrations required.

---

## 5. Out of Scope

- Creating a new partner inline from this flow
- Editing existing union partners
- Sibling, Parent, and Partner relationship type changes
- Batch child addition
- Undo/redo beyond optimistic rollback
- Dedicated accessibility audit of the new selector
