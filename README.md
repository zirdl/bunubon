# Bunubon Land Title Tracking System

A full-stack application for tracking land titles in La Union, Philippines. This system helps the Department of Agrarian Reform (DAR) manage and monitor land titles efficiently.

## Project Structure

```
bunubon/
├── frontend/           # React/Vite frontend application
├── backend/            # Express.js backend API
├── gui-controller/     # Windows GUI server controller (Electron)
├── package.json        # Root package.json with workspace configuration
└── README.md           # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd bunubon
   ```

2. Install dependencies for both frontend and backend:

   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..

   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

### Running the Application

#### Option 1: Run Frontend and Backend Separately

1. **Start the Backend Server:**

   ```bash
   cd backend
   npm run dev
   ```

   The backend will be available at `http://localhost:5000`

2. **In a separate terminal, start the Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

#### Option 2: Run Using Root Scripts

From the project root directory:

```bash
# Start both frontend and backend concurrently
npm run dev
```

#### Option 3: Using the Windows GUI Controller (Production)

For production deployment on Windows:

1. Navigate to the GUI controller directory:
   ```bash
   cd gui-controller
   npm install
   ```

2. Run in development mode:
   ```bash
   npm start
   ```

3. Build for Windows (requires Windows):
   ```bash
   npm run build
   ```

The GUI controller provides:
- One-click server start/stop
- Real-time server status indicators
- Uptime monitoring
- Activity logging
- System tray integration

### Scripts Available

- `npm run dev`: Start both frontend and backend development servers
- `npm run dev:frontend`: Start only the frontend development server
- `npm run dev:backend`: Start only the backend development server
- `npm run build`: Build the frontend application

## Features

- Track land titles across 20 municipalities in La Union
- Monitor processing status of TCT/CLOA and TCT/EP documents
- Manage user accounts and permissions (Admin, Editor, Viewer roles)
- View municipality-specific checkpoints and progress
- Export data to Excel format
- Audit logging for all system changes
- Backup and restore functionality
- Help page with user guides and FAQs

## Technology Stack

- **Frontend**: React, TypeScript, Vite, Material UI, Radix UI, Tailwind CSS
- **Backend**: Node.js, Express.js, SQLite, bcryptjs, express-session
- **GUI Controller**: Electron, electron-builder
- **Development**: npm workspaces, concurrently

## Database

The application uses SQLite for data storage. The database file (`database.db`) is located in the `backend/` directory.

## User Roles

### Administrator (ADMIN)
- Full system access
- User management (create, edit, deactivate, delete users)
- Password reset capabilities
- Access to audit logs
- Backup and restore data

### LTS Staff / Editor (EDITOR)
- Create and edit land titles
- View all municipalities and titles
- Export title data
- Update title status

### Read-Only Viewer (VIEWER)
- View all municipalities and titles
- Search and filter records
- Export title data
- Cannot modify any data

## Land Title Types

### SPLIT Titles
- Subdivided portions of a Mother CCLOA title
- **Required fields**: Serial Number, Title Type, Beneficiary Name, Lot Number, Barangay Location, Area, Status, Date Issued, Date Registered, Date Distributed, Mother CCLOA No., Title No.
- **Available statuses**: On-Hand, Released

### Regular Titles
- Standard land titles (TCT-CLOA, TCT-EP)
- **Required fields**: Serial Number, Title Type, Subtype, Beneficiary Name, Lot Number, Barangay Location, Area, Status, Date Issued
- **Available statuses**: On-Hand, Processing, Released

## API Endpoints

The backend provides RESTful APIs for:

- `/api/login` - User authentication
- `/api/logout` - User logout
- `/api/profile` - User profile management
- `/api/municipalities` - Manage municipalities
- `/api/titles` - Manage land titles
- `/api/users` - User management (Admin only)
- `/api/audit-logs` - View audit logs (Admin only)
- `/api/export` - Export data
- `/api/backup` - Backup and restore

## Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Important**: Change the default password immediately after first login!

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
SESSION_SECRET=your_secure_secret_here
NODE_ENV=development

# Set to 'true' ONLY if using HTTPS (production)
HTTPS_ENABLED=false
```

**Important:** Generate a strong random string for SESSION_SECRET in production:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Troubleshooting

### Login Issues

If users cannot log in or sessions expire prematurely:

1. **Check session configuration:**
   - Ensure `SESSION_SECRET` is set in `.env`
   - For local development (HTTP), set `HTTPS_ENABLED=false`
   - For production (HTTPS), set `HTTPS_ENABLED=true`

2. **Clear old sessions:**
   ```bash
   cd backend
   node scripts/cleanup-sessions.js
   ```

3. **Check browser console:**
   - Look for CORS or cookie-related errors
   - Ensure cookies are being accepted

4. **Session duration:**
   - Sessions are valid for 24 hours
   - Sessions are invalidated if user is deactivated
   - Old sessions are cleaned up automatically

5. **Restart the server:**
   - Stop the backend server
   - Delete `backend/sessions/sessions.db` (optional - clears all active sessions)
   - Restart the server

### Common Login Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid credentials" | Wrong username/password | Verify credentials, check caps lock |
| "Account has been deactivated" | Admin deactivated the account | Contact administrator |
| "Unable to connect to server" | Backend not running | Start the backend server |
| Session expires quickly | HTTPS mismatch | Set `HTTPS_ENABLED` correctly |

## Security Features

- Password hashing with bcryptjs
- Session-based authentication
- Role-based access control
- Rate limiting on API endpoints
- Helmet.js security headers
- CORS protection
- Input validation with express-validator
- Audit logging

## Recent Updates (v1.1.0)

### Bug Fixes
- Fixed user role permission checks (Viewer vs VIEWER case sensitivity)
- Improved authentication flow and session handling

### UI Improvements
- Removed "Date Received" field for SPLIT and Regular titles
- Made "Date Issued" required for all title types
- Made all date fields required for SPLIT titles (Date Issued, Date Registered, Date Distributed)
- Removed "Processing" status option for SPLIT titles (only available for Regular titles)

### New Features
- Added comprehensive Help Page with:
  - User guides for all features
  - Role-based permissions documentation
  - FAQ section with common questions
  - Quick start guide for new users
- Created Windows GUI Controller for server management:
  - Start/Stop server with one click
  - Real-time status indicators
  - Uptime monitoring
  - Activity logging
  - System tray integration
  - Desktop notifications

## Future Improvements / TODO

- [ ] **Document Upload**: Allow attaching scanned copies of land titles to records.
- [x] **Cloud Spreadsheet Integration**: Implement integration with cloud-based storage (e.g., Microsoft OneDrive/Excel Online or Google Sheets) for live data synchronization or bulk importing.
- [x] **Advanced Reporting**: Generate PDF/Excel reports for municipality progress.
- [x] **Audit Logs**: Track changes made to land title records.
- [x] **Help System**: Comprehensive help page and user documentation.
- [x] **GUI Controller**: Windows desktop application for server management.
