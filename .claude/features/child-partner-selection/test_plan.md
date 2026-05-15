# Test Plan: Child-Partner Selection when Adding a Child

## 1. Unit Test Cases

### 1.1 `getPersonUnions` (AC #2, #10, #11)

| ID   | Description                                    | Input                                                           | Expected Output                                        |
| ---- | ---------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------ |
| U-01 | Returns unions where person is person1         | `personId = "p1"`, union `{ person1Id: "p1", person2Id: "p2" }` | `{ success: true, data: [union with joined persons] }` |
| U-02 | Returns unions where person is person2         | `personId = "p2"`, same union                                   | Union returned via person2Id match                     |
| U-03 | Joins partner persons on both sides            | Union with person1 and person2                                  | `person1.firstName` and `person2.firstName` populated  |
| U-04 | Empty when person has no unions                | `personId = "p-no-unions"`                                      | `{ success: true, data: [] }`                          |
| U-05 | Returns single-parent union (person2Id = null) | Union `{ person1Id: "p1", person2Id: null }`                    | Union returned, `person2: null`                        |
| U-06 | Unauthorized — no session                      | `requireUser()` throws                                          | `{ success: false, error: "Unauthorized" }`            |
| U-07 | Scoped to treeId                               | Person appears in union of another tree                         | Only unions with matching `treeId` returned            |

### 1.2 `addRelativeToUnion` (AC #12–#16)

| ID   | Description                              | Input                         | Expected Output                                                                 |
| ---- | ---------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------- |
| U-08 | Existing unionId → parentage only        | valid `unionId`               | 0 new unions, 1 new parentage, `{ success: true, data: { personId, unionId } }` |
| U-09 | `unionId = null` → new union + parentage | `unionId: null`               | 1 new union (`person2Id=null`), 1 new parentage                                 |
| U-10 | Cross-tree unionId → error               | `unionId` from different tree | `{ success: false, error }`, no rows inserted                                   |
| U-11 | Unauthorized                             | No session                    | `{ success: false, error: "Unauthorized" }`                                     |
| U-12 | Calls `revalidatePath`                   | Valid inputs                  | `revalidatePath` called once after inserts                                      |
| U-13 | Returns correct data shape               | Valid inputs                  | `{ success: true, data: { personId: uuid, unionId: uuid } }`                    |
| U-14 | Invalid personData                       | `firstName = ""`              | `{ success: false, error: <validation> }`                                       |

### 1.3 `AddPersonSidebar` component (AC #1–#9)

| ID   | Description                                                 | Expected                           |
| ---- | ----------------------------------------------------------- | ---------------------------------- |
| U-15 | Accepts `originPersonId` prop                               | No TS error; mounts correctly      |
| U-16 | Fetches unions on child type select                         | `getPersonUnions` called on effect |
| U-17 | Loading indicator while fetching                            | Spinner visible, submit disabled   |
| U-18 | Submit disabled during fetch                                | `disabled=true` on submit button   |
| U-19 | 0 unions → no selector, static message                      | No `<select>`; message visible     |
| U-20 | 1 union → no selector, read-only name, auto-selected        | Partner name shown as text         |
| U-21 | 2+ unions → dropdown with partner names + "No other parent" | `<select>` with N+1 options        |
| U-22 | `person2Id=null` → "Unknown partner" label                  | AC #6 option shows fallback text   |
| U-23 | Submit disabled until selection (2+ unions)                 | `disabled=true` before selection   |
| U-24 | "No other parent" enables submit                            | `disabled=false` after selection   |
| U-25 | Any partner selection enables submit                        | `disabled=false`                   |
| U-26 | Switch from "child" resets selectedUnionId                  | State resets, selector unmounts    |
| U-27 | Switch back to "child" refetches                            | `getPersonUnions` called again     |
| U-28 | Non-child types render no selector                          | No union fetch, no UI element      |

### 1.4 TreeCanvas state (AC #17–#19)

| ID   | Description                          | Expected                                      |
| ---- | ------------------------------------ | --------------------------------------------- |
| U-29 | `addPersonContext` shape             | `{ open: boolean; originPersonId?: string }`  |
| U-30 | All call sites pass `originPersonId` | Clicked person's id passed in each trigger    |
| U-31 | Sidebar receives `originPersonId`    | Prop equals `addPersonContext.originPersonId` |

### 1.5 Optimistic updates (AC #20–#21)

| ID   | Description                                       | Expected                                |
| ---- | ------------------------------------------------- | --------------------------------------- |
| U-32 | Optimistic node+edge added before server responds | Visible in canvas immediately on submit |
| U-33 | Server error → rollback optimistic update         | Node and edge removed                   |
| U-34 | Server error → error toast                        | `toast.error()` called                  |

---

## 2. Integration Test Cases

### Component → Action (AC #2, #12, #13, #16)

| ID   | Description                             | Expected DB state                                    |
| ---- | --------------------------------------- | ---------------------------------------------------- |
| I-01 | Child + existing union → parentage only | +1 person, +0 unions, +1 parentage to existing union |
| I-02 | Child + "No other parent"               | +1 person, +1 union (person2Id=null), +1 parentage   |
| I-03 | Child + 0 unions                        | +1 person, +1 union (person2Id=null), +1 parentage   |
| I-04 | Success → toast + canvas node           | Toast shown, node visible, sidebar closes            |
| I-05 | Server error → toast + sidebar open     | Error toast shown, sidebar remains open              |

