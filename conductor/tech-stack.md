# Technology Stack

## Frontend
- **Framework:** React (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, Material UI (MUI), Radix UI
- **State Management:** React Hooks, Context API (inferred)
- **Routing:** React Router Dom
- **Visualization:** Recharts (for dashboards)

## Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript
- **API Style:** RESTful
- **Authentication:** Session-based (express-session)
- **Security:**
  - Helmet (Security headers)
  - Express Rate Limit
  - Express Validator (Input sanitization)
  - Bcrypt (Password hashing)

## Database
- **Engine:** SQLite
- **Persistence:** `backend/database.db`

## Infrastructure & Tooling
- **Package Management:** npm (with Workspaces)
- **Concurrency:** `concurrently` (for running dev servers)
- **Initialization:** Standalone setup script (`backend/scripts/setup.js`)
- **Version Control:** Git
