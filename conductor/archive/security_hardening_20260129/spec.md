# Specification: Security Hardening & Robust Authentication

## Overview
This track aims to transform the application's security posture from a prototype to a production-ready state. It replaces the current insecure authentication mechanism with a robust, session-based system and implements comprehensive hardening measures to protect against common web vulnerabilities.

## Functional Requirements
- **Secure Session Management:** Implement stateful authentication using HTTP-only, secure, and `SameSite=Lax` session cookies.
- **Role-Based Access Control (RBAC):**
    - **Admin:** Full system access, including user management and record deletion.
    - **Encoder:** Can view, create, and update records; cannot delete records or manage users.
    - **Viewer:** Read-only access to all dashboards and title records.
- **Login/Logout Flow:** Secure endpoints for creating and destroying sessions.
- **Protected API Routes:** Middleware to enforce authentication and role-specific permissions on all sensitive endpoints.

## Non-Functional Requirements (Hardening)
- **Password Security:** Use `bcrypt` with a salt cost of 10 for hashing all user passwords.
- **Input Validation:** Implement `express-validator` to strictly validate and sanitize all incoming API data (e.g., preventing SQL Injection and XSS).
- **Security Headers:** Integrate `helmet` middleware to set essential security headers (CSP, HSTS, etc.).
- **CSRF Protection:** Implement protection against Cross-Site Request Forgery (critical for cookie-based auth).
- **Rate Limiting:** Apply request limits to `/api/login` and other sensitive routes to mitigate brute-force and DoS attacks.
- **Information Leakage Prevention:** Implement a global error handler that returns generic error messages to the client while logging detailed errors on the server.
- **Environment Management:** Enforce the use of `.env` files for all secrets (JWT secrets, session keys, etc.).

## Acceptance Criteria
- Users can log in and receive a secure HTTP-only cookie.
- Users are automatically logged out when the session expires or they click "Logout".
- Accessing any protected `/api` route without a valid session returns a 401 Unauthorized status.
- An 'Encoder' attempting to delete a record or access the `/api/users` route receives a 403 Forbidden status.
- API requests with malicious or malformed payloads are rejected with descriptive validation errors (but without implementation details).
- The application passes a basic automated security audit (e.g., checking for presence of security headers).

## Out of Scope
- Multi-factor authentication (MFA).
- Database-level encryption (e.g., SQLCipher).
- Advanced audit logging (tracked in a future roadmap item).
