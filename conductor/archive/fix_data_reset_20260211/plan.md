# Plan: Fix Intermittent Data Reset and Dashboard Instability

## Phase 1: Investigation & Diagnostic Logging
- [x] Task: Audit `backend/server.js` and `backend/scripts/` for any automatic reset triggers.
    - [x] Check for code that might be calling `reset_db.js` or `seed_data.js` programmatically.
    - [x] Inspect session handling in `server.js` for potential database locks or corruption.
- [x] Task: Add diagnostic logging to `backend/scripts/setup.js` and `backend/seed_data.js`.
    - [x] Log when these scripts are executed and by what process (if possible).
- [x] Task: Conductor - User Manual Verification 'Investigation & Diagnostic Logging' (Protocol in workflow.md)

## Phase 2: Secure Database & Authentication State
- [x] Task: Standardize Admin Initialization.
    - [x] Ensure `setup.js`, `reset_db.js`, and `seed_data.js` use the exact same Bcrypt hashing and role/status capitalization.
    - [x] Refactor common admin creation logic into a shared utility if appropriate.
- [x] Task: Implement a "Safe Boot" check in `server.js`.
    - [x] Add a check on startup to ensure the `admin` user exists with a Bcrypt hash without wiping other data.
- [x] Task: Write TDD tests to verify `admin` hash integrity.
    - [x] Create `backend/auth_integrity.test.js` to verify the `admin` password remains a valid Bcrypt hash after simulated "idle" time or script execution.
- [x] Task: Conductor - User Manual Verification 'Secure Database & Authentication State' (Protocol in workflow.md)

## Phase 3: Dashboard & Session Stability
- [x] Task: Investigate Frontend Chart Data Fetching.
    - [x] Check `Dashboard.tsx` and `api.ts` for error handling when the backend might be temporarily unavailable or resetting.
- [x] Task: Fix session store persistence.
    - [x] Ensure `connect-sqlite3` is not conflicting with the main `database.db` in a way that causes file locks/resets.
- [x] Task: Conductor - User Manual Verification 'Dashboard & Session Stability' (Protocol in workflow.md)
