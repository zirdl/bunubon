# Implementation Plan: Google Sheets API Ingestion

## Phase 1: Backend Infrastructure & API

- [x] Task: Install `googleapis` in the backend (6d0c864)
- [x] Task: Create Google Sheets service utility (02dbb21)
    - [ ] Implement service account authentication logic
    - [ ] Create function to fetch raw rows from a Sheet ID and Range
- [x] Task: Implement Sync Logic (240d52d)
    - [ ] Create logic to map spreadsheet columns to Title database fields
    - [ ] Implement "Upsert" logic (Update if serial number exists, otherwise Insert)
- [ ] Task: Create Sync Endpoints
    - [ ] `POST /api/sync/preview`: Returns data for the frontend to display without saving
    - [ ] `POST /api/sync/confirm`: Actually performs the database write
- [ ] Task: Conductor - User Manual Verification 'Backend Sync Logic' (Protocol in workflow.md)

## Phase 2: Frontend Integration

- [ ] Task: Add "Sync from Google Sheets" section to the Import/Export page
- [ ] Task: Implement Preview Modal
    - [ ] Display a table of "Pending Changes" from the Google Sheet
    - [ ] Highlight errors (e.g., unknown municipality)
- [ ] Task: Implement Final Sync Action
    - [ ] Send confirmation to backend and show success/failure toast
- [ ] Task: Conductor - User Manual Verification 'Frontend Sync UI' (Protocol in workflow.md)
