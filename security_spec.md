# Firestore Security Specification — MessMind Venture Studio

## 1. Data Invariants

1. **Default-Deny Catch-All**: Every unspecified Firestore path is strictly denied (`allow read, write: if false`).
2. **Owner-Only PII Isolation (`/users/{userId}`)**: A user profile document containing `email` and `displayName` may only be read (`get`) or written by the authenticated, email-verified user whose `request.auth.uid == userId`. Collection `list` queries are disabled (`allow list: if false`).
3. **Master Gate on Subcollection (`/users/{userId}/studio/{studioDocId}`)**: Access to any `/studio/{studioDocId}` document requires `isOwner(userId)`, `isVerifiedUser()`, `isValidId(studioDocId)`, and `exists(/databases/$(database)/documents/users/$(userId))` (for reads/creates/updates).
4. **Immutable Ownership & Creation Timestamps**: `uid` (on `UserAccount`), `ownerId` (on `VentureStudioWorkspace`), and `createdAt` cannot be modified after creation. `createdAt == request.time` on `create` and `updatedAt == request.time` on both `create` and `update`.
5. **Bounded Payload & Strict Key Whitelisting**: All strings enforce `.size()` bounds, `ventures` is strictly a `list` with `size() <= 10`, and both `create` (`hasAll` + `hasOnly`) and `update` (`affectedKeys().hasOnly(...)`) reject any shadow/ghost fields.

## 2. Dirty Dozen Attack Payloads (Expected: `PERMISSION_DENIED`)

1. **Unauthenticated read on `/users/{uid}`**: `auth = null`, `get('/users/u1')` -> `PERMISSION_DENIED`.
2. **Cross-user PII read on `/users/{otherUid}`**: `auth.uid = 'u2'`, `get('/users/u1')` -> `PERMISSION_DENIED`.
3. **Unverified email write on `/users/{uid}`**: `auth.uid = 'u1'`, `auth.token.email_verified = false`, `set('/users/u1', ...)` -> `PERMISSION_DENIED`.
4. **Collection scraping (`list`) on `/users`**: `auth.uid = 'u1'`, `list('/users')` -> `PERMISSION_DENIED`.
5. **Identity spoofing on `/users/{uid}` create**: `auth.uid = 'u1'`, payload `{ uid: 'u2', ... }` -> `PERMISSION_DENIED`.
6. **Shadow/Ghost field injection on `/users/{uid}`**: `auth.uid = 'u1'`, payload includes `isAdmin: true` -> `PERMISSION_DENIED`.
7. **ID poisoning (`>128` chars or invalid characters) on `/users/{uid}/studio/{badId}`**: `studioDocId = 'bad/id$123'` -> `PERMISSION_DENIED`.
8. **Orphaned subcollection write without parent `/users/{uid}`**: `/users/u1` does not exist, `set('/users/u1/studio/workspace', ...)` -> `PERMISSION_DENIED`.
9. **OwnerId spoofing on `/users/{uid}/studio/workspace`**: `auth.uid = 'u1'`, payload `{ ownerId: 'u2', ... }` -> `PERMISSION_DENIED`.
10. **Client-forged timestamp on create/update**: `createdAt != request.time` or `updatedAt != request.time` -> `PERMISSION_DENIED`.
11. **Array flooding on `ventures`**: `ventures` list with 11 items (`size() > 10`) -> `PERMISSION_DENIED`.
12. **Invalid `activeView` enum or oversized `selectedVentureId`**: `activeView = 'admin-panel'` or `selectedVentureId` > 128 chars -> `PERMISSION_DENIED`.
