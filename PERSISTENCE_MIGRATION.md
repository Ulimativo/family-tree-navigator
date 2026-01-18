# Persistence Layer - Migration Summary

## What Was Removed

All SQLite WASM-based persistence code has been removed from the application:

### Deleted Files
- `src/lib/persistence/persistence.js` (SQLite implementation)
- `public/sqlite-worker.js`
- `public/test-persistence.html`
- `scripts/verify_persistence.js`

### Removed Dependencies
- `@sqlite.org/sqlite-wasm` (uninstalled from package.json)

### Code Changes
- **TreeContext.jsx**: Removed all persistence-related imports, state (`isLoading`), effects (auto-sync), and methods (`loadProject`, `listProjects`)
- **App.jsx**: Removed persistence UI (Recent Projects section), state management, and related imports
- **vite.config.js**: Removed COOP/COEP headers and SQLite optimizeDeps exclusion

## Current State

The application now operates in **Lightweight mode only**:
- ✅ Import GEDCOM files
- ✅ View and edit family trees in-browser
- ✅ Export to GEDCOM or JSON
- ✅ All data is session-only (lost on page refresh)

The `ProjectMode.PERSISTENT` option still appears in the UI but has no functional difference from `LIGHTWEIGHT` mode.

## Next Steps: Firebase Integration

A stub file has been created at `src/lib/persistence/firebase.js` with the following planned features:

### Phase 1: Firebase Setup
1. Install Firebase SDK: `npm install firebase`
2. Create Firebase project at https://console.firebase.google.com
3. Enable Firestore Database
4. Enable Authentication (Google, Email/Password)
5. Configure Firebase in the app (add credentials to `.env`)

### Phase 2: Authentication
- Implement sign-in/sign-out flows
- Add user profile management
- Update UI to show auth state

### Phase 3: Firestore Integration
- Design Firestore schema:
  ```
  users/{userId}/projects/{projectId}
    - metadata (name, mode, created, modified)
    - individuals (subcollection)
    - families (subcollection)
    - sources (subcollection)
    - media (subcollection)
    - clusters (subcollection)
  ```
- Implement CRUD operations
- Add real-time sync for collaborative editing

### Phase 4: UI Integration
- Add "Sign In" button to header
- Show user's projects on welcome screen
- Enable auto-save for PERSISTENT projects
- Add sharing/collaboration features

## Benefits of Firebase Approach

- ✅ **No browser compatibility issues** (works everywhere)
- ✅ **True cloud persistence** (access from any device)
- ✅ **Built-in authentication** (secure user management)
- ✅ **Real-time sync** (collaborative editing)
- ✅ **Scalable** (handles large projects easily)
- ✅ **Free tier** (generous limits for personal use)

## Implementation Checklist

- [ ] Set up Firebase project
- [ ] Install Firebase SDK
- [ ] Implement authentication
- [ ] Design Firestore schema
- [ ] Implement saveProject()
- [ ] Implement loadProject()
- [ ] Implement listProjects()
- [ ] Add real-time listeners
- [ ] Update TreeContext to use Firebase
- [ ] Update App.jsx with auth UI
- [ ] Test end-to-end flow
- [ ] Deploy to production

---

**Status**: Ready for Firebase implementation
**Last Updated**: 2026-01-18
