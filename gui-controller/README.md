# Bunubon LTS GUI Controller

A Windows desktop application for managing the Bunubon Land Title Tracking System server.

## Features

- **Server Control**: Start and stop the backend server with a single click
- **Status Indicators**: Visual feedback showing server state (Running/Stopped/Error)
- **Uptime Monitor**: Real-time display of server uptime
- **Activity Log**: Track server events and errors
- **Server Log Viewer**: View backend server logs in real-time
- **Error Log Viewer**: View and debug error messages
- **System Tray**: Minimize to tray for background operation
- **Desktop Notifications**: Get notified when server starts/stops
- **Portable Executable**: Single .exe file - no installation required

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Run in development mode
npm start
```

### Building Windows Executable

**On Windows:**
```cmd
build.bat
```

**On Linux/macOS:**
```bash
chmod +x build.sh
./build.sh
```

The built executable will be in `dist/Bunubon-LTS-Controller-Portable-1.0.0.exe`

## Usage

1. **Launch the application** - Double-click the executable
2. **Start the server** - Click "Start Server" button
3. **Access the web app** - Open browser to `http://localhost:5000`
4. **View logs** - Switch between Activity, Server, and Error log tabs
5. **Stop the server** - Click "Stop Server" when done

## Log Viewer

The application includes three log tabs:

| Tab | Description |
|-----|-------------|
| **Activity Log** | Controller actions (start, stop, errors) |
| **Server Log** | Backend server output and requests |
| **Error Log** | Error messages from the backend |

Click **Refresh** (🔄) to load the latest server/error logs.

## File Structure

```
gui-controller/
├── main.js          # Electron main process
├── preload.js       # Preload script for IPC
├── renderer.js      # UI logic
├── index.html       # Main UI
├── styles.css       # Styling
├── package.json     # Dependencies and build config
├── build.bat        # Windows build script
├── build.sh         # Linux/macOS build script
└── README.md        # This file
```

## Configuration

The controller looks for the backend server relative to the app location:
- **Backend**: `backend/server.js`
- **Default port**: 5000
- **Logs**: `logs/` folder

To change the port, set the `PORT` environment variable before launching.

## Building the Windows Executable

### Using electron-builder

The package.json is configured with electron-builder for easy packaging:

```json
{
  "build": {
    "appId": "com.dar.bunubon.controller",
    "productName": "Bunubon LTS Controller",
    "win": {
      "target": "portable"
    }
  }
}
```

### Output

- **Portable Executable**: `Bunubon-LTS-Controller-Portable-1.0.0.exe`
  - Single file, no installation needed
  - Includes all dependencies
  - Works on any Windows 10+ machine

## Troubleshooting

### Server Won't Start

1. Check if port 5000 is already in use
2. Check the Error Log tab for messages
3. Ensure backend files are present

### Application Won't Launch

1. Reinstall dependencies: `npm install`
2. Run as Administrator if needed
3. Check Windows compatibility (requires Windows 10+)

### Logs Not Loading

1. Click the Refresh button in the log tab
2. Ensure the server has been started at least once
3. Check the `logs/` folder for log files

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, contact:
**Department of Agrarian Reform - Provincial Office La Union**

---

**Land Title Tracking System**
