# Security Specification for CuteQR

## Data Invariants
- `QRMapping` documents in `/qr_mappings/{qrId}`:
  - `qrId` must match the `id` field in the document.
  - `id` must be a string of length 4-20, alphanumeric.
  - `destinationUrl` must be a string, valid URL (start with http/https), max 2048 chars.
  - `createdAt` must be the server timestamp.
  - Documents are immutable once created (no updates, no deletes allowed for now).

## The Dirty Dozen Payloads
1. **Bad ID**: `{ "id": "!!!", "destinationUrl": "https://google.com", "createdAt": "2026-05-19T00:00:00Z" }` (Invalid alphanumeric)
2. **Missing Field**: `{ "id": "abc123", "createdAt": "2026-05-19T00:00:00Z" }` (Missing destinationUrl)
3. **Long URL**: `{ "id": "abc123", "destinationUrl": "https://..." + "a".repeat(3000), "createdAt": "2026-05-19T00:00:00Z" }` (Too long)
4. **Client Timestamp**: `{ "id": "abc123", "destinationUrl": "https://google.com", "createdAt": "2026-01-01T00:00:00Z" }` (Must be request.time)
5. **Update Attempt**: Any update to an existing mapping.
6. **Delete Attempt**: Any delete of an existing mapping.
7. **Short ID**: `{ "id": "a", "destinationUrl": "https://google.com", "createdAt": "2026-05-19T00:00:00Z" }` (Too short)
8. **Wrong Type**: `{ "id": 12345, "destinationUrl": "https://google.com", "createdAt": "2026-05-19T00:00:00Z" }` (id not string)
9. **No HTTP**: `{ "id": "abc1234", "destinationUrl": "google.com", "createdAt": "2026-05-19T00:00:00Z" }` (Missing protocol)
10. **Shadow Field**: `{ "id": "abc1234", "destinationUrl": "https://google.com", "createdAt": "2026-05-19T00:00:00Z", "extra": "hacker" }` (Size mismatch)
11. **Spoofed ID**: Document at `/qr_mappings/mapping1` has `id: "mapping2"`.
12. **Unauthorized Read (Blanket)**: Attempting to list all mappings (should be allowed only for individual GET if we want to be very secure, but listing might be okay if we have a gallery? User didn't ask for it, so let's restrict to ID-based GET).

## Test Runner (firestore.rules.test.ts)
```typescript
// Skeleton for testing (usually run via firebase emulators)
// This confirms the logic we want to implement in rules.
```
