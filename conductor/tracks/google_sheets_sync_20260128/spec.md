# Specification: Google Sheets API Ingestion

## Overview
This feature allows the system to pull data directly from Google Sheets. Users provide a Google Sheet ID, preview the data, and "sync" it into the SQLite database. This supports the "Bridge" strategy to help staff transition from spreadsheet-centric workflows.

## User Stories
- As a DAR staff member, I want to keep using Google Sheets for collaborative data entry but have that data automatically reflected in the system's dashboard.
- As an administrator, I want the system to validate spreadsheet data (e.g., checking for correct municipality names) before it is imported.

## Functional Requirements
- The backend shall connect to the Google Sheets API using a service account.
- The system shall fetch data from a specific range in a provided Sheet ID.
- The frontend shall provide a "Sync from Google Sheet" interface.
- The UI shall show a "Preview" of the records to be imported.
- The import process shall match records by `serialNumber` to avoid duplicates (updating existing ones or adding new ones).

## Technical Requirements
- **Backend:** Install `googleapis` library.
- **Security:** Use a Service Account JSON key (to be provided by the user/environment).
- **Endpoint:** `POST /api/sync/google-sheets` with `sheetId` and `range`.

## Acceptance Criteria
- Successfully fetching data from a public or service-account-shared Google Sheet.
- Validating municipality names against the database.
- Displaying a preview of changes (New records vs. Updates) before committing to the database.
- Successfully updating the `titles` table after user confirmation.
