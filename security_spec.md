# Security Specification: GenFlow

## 1. Data Invariants
1. **User Ownership Boundaries**: No user can read, list, create, update, or delete records in any collection or subcollection under a path belonging to another UID. Specifically, matching `/users/{uid}/` must reject any request where `request.auth.uid != uid`.
2. **Schema & Typings Integrity**:
   - Every **ProfileInfo** must have exactly four keys (`name`, `email`, `createdAt`, `theme`), with correct types (`name` is `string`, `email` is `string`, `createdAt` is a timestamp, `theme` is either `light` or `dark`).
   - Every **Area** must contain `name` (string length bounded), `emoji` (string size <= 8), `color` (string size <= 16), `weeklyGoal` (positive integer), and standard timestamps.
   - Every **Session** must map to a valid `areaId`, containing standard cached details of string and numbers, validating that `duration` matches `endTime - startTime` or is positive, and preventing future timestamps.
3. **Immutability of System Columns**: Fields like `createdAt` and `originalOwnerId` (if any) are permanently locked on write; `updatedAt` must always match `request.time` exactly.
4. **Verified Users**: All database operations require a verified Firebase account (`request.auth.token.email_verified == true`) to prevent spam or unverified registration.

---

## 2. The "Dirty Dozen" Payloads (Exploit Payloads)

### Payload 1: Profile Bypass (Privilege Escalation)
Attempting to create another user's profile with a spoofed identifier.
*   **Target Path**: `/users/attacker_uid/profile/info` logged in as `victim_uid`
*   **Result**: `PERMISSION_DENIED`

### Payload 2: Ghost Field Inject (Shadow Update)
Attempting to inject `isAdmin: true` into the profile metadata.
*   **Target Path**: `/users/{uid}/profile/info`
*   **Payload**: `{"name": "Scammer", "email": "scam@email.com", "createdAt": "request.time", "theme": "dark", "isAdmin": true}`
*   **Result**: `PERMISSION_DENIED` (Strict Key Enforcement checks `keys().size() == 4`)

### Payload 3: Area ID Poisoning (Resource Exhaustion)
Attempting to create an Area with a massive, malicious URL-encoded document ID to trigger key index memory fatigue.
*   **Target Path**: `/users/{uid}/areas/MALICIOUS_MASSIVE_ID_128_CHARACTERS`
*   **Result**: `PERMISSION_DENIED` (Path variable size restricted via `isValidId()`)

### Payload 4: Future-Dated Session (Temporal Tampering)
Inbound session claiming a focus date in the year 2099.
*   **Target Path**: `/users/{uid}/sessions/{sessionId}`
*   **Payload**: `{"areaId": "area1", "areaName": "Study", "areaColor": "#2563eb", "areaEmoji": "📚", "startTime": "request.time", "endTime": "2099-01-01T00:00:00Z", "duration": 140, "date": "2099-01-01"}`
*   **Result**: `PERMISSION_DENIED`

### Payload 5: Negative Duration (Self-Sabotage/State Pollution)
Attempting to save a completed session with `-50` focus minutes to exploit weekly counters.
*   **Target Path**: `/users/{uid}/sessions/{sessionId}`
*   **Payload**: `{"areaId": "area1", "areaName": "Study", "areaColor": "#2563eb", "areaEmoji": "📚", "startTime": "request.time", "endTime": "request.time", "duration": -50, "date": "2026-06-09"}`
*   **Result**: `PERMISSION_DENIED`

### Payload 6: Anonymous Write (Unverified Session Bypass)
Attempting to save focus sessions without verified account claims (`email_verified == false`).
*   **Target Path**: `/users/{uid}/sessions/s1`
*   **Result**: `PERMISSION_DENIED`

### Payload 7: Immortal Field Override (Time Travel)
Updating `createdAt` to pre-date registration so that a user profile seems older.
*   **Target Path**: `/users/{uid}/profile/info`
*   **Action**: `update`
*   **Payload**: `{"createdAt": "1999-12-31T23:59:59Z"}` (Differs from original immutable date)
*   **Result**: `PERMISSION_DENIED`

### Payload 8: Goal Cross-Contamination
Setting a weekly time goal for an `areaId` that belongs to another user.
*   **Target Path**: `/users/{uid}/goals/{goalId}`
*   **Payload**: `{"areaId": "victim_area_id", "weeklyTarget": 120, "updatedAt": "request.time"}`
*   **Result**: `PERMISSION_DENIED`

### Payload 9: Area Emoji Overflow (Denial of Wallet UI)
Saving an area with an incredibly heavy base64 string or 1000 emoji characters as the Area Emoji.
*   **Target Path**: `/users/{uid}/areas/{areaId}`
*   **Payload**: `{"name": "Study", "emoji": "📚📚📚📚[1000 emojis]", "color": "#2563eb", "weeklyGoal": 120, "createdAt": "request.time"}`
*   **Result**: `PERMISSION_DENIED` (`emoji.size() <= 8`)

### Payload 10: Client Blanket Collection Read
Fetching all users' profiles in a multi-tenant environment.
*   **Target Path**: `/users` (Collection Query)
*   **Result**: `PERMISSION_DENIED` (Directly blocked, list rules check `resource.data.userId == request.auth.uid` or matches `{uid}` paths)

### Payload 11: Empty Goal Target (State Pollution)
Goal created with 0 or negative weekly hour limits.
*   **Target Path**: `/users/{uid}/areas/area1`
*   **Payload**: `{"name": "Programming", "emoji": "💻", "color": "#2563eb", "weeklyGoal": -10, "createdAt": "request.time"}`
*   **Result**: `PERMISSION_DENIED` (`weeklyGoal >= 0`)

### Payload 12: Orphaned Session Logging (Referential Breach)
Saving focus log when the referenced focus area ID does not exist in the collection.
*   **Target Path**: `/users/{uid}/sessions/{sessionId}`
*   **Action**: Create with non-existent `areaId`
*   **Result**: `PERMISSION_DENIED` (Verified using `exists()` link)

---

## 3. The Test Runner Spec (`firestore.rules.test.ts`)
The tests are formulated against the `firestore.rules` mock simulator environment ensuring:
```ts
// Pseudocode test validation setup
describe("GenFlow Zero Trust Rules", () => {
   it("blocks unauthorized user subcollection writes (Payload 1)", async () => { ... });
   ...
});
```
