#!/bin/bash
# Bunubon LTS - Windows Build Script
# Builds the portable Windows executable

set -e

echo "========================================"
echo "  Bunubon LTS - Windows Build Script"
echo "========================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GUI_DIR="$SCRIPT_DIR"
BACKEND_DIR="$SCRIPT_DIR/../backend"
FRONTEND_DIR="$SCRIPT_DIR/../frontend"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi
echo "  ✓ Node.js: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi
echo "  ✓ npm: $(npm --version)"

echo ""
echo -e "${YELLOW}Step 2: Building frontend...${NC}"
cd "$FRONTEND_DIR"
npm install
npm run build
echo -e "${GREEN}  ✓ Frontend built successfully${NC}"

echo ""
echo -e "${YELLOW}Step 3: Installing backend dependencies...${NC}"
cd "$BACKEND_DIR"
npm install --production
echo -e "${GREEN}  ✓ Backend dependencies installed${NC}"

echo ""
echo -e "${YELLOW}Step 4: Installing GUI dependencies...${NC}"
cd "$GUI_DIR"
npm install
echo -e "${GREEN}  ✓ GUI dependencies installed${NC}"

echo ""
echo -e "${YELLOW}Step 5: Generating icon (if sharp is available)...${NC}"
if [ -f "build/generate-icon.js" ]; then
    node build/generate-icon.js || echo -e "${YELLOW}  ⚠ Icon generation skipped (install sharp for icon conversion)${NC}"
else
    echo "  ⚠ Icon generation script not found"
fi

echo ""
echo -e "${YELLOW}Step 6: Building Windows portable executable...${NC}"
npm run build:portable

echo ""
echo -e "${GREEN}========================================"
echo "  Build Complete!"
echo "========================================${NC}"
echo ""
echo "Output location: $GUI_DIR/dist/"
echo ""
echo "Files created:"
ls -lh "$GUI_DIR/dist/" 2>/dev/null || echo "  (build output not yet visible)"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Copy the .exe file from dist/ to your Windows machine"
echo "  2. Run the executable (no installation required)"
echo "  3. Use the GUI to start/stop the backend server"
echo ""
