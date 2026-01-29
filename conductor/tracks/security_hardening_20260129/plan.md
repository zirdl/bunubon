# Implementation Plan: Security Hardening & Robust Authentication

## Phase 1: Session Management & Auth Transition
- [x] Task: Install session management and security dependencies a086783
    - [ ] Run `npm install express-session connect-sqlite3 helmet express-rate-limit express-validator` in `backend/`
- [ ] Task: Transition Backend to Session-based Authentication
    - [ ] Configure `express-session` with `connect-sqlite3` for persistence
    - [ ] Update `login` route to initialize server-side session
    - [ ] Create `logout` route to destroy session and clear cookies
    - [ ] Replace `authenticateToken` middleware with `authenticateSession`
- [ ] Task: Update Frontend for Cookie-based Auth
    - [ ] Remove manual JWT token handling from `apiFetch` and `localStorage`
    - [ ] Update `App.tsx` login handler to rely on session state
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Session Management' (Protocol in workflow.md)

## Phase 2: Security Hardening (Middleware)
- [ ] Task: Implement Global Security Headers
    - [ ] Integrate `helmet` with custom CSP if necessary
- [ ] Task: Implement Rate Limiting
    - [ ] Apply strict limits to `/api/login`
    - [ ] Apply general limits to all `/api` routes
- [ ] Task: Implement Robust Error Handling
    - [ ] Create a global error middleware to sanitize error responses
    - [ ] Replace raw `res.status(500).json({ error: err.message })` with sanitized messages
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Security Hardening' (Protocol in workflow.md)

## Phase 3: Input Validation & RBAC Enforcement
- [ ] Task: Implement Request Validation
    - [ ] Define validation schemas using `express-validator` for User routes
    - [ ] Define validation schemas for Title and Municipality routes
- [ ] Task: Strict RBAC Audit
    - [ ] Ensure all DELETE and POST/PUT (User) routes are restricted to 'Admin'
    - [ ] Ensure 'Encoder' can only access Title/Municipality write operations
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Input Validation' (Protocol in workflow.md)

## Phase 4: Final Security Audit & Cleanup
- [ ] Task: Remove Legacy JWT Logic
    - [ ] Audit `server.js` and frontend for any remaining JWT code
- [ ] Task: Environment Variable Enforcement
    - [ ] Ensure `SESSION_SECRET` is added to `.env`
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Audit' (Protocol in workflow.md)
