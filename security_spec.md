# Security Specification - Suki Yusuki Dashboard

## 1. Data Invariants
- `menu_items`: Customers can read any menu item. Only authenticated administrator `valentinoarya900@gmail.com` (verified) can write (create, update, delete) menu items.
- `settings`: Settings (e.g. custom logo, banner, custom address) can be read by anyone. Only authenticated administrator `valentinoarya900@gmail.com` (verified) can write/update settings.
- All IDs must be strictly validated.
- Created and updated timestamps must use server relative timing.

## 2. The Dirty Dozen Payloads
- **P-01**: Anonymous user attempts to write to `/menu_items/new-item`. Excluded by Auth check.
- **P-02**: Unauthorized signed-in user (attacker@gmail.com) attempts to write to `/menu_items/new-item`. Excluded by admin email validation.
- **P-03**: Administrator updates `/menu_items/item1` but sets `price` to a negative value. Blocked by static bounds checking.
- **P-04**: Administrator attempts to exceed string constraints (e.g., description > 1000 characters). Blocked by size checks.
- **P-05**: Administrator attempts to spoof `createdAt` or set a client-side fake timestamp. Blocked by temporal integrity validation.
- **P-06**: Administrator tries to update a `menu_item` with invalid ID scheme. Blocked by `isValidId()` pattern.
- **P-07**: Spoofed unverified email `valentinoarya900@gmail.com` attempts write. Blocked by `email_verified == true`.
- **P-08**: Unauthorized write to global `settings/app` with random configuration fields. Filtered by strict field validation rules.
- **P-09**: Attempt to modify IMMUTABLE `id` within a menu item document during update. Blocked by immutable constraints.
- **P-10**: Massive 1MB string injected into document ID parameter during target operation. Blocked by size checks.
- **P-11**: Unauthorized deletion of app-wide settings by generic user. Rejected by permission blocks.
- **P-12**: Shadow update adding a "ghost field" `isAdmin: true` to a system or menu item. Blocked by `affectedKeys().hasOnly()` gates.

## 3. Test Cases (Summary)
All conditions must be strictly caught returning `PERMISSION_DENIED` on any of these rule breaking attempts.
