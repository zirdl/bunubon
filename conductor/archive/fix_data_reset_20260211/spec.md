# Specification: Fix Intermittent Data Reset and Dashboard Instability

## Overview
This track addresses a critical bug where the application intermittently resets its state, causing the default admin password to fail and dashboard charts (municipal progress) to disappear after a few minutes of use or inactivity.

## Problem Statement
Users report that while using the application or leaving it idle, the dashboard data becomes unavailable (charts disappear). Subsequently, the default 'admin123' password for the 'admin' account no longer works, suggesting a database reset or corruption is occurring in the background.

## Functional Requirements
- **Stable Data Persistence:** The database state (municipalities, titles, users) must remain persistent across sessions and terminal operations unless explicitly reset by the user.
- **Consistent Authentication:** The 'admin' user credentials must remain valid and not be overwritten or reverted to an incompatible format (e.g., SHA-256 vs. Bcrypt) automatically.
- **Dashboard Reliability:** The frontend charts must consistently fetch and display data without disappearing unexpectedly.

## Non-Functional Requirements
- **Security:** Ensure Bcrypt remains the sole hashing mechanism for all user passwords.
- **Observability:** Improve logging for database initialization and reset events to aid future debugging.

## Acceptance Criteria
- [ ] The application can be left idle for 30+ minutes without data disappearing or login failing.
- [ ] Switching between frontend usage and terminal commands (e.g., `npm test`, `git status`) does not trigger a database reset.
- [ ] The `admin` user can always log in with the established password after the fix is applied.
- [ ] Automated tests confirm that the `admin` password hash remains a valid Bcrypt hash.

## Out of Scope
- Implementing new dashboard features or charts.
- Changing the underlying database engine (SQLite).
