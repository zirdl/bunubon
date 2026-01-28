# Specification: Export to Excel

## Overview
This feature allows DAR personnel to export the current list of land titles into an Excel (.xlsx) file. This is the first step towards "Cloud Spreadsheet Integration" and serves as a bridge for staff transitioning from manual spreadsheets.

## User Stories
- As a DAR staff member, I want to export all title records to an Excel file so that I can perform offline analysis or share the data with colleagues who are not yet using the system.
- As a Division Chief, I want a reliable export of the current tracking data to include in official reports.

## Functional Requirements
- The system shall provide a backend endpoint to generate an Excel file containing all land title records.
- The Excel file shall include all relevant fields: Serial Number, Owner, Municipality, Title Type, Status, etc.
- The frontend shall have a visible "Export to Excel" button on the Titles Page.
- Clicking the button shall trigger the download of the generated file.

## Technical Requirements
- **Backend:** Use a library like `xlsx` (already present in frontend, verify backend usage or use a compatible one) to generate the spreadsheet.
- **API Endpoint:** `GET /api/titles/export` or similar.
- **Frontend:** Implement the download logic using the browser's download capabilities.

## Acceptance Criteria
- Clicking "Export to Excel" downloads a valid `.xlsx` file.
- The file contains all title records currently in the database.
- Column headers in the Excel file are human-readable and match the system's field names.
