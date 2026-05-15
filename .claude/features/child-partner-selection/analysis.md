# Codebase Impact Analysis: Child-Partner Selection

## Files That Need Modification

### A. `components/tree/AddPersonSidebar.tsx` (CORE CHANGE)

- Add `originPersonId` prop
- Add `relationshipType` state
- Add `selectedUnionId` state
- Fetch origin person's unions when `relationshipType === 'child'`
- Render partner selector conditionally
- Modify form submission to pass `unionId` to new server action

### B. `components/tree/TreeCanvas.tsx`

- Pass `originPersonId` when rendering AddPersonSidebar
- Convert `showAddPerson` boolean to object or add separate state for origin context

### C. `server/relationships.ts` (NEW SERVER ACTION)

Add `addRelativeToUnion(treeId, anchorPersonId, unionId, personData, anchorPosition)`:

- For `child` type: use provided `unionId` instead of creating a new union
- Insert `parentage` record linking child to chosen union

### D. `server/persons.ts` (NEW HELPER)

Add `getPersonUnions(treeId, personId)`:

- Returns all unions where person is person1 or person2
- Includes partner info (with: { person1, person2 })

## New Files to Create

None.

## DB Schema Changes

None required. `unions` and `parentage` tables fully support this feature.

## Technical Risks

1. **TreeCanvas state complexity**: `showAddPerson` boolean needs origin context. Recommendation: Convert to `{ open: boolean; originPersonId?: string }`.
2. **Client-side union fetching**: AddPersonSidebar (client component) fetches via `useEffect`. Needs loading state.
3. **Empty state**: Origin person with 0 unions → show informative message, hide partner selector.
4. **Auto-selection**: If only 1 union, preselect it silently.

## Recommended Implementation Order

1. Add `getPersonUnions()` in `server/persons.ts`
2. Add `addRelativeToUnion()` in `server/relationships.ts`
3. Update `AddPersonSidebar.tsx` (UI + logic)
4. Update `TreeCanvas.tsx` (pass origin context)
