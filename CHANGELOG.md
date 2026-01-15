# Changelog

All notable changes to Hidromiel will be documented in this file.

## [0.1.0] - 2026-01-09

### Initial Release

#### Framework Setup
- ✅ Electron + Vue 3 + Vite build system
- ✅ Naive UI component library with dark theme
- ✅ ES modules throughout the codebase

#### Core Features
- ✅ Quake savegame parser (parse and serialize .sav files)
- ✅ Entity list with search/filter functionality
- ✅ Two view modes: block grid and single column
- ✅ Entity property editor with auto-save (1s debounce)
- ✅ File watcher for automatic reload on external changes
- ✅ Configuration persistence (Electron Store)
- ✅ Native file dialogs for opening files and selecting directories

#### Components
- ✅ MainView - Main application layout with split panels
- ✅ SettingsPanel - Configuration UI
- ✅ EntityList - Searchable entity list with view mode toggle
- ✅ EntityEditor - Property editor with type detection

#### Technical Implementation
- ✅ IPC communication with secure preload bridge
- ✅ Vue 3 Composition API with composables
- ✅ Debounced search (300ms)
- ✅ Auto-save with debouncing (1000ms)
- ✅ Chokidar for reliable file watching on Windows

### Fixed
- 🔧 **Critical**: Configure Vite to output CommonJS for main process
  - Added `format: 'cjs'` to `vite.main.config.mjs` and `vite.preload.config.mjs`
  - Fixes "require is not defined in ES module scope" error
  - Allows source files to use ES modules while output uses CommonJS for Electron
- 🔧 Rename `forge.config.js` to `forge.config.cjs` for Electron Forge compatibility
- 🔧 Add `fileURLToPath` to `vite.renderer.config.mjs` for ES module `__dirname` support

### Testing
- ✅ Tested with `examples/example.sav`
- ✅ Successfully parsed 214 entities (1 player, 57 monsters)
- ✅ Build process verified (production package works)
- ✅ Application launches and runs without errors

### Known Issues
- ⚠️ Dev mode (`npm start`) may show "build canceled" on Windows
  - **Workaround**: Use `npm run package` and run the packaged app
  - Does not affect functionality
- ℹ️ Chokidar shows "Stats imported but never used" warning
  - Harmless warning from external dependency

### Documentation
- 📖 README.md - Complete user guide
- 📖 QUICKSTART.md - 5-minute getting started guide
- 📖 CLAUDE.md - Architecture and development guidelines
- 📖 STATUS.md - Current project status
- 📖 CHANGELOG.md - This file

## [Unreleased]

### Planned Features
- Autocomplete for entity property values
- Symbolic display for numeric values (weapon IDs, flags)
- Undo/redo functionality
- Entity relationship visualization
- Multiple savegame file support
- Diff view for comparing savegames
- Custom entity schemas per mod
- Virtual scrolling for very large entity lists
