# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Family Tree Navigator is a privacy-focused genealogy web application built with React and Vite. It provides GEDCOM 7.0 import/export, interactive tree visualization, dynasty/cluster analysis, and comprehensive statistics. Currently operates in browser-only mode; Firebase cloud persistence is planned but not yet implemented.

## Development Commands

### Essential Commands
```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build
npm preview
```

### No Testing or Linting
This project currently has no test suite or linting configuration.

## Architecture

### Data Flow & State Management

**Core Context: TreeContext** (`src/context/TreeContext.jsx`)
- Manages entire genealogy data model as a `Project` instance
- Provides GEDCOM import via `loadGedcom(content, mode, name)`
- All mutations use `ProjectMutator` pattern for immutability
- State includes: `data` (Project), `focalPersonId`, `selectedPersonId`, `isDirty`

**Mutation Pattern**:
```javascript
// All updates follow this pattern
setData(prevProject => {
    const mutator = new ProjectMutator(prevProject);
    mutator.updateIndividual(id, updates);
    return mutator.getProject();
});
```

**Theme System**: `ThemeContext.jsx` manages UI theming (separate from tree data)

### GEDCOM Data Models (`src/lib/gedcom/models.js`)

**Core Entities**:
- `Individual`: Names (structured: given, surname, prefix, suffix), events, attributes, family links
- `Family`: Husband/wife IDs, children IDs, marriage events
- `Source`, `Media`, `Repository`, `SharedNote`: Standard GEDCOM entities
- `Cluster`: Dynasty/group management with inheritance rules

**Project Container**:
- `Project`: Top-level container with `ProjectMode` (LIGHTWEIGHT vs PERSISTENT)
- Currently PERSISTENT mode is non-functional (awaiting Firebase implementation)

### GEDCOM Processing Pipeline

1. **Parser** (`src/lib/gedcom/parser.js`):
   - Handles GEDCOM 5.5.1 and 7.0
   - Builds hierarchical node tree, then populates model objects
   - Deep nesting support for complex attributes (140+ GEDCOM tags)

2. **Mutations** (`src/lib/gedcom/mutations.js`):
   - `ProjectMutator` class provides immutable updates
   - Methods: `updateIndividual`, `addChild`, `addSpouse`, `addParent`, `addEvent`, `updateEvent`, `deleteEvent`
   - Uses deep cloning with Maps for fast lookups

3. **Exporter** (`src/lib/gedcom/exporter.js`):
   - Exports to GEDCOM 7.0 format
   - Preserves extended attributes and complex structures
   - Round-trip fidelity (import → modify → export without data loss)

4. **Constants & Schema** (`src/lib/gedcom/constants.js`, `schema.js`):
   - Localized labels for 140+ GEDCOM tags
   - Tag definitions, validation rules

### Analysis & Clustering

**Clustering** (`src/lib/analysis/clustering.js`):
- Dynasty/surname/geographic/genetic cluster management
- Succession calculation (primogeniture, male-preference)
- Root-finding and lineage tracing

**Statistics** (`src/lib/analysis/statistics.js`):
- Demographics, longevity analysis, surname distribution
- Event timeline generation

### Component Architecture

**Tree Visualization** (`src/components/Tree/TreeView.jsx`):
- D3-based interactive family tree
- Uses `focalPersonId` to center view

**Profile & Timeline** (`src/components/Profile/ProfileView.jsx`, `Visualization/TimelineView.jsx`):
- Display individual details and life events
- GEDCOM 7.0 tag awareness

**Clustering UI** (`src/components/Clustering/`):
- `ClusterManager.jsx`: Create/edit dynasties
- `DynastyDashboard.jsx`: Succession lines and inheritance rules

**Navigation** (`src/components/Navigation/PersonSidebar.jsx`):
- Person search and tree navigation

**Welcome Screen** (`src/components/UI/WelcomeScreen.jsx`):
- GEDCOM import with mode selection (LIGHTWEIGHT/PERSISTENT)

### Persistence Layer (Planned)

**Current State**:
- SQLite WASM implementation was removed (see `PERSISTENCE_MIGRATION.md`)
- Application is session-only (data lost on refresh)
- Stub exists at `src/lib/persistence/firebase.js` for future Firebase integration

**Firebase Migration Checklist** (from `PERSISTENCE_MIGRATION.md`):
- Authentication, Firestore schema design, CRUD operations, auto-save

## Important Implementation Details

### GEDCOM Tag Handling
- Names are structured: `{ value, type, given, surname, prefix, suffix, nickname }`
- Events have: `{ tag, date, place, note, type, cause, sources }`
- Attributes use GEDCOM standard tags: CAST, DSCR, EDUC, OCCU, RELI, etc.

### ID Format
- All entity IDs use GEDCOM format: `@I123@` (Individual), `@F456@` (Family), `@S789@` (Source)
- Generated via `generateId()` in mutations.js

### Family Relationships
- Individuals link to families via `familyAsChild` (birth family) and `familyAsSpouse[]` (marriages)
- Families link to individuals via `husband`, `wife`, `children[]`

### Cluster System
- Clusters can represent dynasties, surnames, geographic groups, genetic lineages
- Each cluster has: `id`, `name`, `type`, `personIds` (Set), `familyIds` (Set)
- Inheritance rules: `InheritanceType.AGNATIC` (male-line) vs `COGNATIC` (all descendants)
- Succession laws: `PRIMOGENITURE_ABSOLUTE`, `PRIMOGENITURE_MALE_PREFERENCE`

## Data Files

### Development Data (`data_dev/`)
- `Ahnen_Raab_Hauptdaten_050421_MFT.ged`: Test GEDCOM file
- `gedcom_attribute_table.csv`: Tag reference
- `gedcom7-rc.pdf`: GEDCOM 7.0 specification

### Schema Generation (`scripts/`)
- `gen_schema.cjs`: Generates GEDCOM schema from spec
- `verify_gedcom7.js`: Validates GEDCOM conformance

### Root Files
- `gedcom7_structures.txt`: GEDCOM 7.0 structure definitions
- `test-parser.js`: Standalone parser testing script

## Styling

CSS is organized by feature:
- `global.css`: Base styles and CSS variables
- `theme.css`: Parchment theme (classic genealogy aesthetic)
- Feature-specific: `tree.css`, `profile.css`, `clustering.css`, `statistics.css`, `timeline.css`, etc.

Uses CSS variables extensively for theming (`--parchment-bg`, `--ink-primary`, etc.)

## Common Patterns

### Adding a New Feature to an Individual
1. Update `Individual` model in `models.js`
2. Add parsing logic in `parser.js` (within `parseIndividual()`)
3. Add export logic in `exporter.js` (within `writeIndividual()`)
4. Add mutation method in `mutations.js` if editing is needed
5. Update UI components to display/edit the feature

### Creating a New Analysis
1. Add function to `src/lib/analysis/statistics.js` or `clustering.js`
2. Create visualization component in `src/components/Visualization/`
3. Add corresponding CSS file in `src/styles/`
4. Integrate into UI (typically via sidebar or dashboard)

### Working with TreeContext
Always use callbacks from context, never mutate `data` directly:
```javascript
const { data, updatePerson, addRelative, addEvent } = useTreeContext();
```

## Known Limitations

- No persistence (session-only until Firebase integration)
- No media file handling (URLs/paths only)
- No collaborative editing
- No undo/redo
- Limited validation on user input
- No search beyond basic person filtering
