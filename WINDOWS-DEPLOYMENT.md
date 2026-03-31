# Bunubon LTS - Windows Deployment Guide

## Overview

This guide explains how to build and deploy the **Bunubon Land Title Tracking System** as a single, self-contained Windows executable. The resulting `.exe` file is **portable** - it requires no installation and includes everything needed to run the application.

---

## What You Get

After building, you'll have a single file: **`Bunubon-LTS-Controller-Portable-1.0.0.exe`**

This executable includes:
- ✅ Electron runtime (Chromium + Node.js)
- ✅ Backend server (Express + SQLite)
- ✅ Frontend application (React + Vite)
- ✅ GUI Controller interface
- ✅ All dependencies bundled
- ✅ System tray integration
- ✅ Log file viewer

**No external dependencies required** - the target Windows machine doesn't need Node.js, Python, or any other software installed.

---

## Prerequisites (Build Machine Only)

To **build** the executable, you need a machine with:

| Software | Version | Install Link |
|----------|---------|--------------|
| Node.js | 18.x or higher | https://nodejs.org/ |
| npm | 9.x or higher | (comes with Node.js) |
| Git | Any recent version | https://git-scm.com/ |

> **Note:** You can build on Windows, Linux, or macOS. The output is a Windows `.exe` file.

---

## Building the Executable

### On Windows (Recommended)

1. **Open Command Prompt or PowerShell** in the `gui-controller` folder:
   ```cmd
   cd bunubon\gui-controller
   ```

2. **Run the build script:**
   ```cmd
   build.bat
   ```

3. **Wait for the build to complete** (may take 5-10 minutes on first build)

4. **Find your executable** in the `dist\` folder:
   ```
   gui-controller\dist\Bunubon-LTS-Controller-Portable-1.0.0.exe
   ```

### On Linux/macOS

1. **Open Terminal** in the `gui-controller` folder:
   ```bash
   cd bunubon/gui-controller
   ```

2. **Make the build script executable:**
   ```bash
   chmod +x build.sh
   ```

3. **Run the build script:**
   ```bash
   ./build.sh
   ```

4. **Find your executable** in the `dist/` folder

### Manual Build (Alternative)

If you prefer to run the steps manually:

```bash
# 1. Build the frontend
cd ../frontend
npm install
npm run build

# 2. Install backend dependencies
cd ../backend
npm install --production

# 3. Install GUI dependencies
cd ../gui-controller
npm install

# 4. Build the Windows executable
npm run build:portable
```

---

## Deploying to Windows Machines

### Step 1: Copy the Executable

Copy **`Bunubon-LTS-Controller-Portable-1.0.0.exe`** to the target Windows machine.

**Recommended locations:**
- `C:\Program Files\Bunubon\`
- `C:\Apps\Bunubon\`
- Any folder of your choice

### Step 2: (Optional) Create Desktop Shortcut

1. Right-click the `.exe` file
2. Select **"Create shortcut"**
3. Drag the shortcut to the Desktop

### Step 3: Run the Application

Double-click **`Bunubon-LTS-Controller-Portable-1.0.0.exe`**

The application will:
1. Launch the GUI Controller window
2. Create a `logs/` folder for server logs
3. Create a `backend/database/` folder for SQLite data
4. Show the server status as "Server Stopped"

---

## Using the Application

### Starting the Backend Server

1. Click the **"Start Server"** button (green)
2. Wait for the status to change to **"Server Running"**
3. The server uptime timer will start counting
4. The application will minimize to the system tray

**Access the web application:**
- Open a browser
- Go to: `http://localhost:5000`

### Stopping the Backend Server

1. Click the **"Stop Server"** button (red)
2. Wait for the server to shutdown gracefully
3. Status will change to **"Server Stopped"**

### Viewing Logs

The application has three log tabs:

| Tab | Description |
|-----|-------------|
| **Activity Log** | Controller actions (start, stop, errors) |
| **Server Log** | Backend server output and requests |
| **Error Log** | Error messages from the backend |

**To view logs:**
1. Click on the **Server Log** or **Error Log** tab
2. Click the **Refresh** button (🔄) to load the latest logs
3. Click the **Clear** button (🗑️) to clear the Activity Log

### System Tray

When minimized, the application runs in the system tray:

- **Right-click** the tray icon for quick access to:
  - Start/Stop server
  - Show controller window
  - Exit application

---

## File Structure (After First Run)

```
Bunubon/
├── Bunubon-LTS-Controller-Portable-1.0.0.exe
├── logs/                           # Created on first run
│   ├── server-2024-01-01T12-00-00.log
│   └── error-2024-01-01T12-00-00.log
└── backend/
    └── database/                   # Created on first run
        └── bunubon.db
```

---

## Configuration

### Changing the Port

By default, the server runs on **port 5000**.

To change it:
1. Create a file named `.env` in the same folder as the `.exe`
2. Add this line:
   ```
   PORT=8080
   ```
3. Restart the application

### Session Secret (Production)

For production deployments, set a custom session secret:

```env
SESSION_SECRET=your_very_long_and_secure_random_string_here
```

Generate a secure random string with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Troubleshooting

### "Server Won't Start"

**Possible causes:**
1. **Port 5000 is already in use**
   - Solution: Change the port (see Configuration above)
   
2. **Missing backend files**
   - Solution: Ensure the `backend/` folder exists alongside the `.exe`

3. **Antivirus blocking**
   - Solution: Add an exception for the `.exe` file

### "Application Won't Launch"

1. **Check Windows version** - Requires Windows 10 or later
2. **Run as Administrator** - Right-click → "Run as administrator"
3. **Check for existing instances** - Close any running instances from system tray

### "Logs Not Appearing"

1. Click the **Refresh** button in the log tab
2. Ensure the server has been started at least once
3. Check the `logs/` folder for log files

### "Database Errors"

1. Close the application completely (exit from system tray)
2. Delete the `backend/database/bunubon.db` file
3. Restart the application (database will be recreated)

---

## Uninstalling

Since this is a portable application:

1. **Exit** the application from the system tray
2. **Delete** the `.exe` file and all folders
3. **Remove** any desktop shortcuts

No registry entries or system files are modified.

---

## Technical Details

### Build Configuration

The build uses **electron-builder** with the following settings:

```json
{
  "appId": "com.dar.bunubon.controller",
  "productName": "Bunubon LTS Controller",
  "win": {
    "target": "portable",
    "arch": ["x64"]
  }
}
```

### Bundled Components

| Component | Version | Purpose |
|-----------|---------|---------|
| Electron | 28.x | Desktop application runtime |
| Node.js | (bundled) | JavaScript runtime |
| Express | 4.x | Backend web server |
| SQLite3 | 5.x | Database engine |
| React | 18.x | Frontend framework |

### Security Considerations

- The application runs with user-level privileges (no admin required)
- Session secrets are auto-generated on first run
- Database is stored locally (no network exposure)
- CORS is configured for localhost only

---

## Support

For issues or questions:

1. Check the **Error Log** tab in the application
2. Review log files in the `logs/` folder
3. Contact: **Department of Agrarian Reform - Provincial Office La Union**

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024 | Initial release with portable Windows executable |

---

**© 2024 Department of Agrarian Reform - Provincial Office La Union**
