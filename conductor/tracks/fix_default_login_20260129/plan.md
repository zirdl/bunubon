# Implementation Plan: Fix Default Login & Robust System Initialization

## Phase 1: Robust Environment & Setup
- [x] Task: Implement Environment Variable Validation 72d2a62
    - [x] Write failing test verifying server exit on missing `SESSION_SECRET`
    - [x] Implement validation logic in `backend/server.js`
- [x] Task: Create Standalone Initialization Script 72d2a62
    - [x] Write failing tests for standalone database/table creation
    - [x] Implement `backend/scripts/setup.js`
    - [x] Update `backend/package.json` with `setup` script
- [x] Task: Conductor - User Manual Verification 'Phase 1: Robust Environment & Setup' (Protocol in workflow.md) 72d2a62

## Phase 2: Authentication Reliability
- [x] Task: Automatic 'admin' Hash Migration 72d2a62
    - [x] Write failing test verifying SHA-256 hash is upgraded to Bcrypt on startup
    - [x] Implement migration logic in initialization sequence
- [x] Task: Logging & Final Verification 72d2a62
    - [x] Standardize and improve initialization console output
    - [x] Verify successful login with `admin`/`admin123`
- [x] Task: Conductor - User Manual Verification 'Phase 2: Authentication Reliability' (Protocol in workflow.md) 72d2a62
