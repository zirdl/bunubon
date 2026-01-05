# Bunubon Land Title Tracking System

A full-stack application for tracking land titles in La Union, Philippines. This system helps the Department of Agrarian Reform (DAR) manage and monitor land titles efficiently.

## Project Structure

```
bunubon/
├── frontend/           # React/Vite frontend application
├── backend/            # Express.js backend API
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

### Scripts Available

- `npm run dev`: Start both frontend and backend development servers
- `npm run dev:frontend`: Start only the frontend development server
- `npm run dev:backend`: Start only the backend development server
- `npm run build`: Build the frontend application

## Features

- Track land titles across 20 municipalities in La Union
- Monitor processing status of TCT/CLOA and TCT/EP documents
- Manage user accounts and permissions
- View municipality-specific checkpoints and progress

## Technology Stack

- **Frontend**: React, TypeScript, Vite, Material UI, Radix UI
- **Backend**: Node.js, Express.js, SQLite
- **Development**: npm workspaces, concurrently

## Database

The application uses SQLite for data storage. The database file (`database.db`) is located in the `backend/` directory.

## API Endpoints

The backend provides RESTful APIs for:
- `/api/municipalities` - Manage municipalities and their data
- `/api/titles` - Manage land titles
- `/api/users` - User authentication and management
- `/api/checkpoints` - Track processing checkpoints