### Action → DB (AC #10, #12, #13, #14, #15)

| ID   | Description                                       | Expected                                              |
| ---- | ------------------------------------------------- | ----------------------------------------------------- |
| I-06 | `getPersonUnions` both directions                 | Returns unions as person1 AND person2                 |
| I-07 | Joins partner persons                             | `person1.firstName` and `person2.firstName` in result |
| I-08 | Existing unionId → only parentage inserted        | Union count unchanged                                 |
| I-09 | null unionId → union created                      | New union with `person2Id=null`                       |
| I-10 | Cross-tree union rejected                         | `{ success: false }`, 0 rows                          |
| I-11 | `revalidatePath` → canvas updates without refresh | New person visible after navigation                   |

---

## 3. Edge Cases and Failure Scenarios

| ID   | Scenario                                                        | AC  | Risk                                                                    |
| ---- | --------------------------------------------------------------- | --- | ----------------------------------------------------------------------- |
| E-01 | `person2Id = null` in union — null dereference on name          | #6  | Could throw when building option label                                  |
| E-02 | Person is person1 in one union, person2 in another              | #10 | Missing OR clause would lose one union                                  |
| E-03 | Two unions with identical partner names                         | #6  | User cannot distinguish; no ID shown                                    |
| E-04 | Network error during `getPersonUnions`                          | #3  | Loading state not cleaned up; submit stays disabled                     |
| E-05 | `originPersonId` changes while sidebar is open                  | #9  | Stale union list; missing useEffect dependency                          |
| E-06 | Rapid relationship-type toggling                                | #9  | Race condition: slow fetch resolves after type switched                 |
| E-07 | Union from same tree but not involving `originPersonId`         | #14 | Child linked to unrelated union                                         |
| E-08 | Duplicate parentage insert                                      | #12 | DB constraint throws; action must catch and return `{ success: false }` |
| E-09 | Optimistic personId differs from server personId                | #20 | Ghost node remains if id not replaced on response                       |
| E-10 | Session expires between page load and submit                    | #11 | `requireUser()` throws; must surface as toast, not crash                |
| E-11 | `originPersonId` is `undefined` when `relationshipType="child"` | #18 | `getPersonUnions(undefined)` called; bad data returned                  |
| E-12 | Single union with `person2Id = null` in read-only case          | #5  | Must show "Unknown partner" text, not crash                             |

---

## 4. Manual QA Checklist

### Setup

- [ ] Create a test tree with at least one person ("Anchor Person")
- [ ] Have a second browser session as a different user for auth tests

### Loading state (AC #2, #3)

- [ ] Select relationship type "child" in sidebar — loading indicator appears
- [ ] Submit button is disabled while loading

### Zero unions (AC #4)

- [ ] Open sidebar as child for a person with no unions
- [ ] No dropdown rendered; message about single-parent family visible
- [ ] Submit creates a single-parent union

### One union (AC #5)

- [ ] Open sidebar as child for a person with exactly one union
- [ ] No dropdown; partner's full name shown as read-only text
- [ ] Submit links child to existing union (no new union created)

### Two+ unions (AC #6, #7, #8)

- [ ] Open sidebar as child for person with 2+ unions
- [ ] Dropdown shows all partners by name + "No other parent"
- [ ] "Unknown partner" shown for nameless partner
- [ ] Submit disabled with no selection
- [ ] Submit enabled after any selection (including "No other parent")
- [ ] "No other parent" → creates new single-parent union

### State reset (AC #9)

- [ ] Switch from "child" to "partner" — dropdown disappears, state resets
- [ ] Switch back to "child" — fresh data loaded, no stale selection

### Both union directions (AC #10)

- [ ] Person A is person1 in U1, person2 in U2
- [ ] Both unions appear in child dropdown for person A

### Unauthorized (AC #11)

- [ ] Sign out; attempt server action call — `{ success: false, error: "Unauthorized" }` returned

### DB correctness (AC #12, #13)

- [ ] Submit with existing union → DB: 0 new unions, 1 new parentage
- [ ] Submit with null union → DB: 1 new union (person2Id=null), 1 new parentage

### Cross-tree rejection (AC #14)

- [ ] Submit with unionId from different tree → `{ success: false }`, 0 rows inserted

### Cache invalidation (AC #15)

- [ ] Submit successfully; navigate away and back — new person visible without hard reload

### Response shape (AC #16)

- [ ] Confirm `{ success: true, data: { personId, unionId } }` in network response

### Canvas context (AC #17, #18, #19)

- [ ] React DevTools: `addPersonContext.originPersonId` equals clicked person's id
- [ ] `AddPersonSidebar` receives correct `originPersonId` prop

### Optimistic update (AC #20, #21)

- [ ] Throttle to Slow 3G; submit → node appears before server responds
- [ ] Mock server error → node removed; error toast shown

### Regression (AC #22, #23)

- [ ] Add partner and parent via sidebar — no union selector appears, behavior unchanged
- [ ] All existing `addRelative` tests pass
