# Specification - User Management & Security Enhancement

## Overview
This track aims to implement a robust, role-based user management system for the Bunubon Land Title Tracking System. It transitions the application from a basic authentication model to a professional administrative framework, ensuring data integrity, accountability through audit logs, and secure access control for DAR personnel.

## Functional Requirements

### 1. Role-Based Access Control (RBAC)
- **Administrator:** Full system access, including managing users, viewing system-wide audit logs, and overriding/deleting records.
- **LTS Staff (Editor):** Standard operational role. Can create, read, and update land title records and view dashboards. Cannot manage other users.
- **Viewer (Read-Only):** Can search and view records and dashboards but cannot perform any write operations.

### 2. Administrative User Management
- **Admin-Only Invitations:** Remove public sign-up. New accounts must be created by an Administrator.
- **Account Deactivation:** Admins can deactivate accounts (soft-delete) to prevent login while preserving historical audit data.
- **Mandatory Password Reset:** Users must change their password upon their first login or after an Admin-initiated password reset.
- **Session Management:** Admins can view active sessions and force-logout users if necessary.

### 3. User Profile Customization
- **Profile Updates:** Users can update their Full Name and Contact Number.
- **Secure Password Change:** Users can change their password by providing their current password.
- **Email Management:** Users can update their email address (requires re-authentication for security).

### 4. Audit Logging (User Actions)
- **Activity Tracking:** Log all administrative actions:
    - User creation and role assignment.
    - Account deactivation/reactivation.
    - Password reset events.
- **System Log View:** A dedicated interface for Administrators to view, filter, and search the audit logs.

## Non-Functional Requirements
- **Security:** Use Bcrypt for password hashing and express-session for secure session management.
- **Data Integrity:** Ensure audit logs are immutable once written.
- **UI/UX:** Provide clear feedback for administrative actions and unauthorized access attempts.

## Acceptance Criteria
- [ ] Only Administrators can access the User Management and Audit Log pages.
- [ ] LTS Staff can edit titles but not users.
- [ ] Viewers cannot see "Edit" or "Create" buttons anywhere in the UI.
- [ ] Deactivated users are immediately blocked from accessing the system.
- [ ] All user management actions are correctly recorded in the database and visible in the System Log.
- [ ] Users are forced to change their password on first login after an account is created by an Admin.

## Out of Scope
- Detailed audit logs for *every* field change in land title records (this will be addressed in a future track).
- Multi-factor authentication (MFA).
- Integration with external identity providers (LDAP/Active Directory).
