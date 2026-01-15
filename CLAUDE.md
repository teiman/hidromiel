# HIDROMIEL

A live savegame editor for debugging Quake mods. Hidromiel watches for changes to Quake savegame files and provides a powerful interface for searching, viewing, and editing game entities in real-time.

## Overview

Hidromiel is designed to streamline the Quake mod development workflow by eliminating the need to repeatedly restart the game to test changes. It monitors savegame files, loads them automatically, and allows instant editing of entity properties with intelligent autocomplete and symbolic value display.

## Features

### Configuration
- **Settings Tab**: Configure Quake installation directory and mod directory
- Persistent configuration across sessions

### File Watching
- Monitors `dev.sav` for changes
- Automatic loading when savegame is updated
- No manual refresh needed

### Entity Management
- **Advanced Search/Filter System**: Quickly find entities by classname, properties, or values
- **Multiple View Modes**:
  - Block view with multiple columns for dense information display
  - Single column view for detailed inspection
- Real-time entity listing and navigation

### Editing Capabilities
- Direct field editing with immediate feedback
- **Autocomplete Support**: Suggestions for valid values and property names
- **Symbolic Display**: Shows meaningful names instead of numeric codes (e.g., weapon names instead of item IDs)
- **Auto-save with Debouncing**: Changes are automatically saved after a brief delay to batch rapid edits

## Technology Stack

### Core
- **Electron**: Desktop application framework
- **Vue 3**: Reactive UI framework with Composition API

### Development Tools
- npm for package management and scripts
- Available commands:
  - `npm run dev` - Development mode with hot reload
  - `npm run build` - Production build
  - `npm start` - Run the application

## Project Structure

```
hidromiel/
├── examples/           # Examples (like example.sav with a savegame)
├── src/
│   ├── main/           # Electron main process (Node.js)
│   ├── renderer/       # Vue 3 frontend
│   │   ├── components/ # Vue components
│   │   ├── views/      # Application views/pages
│   │   └── stores/     # State management
│   └── shared/         # Shared types and utilities
├── public/             # Static assets
└── dist/               # Build output
```

## Key Concepts

### Quake Savegame Format
- Savegames contain serialized entity data in QuakeC format
- Each entity has classname and multiple key-value properties
- Understanding the format is crucial for parsing and editing

### Entity Properties
- `classname`: Entity type (player, monster, item, etc.)
- Position, rotation, health, flags, and custom mod properties
- Values can be integers, floats, strings, or vectors
- `think`: with a compatible method name, usuarlly from the same qc file

### Debouncing Strategy
- Multiple rapid edits trigger a single save operation
- Prevents excessive file I/O and potential corruption

## Development Guidelines

### Code Style
- Use modern JavaScript (ES modules)
- Follow Vue 3 Composition API patterns
- Prefer reactive refs and computed properties
- Keep components focused and single-purpose

### Important Configuration Notes
- `package.json` has `"type": "module"` for ES module support
- `forge.config.cjs` uses `.cjs` extension (CommonJS) since Electron Forge requires it
- `vite.main.config.mjs` and `vite.preload.config.mjs` output CommonJS format (`format: 'cjs'`)
  - This is required because Electron's main process needs CommonJS, even though source uses ES modules
- `vite.renderer.config.mjs` uses `fileURLToPath` to handle `__dirname` in ES modules
- All source files use ES module syntax (`import`/`export`)

### File Organization
- Group related functionality into composables
- Separate business logic from UI components
- Use Pinia for complex state management if needed

### Error Handling
- Validate savegame format before parsing
- Handle corrupted or incomplete files gracefully
- Provide clear error messages to users

### Performance
- Use virtual scrolling for large entity lists
- Debounce search input to avoid excessive filtering
- Cache parsed savegame data until file changes

## Workflow

1. Launch Hidromiel and configure Quake/mod directories
2. Load Quake and create a save using `dev.sav`
3. Hidromiel automatically detects and loads the savegame
4. Search/filter entities to find what you need
5. Edit properties with autocomplete assistance
6. Changes auto-save back to `dev.sav`
7. Load the savegame in Quake to test changes
8. Iterate quickly without restarting

## Future Enhancements

- Support for multiple savegame files
- Entity relationship visualization
- Undo/redo functionality
- Export/import entity templates
- Diff view for comparing savegames
- Custom entity property schemas for different mods

## Contributing

When working on Hidromiel:
- Keep the focus on developer experience
- Prioritize stability over features (savegame corruption is unacceptable)
- Test with various Quake mods and savegame sizes
- Document any Quake-specific assumptions or limitations 