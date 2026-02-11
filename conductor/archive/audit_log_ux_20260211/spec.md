# Specification: Audit Log UX and Filter Improvements

## Overview
This track addresses two primary issues in the User Management Dashboard:
1.  **Audit Log Clarity:** The "details" column currently displays raw JSON strings, which are difficult for non-technical users to interpret.
2.  **Filter Functionality:** The "advanced filters" located beside the search bar in the Audit Log viewer are currently non-functional.

## Problem Statement
Administrators need a clear, human-readable history of system actions to ensure accountability. Raw JSON in the "details" field and broken filters hinder their ability to monitor system activity effectively.

## Functional Requirements
### 1. Human-Readable Audit Details
-   **Transformation:** The frontend must parse the `details` JSON field from the backend and present it in a structured, readable format.
-   **Structure:** Use a "Field: Old Value -> New Value" format or a concise descriptive sentence (e.g., "Updated 'Full Name' and 'Email'").
-   **Fallback:** If parsing fails or the field is empty, display a sensible default (e.g., "No additional details").

### 2. Functional Advanced Filters
-   **Filter Integration:** Connect the advanced filter UI components to the data fetching logic.
-   **Supported Filters:**
    -   **Action Type:** Dropdown to filter by specific actions (e.g., USER_CREATED, LOGIN, etc.).
    -   **User:** Filter by the administrator who performed the action.
    -   **Date Range:** Filter logs within a specific timeframe.
-   **Real-time/Submit Update:** The table should update immediately upon filter change or upon clicking a "Apply Filters" button.

## Non-Functional Requirements
-   **Performance:** Filtering should be performed efficiently, either on the client-side (for the current page) or by sending query parameters to the backend for server-side filtering.
-   **Consistency:** The filter UI should match the styling of existing dashboard components (Material UI/Radix UI).

## Acceptance Criteria
- [ ] Audit log details are displayed as a readable list or sentence instead of raw JSON.
- [ ] Selecting an "Action Type" from the filter correctly updates the visible logs.
- [ ] Selecting a "User" from the filter correctly updates the visible logs.
- [ ] The search bar and advanced filters work in tandem (e.g., searching for a user while filtering for "USER_CREATED").

## Out of Scope
-   Exporting audit logs to CSV/Excel (this may be a future track).
-   Adding new audit log events (this track focuses on existing data).
