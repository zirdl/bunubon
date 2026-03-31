# Dependency Update Guide

## Quick Update (Recommended)

### On Windows
```cmd
update-deps.bat
```

### On Linux/macOS
```bash
chmod +x update-deps.sh
./update-deps.sh
```

---

## Current Vulnerability Status ✅

### Migration to better-sqlite3 - COMPLETE!

The backend has been successfully migrated from `sqlite3` to `better-sqlite3`:

**Benefits:**
- ✅ **Faster** - Synchronous API, no callback overhead
- ✅ **More Secure** - No vulnerable transitive dependencies
- ✅ **Better API** - Prepared statements, transactions
- ✅ **Type Safe** - Better error handling

**Vulnerabilities Fixed:**
- ✅ Fixed 6 high severity vulnerabilities from `sqlite3` (tar, node-gyp, etc.)
- ✅ Removed `connect-sqlite3` dependency
- ✅ Custom session store implemented for better-sqlite3

### Remaining Issues ⚠️

| Package | Severity | Issue | Solution |
|---------|----------|-------|----------|
| **xlsx** | High (2) | Prototype Pollution, ReDoS | Replace with `exceljs` (optional) |

---

## Option 1: Accept Current Risk (Recommended for Now)

Only 1 package with vulnerabilities remains (`xlsx`), and it's used for Excel file import/export.

**Risk level:** Low (only affects file upload functionality)

---

## Option 2: Replace xlsx (Optional)

```bash
cd backend

# Remove old package
npm uninstall xlsx

# Install new package
npm install exceljs
```

**Note:** Requires code changes in files using `xlsx`.

---

## Manual Update Commands

### Update all safe packages
```bash
cd backend
npm update
```

### Fix vulnerabilities automatically
```bash
cd backend
npm audit fix
```

### Fix with breaking changes
```bash
cd backend
npm audit fix --force
```

### Check outdated packages
```bash
cd backend
npm outdated
```

---

## Update All Project Dependencies

### Backend
```bash
cd backend
npm install express@latest express-rate-limit@latest
npm audit fix
```

### Frontend
```bash
cd frontend
npm update
```

### GUI Controller
```bash
cd gui-controller
npm update
```

---

## Verify After Updates

### Run tests
```bash
cd backend
npm test
```

### Check audit status
```bash
cd backend
npm audit --audit-level=high
```

### Start the application
```bash
# From project root
npm run dev
```

---

## npm Scripts Added

### Backend (`backend/package.json`)
```bash
npm run audit        # Run npm audit
npm run audit:fix    # Fix vulnerabilities
npm run update       # Update packages
npm run outdated     # Show outdated packages
```

---

## Best Practices

1. **Update regularly** - Run `npm update` monthly
2. **Review before force** - Always check `npm audit` before `--force`
3. **Test after updates** - Run `npm test` after any update
4. **Lock versions** - Use `package-lock.json` in production
5. **Production builds** - Use `npm install --production`

---

## Troubleshooting

### "Breaking changes after update"
```bash
# Revert to previous versions
cd backend
npm install express@4.21.2 express-rate-limit@8.3.2
```

### "Tests failing after sqlite3 update"
```bash
# Try better-sqlite3 instead
npm uninstall sqlite3
npm install better-sqlite3
# Update server.js as shown above
```

### "xlsx replacement needed"
Files to update:
- Check `backend/` for `require('xlsx')` usage
- Replace with `exceljs` API

---

## Summary

| Action | Vulnerabilities | Effort | Risk |
|--------|----------------|--------|------|
| Current state | 8 (2 low, 6 high) | - | Low (internal) |
| Run `npm audit fix` | 8 (same) | Low | None |
| Replace sqlite3 | 2 (xlsx only) | Medium | Low |
| Replace both | 0 | Medium | Low |

**Recommendation:** For internal deployment, current state is acceptable. For public-facing deployment, replace `sqlite3` and `xlsx`.
