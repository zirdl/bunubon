#!/bin/bash
# Efficient Dependency Update Script for Bunubon
# Updates dependencies while handling vulnerabilities

set -e

echo "========================================"
echo "  Bunubon - Dependency Update Script"
echo "========================================"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to update a package
update_package() {
    local dir=$1
    local pkg=$2
    local version=$3
    
    echo -e "${YELLOW}Updating $pkg to $version in $dir...${NC}"
    cd "$dir"
    npm install $pkg@$version
    echo -e "${GREEN}✓ Updated${NC}"
}

echo -e "${YELLOW}[Step 1/4] Backend - Safe updates${NC}"
cd /home/gio/Projects/bunubon/backend

# Run automatic fixes first
echo "Running npm audit fix..."
npm audit fix --dry-run 2>&1 | grep -E "(fix|available)" || true
npm audit fix

echo ""
echo -e "${YELLOW}[Step 2/4] Backend - Critical vulnerability fixes${NC}"

# Update express-rate-limit (fixes IPv6 bypass)
echo "Updating express-rate-limit..."
npm install express-rate-limit@^9.0.0

# Update express to latest 4.x (fixes path-to-regexp)
echo "Updating express..."
npm install express@^4.21.0

# Update qs (fixes DoS vulnerability)
echo "Updating qs (via express update)..."

echo ""
echo -e "${YELLOW}[Step 3/4] Frontend - Update dependencies${NC}"
cd /home/gio/Projects/bunubon/frontend

# Use npm-check-updates if available, otherwise manual
if command -v ncu &> /dev/null; then
    echo "Using npm-check-updates..."
    ncu -u
    npm install
else
    echo "Updating core packages..."
    npm install
fi

echo ""
echo -e "${YELLOW}[Step 4/4] GUI Controller - Update dependencies${NC}"
cd /home/gio/Projects/bunubon/gui-controller

npm install

echo ""
echo -e "${GREEN}========================================"
echo "  Update Complete!"
echo "========================================${NC}"
echo ""
echo "Running final audit..."
echo ""
echo "=== Backend Audit ==="
cd /home/gio/Projects/bunubon/backend
npm audit --audit-level=high 2>&1 | tail -20 || true

echo ""
echo -e "${YELLOW}Note: Some vulnerabilities in sqlite3 and xlsx are known issues:${NC}"
echo "  - sqlite3: Requires major version upgrade (breaking change)"
echo "  - xlsx: No fix available, consider replacing with 'sheetjs' or 'exceljs'"
echo ""
echo "To fix sqlite3 vulnerabilities, consider switching to better-sqlite3:"
echo "  npm uninstall sqlite3"
echo "  npm install better-sqlite3"
echo "  (Requires code changes)"
echo ""
