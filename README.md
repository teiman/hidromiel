# Hidromiel

A live savegame editor for debugging Quake mods. Hidromiel watches for changes to Quake savegame files and provides a powerful interface for searching, viewing, and editing game entities in real-time.


## Features

- **Live File Watching**: Automatically detects changes to `dev.sav` and reloads entities
- **Powerful Search**: Filter entities by classname, properties, or values with real-time search
- **Multiple View Modes**:
  - Block view for quick overview of multiple entities
  - Single column view for detailed inspection
- **Entity Editor**: Edit any entity property with automatic type detection
- **Auto-save**: Changes are automatically saved with debouncing to prevent excessive file writes
- **Configuration Management**: Persistent settings for Quake directory, mod directory, and window state

## Technology Stack

- **Electron** - Desktop application framework
- **Vue 3** - Reactive UI with Composition API
- **Naive UI** - Modern component library
- **Vite** - Fast build tooling
- **Chokidar** - Reliable file watching (especially on Windows)
- **Electron Store** - Persistent configuration

## Installation

### Prerequisites

- Node.js 18 or higher
- npm 8 or higher

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd hidromiel

# Install dependencies
npm install
```

## Development

```bash
# Start the development server
npm start

# Or use the alias
npm run dev
```

The application will launch with:
- Hot module replacement for Vue components
- DevTools open for debugging
- File watching enabled

**Note for Windows users**: If you encounter issues with the dev server, you can run the packaged version instead:

```bash
# Build and run the packaged app
npm run package
./out/Hidromiel-win32-x64/Hidromiel.exe
```

## Building

```bash
# Package the application
npm run package

# Create distributables (installers, etc.)
npm run make
```

The packaged app will be in the `out/` directory.

## Usage

### 1. Configure Directories

When you first launch Hidromiel:

1. Open the Settings tab in the left sidebar
2. Set your Quake installation directory (e.g., `C:\Quake`)
3. Set your mod directory (e.g., `id1` or your mod name)

These settings are saved and persist across sessions.

### 2. Load a Savegame

Click **"Open Savegame"** in the top toolbar and select a `.sav` file, or navigate to the example:

```
examples/example.sav
```

The application will:
- Parse all entities from the savegame
- Display them in the entity list
- Start watching the file for changes

### 3. Browse Entities

**Search**: Type in the search box to filter by:
- Classname (e.g., "monster", "player", "trigger")
- Property names (e.g., "health", "origin")
- Property values (e.g., "100", "progs/player.mdl")

**View Modes**:
- **Block View**: Grid layout showing multiple entities with key properties
- **Single Column**: List layout showing all properties for each entity

**Select**: Click any entity card to select it for editing

### 4. Edit Entities

When an entity is selected, the right panel shows all its properties:

- Click any field to edit
- Values are automatically parsed:
  - Numbers remain as numbers
  - Vectors (space-separated numbers) remain as arrays
  - Strings remain as strings
- Changes trigger auto-save after 1 second of inactivity

### 5. Auto-save

Hidromiel automatically saves changes after you stop editing (1 second debounce). You can also:

- Click **"Save Now"** to force an immediate save
- Watch the "Auto-saving changes..." notification

### 6. File Watching

If `dev.sav` changes externally (e.g., Quake saves the game):

1. Hidromiel detects the change
2. Automatically reloads the savegame
3. Updates the entity list
4. Preserves your current selection if possible

## Project Structure

```
hidromiel/
├── examples/              # Example savegame files
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.js        # Entry point
│   │   ├── preload.js     # IPC bridge (secure)
│   │   ├── savegame/      # Savegame handling
│   │   │   ├── parser.js  # Parse/serialize .sav files
│   │   │   └── watcher.js # File watching with debounce
│   │   └── ipc/           # IPC handlers
│   │       └── handlers.js
│   ├── renderer/          # Vue 3 frontend
│   │   ├── main.js        # Vue app entry
│   │   ├── App.vue        # Root component
│   │   ├── components/    # Reusable components
│   │   │   ├── SettingsPanel.vue
│   │   │   └── entity/
│   │   │       ├── EntityList.vue
│   │   │       └── EntityEditor.vue
│   │   ├── views/         # Page components
│   │   │   └── MainView.vue
│   │   └── composables/   # Vue composables
│   │       ├── useConfig.js
│   │       └── useSavegame.js
│   └── shared/            # Shared code
│       └── types.js       # JSDoc type definitions
├── public/                # Static assets
├── forge.config.js        # Electron Forge configuration
├── vite.*.config.mjs      # Vite configuration
└── package.json
```

## Quake Savegame Format

Quake savegames are text files with a specific structure:

```
[Header section - game state, stats, map info]

{ // Global variables
"time" "123.456"
"mapname" "e1m1"
...
}

{ // #0 - First entity
"classname" "worldspawn"
"model" "maps/e1m1.bsp"
...
}

{ // #1 - Second entity
"classname" "player"
"health" "100.000000"
"origin" "0.0 0.0 24.0"
...
}
```

### Property Types

- **Strings**: Text values (e.g., classnames, model paths)
- **Numbers**: Float values (e.g., health, time)
- **Vectors**: Space-separated floats (e.g., origin, angles)

Hidromiel automatically detects and preserves these types.

## Development Guidelines

### Code Style

- Use modern JavaScript (ES modules)
- Follow Vue 3 Composition API patterns
- Use JSDoc for type hints
- Keep components focused and single-purpose

### File Organization

- Group related functionality into composables
- Separate business logic from UI components
- Use Naive UI components consistently

### Error Handling

- Validate savegame format before parsing
- Handle corrupted or incomplete files gracefully
- Provide clear error messages to users

## Troubleshooting

### Application won't start

```bash
# Clear the build cache
rm -rf .vite
rm -rf out

# Reinstall dependencies
rm -rf node_modules
npm install

# Try again
npm start
```

### Savegame won't load

- Ensure the file is a valid Quake savegame (text format, not binary)
- Check that the file isn't corrupted
- Try the example file: `examples/example.sav`

### File watching not working

- Ensure you have read/write permissions for the savegame file
- Try manually saving to trigger a reload
- Check the Info tab for error messages

### Changes not saving

- Check that you have write permissions for the savegame file
- Ensure Quake isn't currently writing to the file
- Try using "Save Now" instead of relying on auto-save

## Contributing

Contributions are welcome! Please:

1. Keep the focus on developer experience
2. Prioritize stability over features (savegame corruption is unacceptable)
3. Test with various Quake mods and savegame sizes
4. Document any Quake-specific assumptions or limitations

## Roadmap

- [ ] Support for multiple savegame files
- [ ] Entity relationship visualization
- [ ] Undo/redo functionality
- [ ] Export/import entity templates
- [ ] Diff view for comparing savegames
- [ ] Custom entity property schemas for different mods
- [ ] Autocomplete for common property values
- [ ] Symbolic display for numeric values (weapon IDs, flags, etc.)

## License

MIT

## Credits

Built with [Electron Forge](https://www.electronforge.io/), [Vue 3](https://vuejs.org/), and [Naive UI](https://www.naiveui.com/).
