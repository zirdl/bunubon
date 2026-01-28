# Implementation Plan: Export to Excel

## Phase 1: Backend Implementation [checkpoint: e9b75b0]

- [x] Task: Install `xlsx` or similar library in the backend (60c8bab)
- [x] Task: Create Excel generation utility (f94c450)
    - [ ] Write tests for the utility (mocking data)
    - [ ] Implement the utility to convert JSON records to an Excel buffer
- [x] Task: Implement the Export API endpoint (6101e4c)
    - [ ] Write integration tests for `GET /api/titles/export`
    - [ ] Implement the route and controller to fetch titles and stream the Excel file
- [ ] Task: Conductor - User Manual Verification 'Backend Implementation' (Protocol in workflow.md)

## Phase 2: Frontend Implementation

- [ ] Task: Add Export function to the API service
    - [ ] Write unit tests for the export service function
    - [ ] Implement the function to call the backend export endpoint and trigger a browser download
- [ ] Task: Add "Export to Excel" button to the Titles Page
    - [ ] Write tests for the button and its interaction
    - [ ] Implement the button in `TitlesPage.tsx` or `TitlesList.tsx`
- [ ] Task: Conductor - User Manual Verification 'Frontend Implementation' (Protocol in workflow.md)
