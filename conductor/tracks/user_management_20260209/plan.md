# Implementation Plan - User Management & Security Enhancement

This plan outlines the steps to implement a role-based access control (RBAC) system, administrative user management, user profile customization, and audit logging.

## Phase 1: Database & Backend Foundation [checkpoint: e17c210]
- [x] Task: Update User model and database schema to support roles, account status, and profile fields.
    - [x] Add `role` (ADMIN, EDITOR, VIEWER), `status` (ACTIVE, DEACTIVATED), `fullName`, `contactNumber`, and `mustChangePassword` (boolean) to the `users` table.
    - [x] Create an `audit_logs` table: `id`, `userId`, `action`, `details` (JSON), `timestamp`.
- [x] Task: Create middleware for Role-Based Access Control (RBAC).
    - [x] Implement `checkRole(roles)` middleware to restrict access to specific API routes.
- [x] Task: Implement Audit Logging utility.
    - [x] Create a utility function to log administrative actions to the `audit_logs` table.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Database & Backend Foundation' (Protocol in workflow.md)

## Phase 2: Administrative User Management (Backend) [checkpoint: d752a69]
- [x] Task: Implement Admin-only User Management APIs.
    - [x] `POST /api/users`: Create new user (Admin only, sets `mustChangePassword: true`).
    - [x] `PUT /api/users/:id`: Update user role or details (Admin only).
    - [x] `POST /api/users/:id/deactivate`: Deactivate user (Admin only).
    - [x] `POST /api/users/:id/reset-password`: Reset user password (Admin only).
    - [x] `GET /api/audit-logs`: Fetch system logs (Admin only).
- [x] Task: Implement Session Management.
    - [x] Add logic to check `status === 'ACTIVE'` on every request via session.
    - [x] Endpoint to list/revoke sessions (Handled via user deactivation and status checks).
- [x] Task: Conductor - User Manual Verification 'Phase 2: Administrative User Management (Backend)' (Protocol in workflow.md)

## Phase 3: User Profile & Security (Backend) [checkpoint: 8b845dd]
- [x] Task: Implement User Profile APIs.
    - [x] `GET /api/profile`: Get current user info.
    - [x] `PATCH /api/profile`: Update name, contact info, and email (requires password verification).
    - [x] `POST /api/profile/change-password`: Change password with current password verification.
- [x] Task: Implement Mandatory Password Change logic.
    - [x] Middleware to block non-profile requests if `mustChangePassword` is true.
- [x] Task: Conductor - User Manual Verification 'Phase 3: User Profile & Security (Backend)' (Protocol in workflow.md)

## Phase 4: Frontend Implementation (Admin Tools)
- [x] Task: Create User Management Dashboard.
    - [x] List all users with role and status indicators.
    - [x] Add/Edit User modals.
- [x] Task: Create System Audit Log viewer.
    - [x] Table view with filtering by date, user, and action type.
- [x] Task: Implement UI-level RBAC.
    - [x] Hide/Show navigation items and buttons based on user role from session.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Frontend Implementation (Admin Tools)' (Protocol in workflow.md)

## Phase 5: Frontend Implementation (User Features)
- [x] Task: Create User Profile page.
    - [x] Forms for updating personal info and changing password.
- [x] Task: Create "Force Password Change" view.
    - [x] A restricted view that appears if the user needs to reset their password before proceeding.
- [x] Task: Refactor Authentication Flow.
    - [x] Remove public Sign-Up page.
    - [x] Update Login to handle deactivated accounts and password reset flags.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Frontend Implementation (User Features)' (Protocol in workflow.md)
