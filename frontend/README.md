# Bunubon Frontend

This is the frontend for the Bunubon land title tracking system. It's built with React and Vite.

## Prerequisites

Before running the application, make sure you have:
- Node.js (v18 or higher)
- npm (v8 or higher)

## Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Frontend Development Server
```bash
npm run dev
```

This will start the frontend on `http://localhost:5173` and automatically proxy API requests to the backend server.

### 3. Start the Backend Server (in a separate terminal)
```bash
# Navigate to the backend directory
cd ../backend

# Install backend dependencies
npm install

# Start the backend server
npm run dev
```

The backend server will run on `http://localhost:5000`.

## Project Structure
- `src/` - Contains React source code
- `public/` - Static assets
- `index.html` - Main HTML file
- `vite.config.ts` - Vite build configuration

## Development
- The frontend will automatically reload when you make changes
- API requests to `/api/*` are automatically proxied to the backend server
- The application is configured to connect to the backend at `http://localhost:5000`
  