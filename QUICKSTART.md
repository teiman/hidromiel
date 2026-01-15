# Hidromiel Quick Start Guide

Get up and running with Hidromiel in 5 minutes!

## Installation

```bash
npm install
```

## Run the Application

```bash
npm start
```

## Quick Tutorial

### 1. Open the Example Savegame

1. Click **"Open Savegame"** in the top toolbar
2. Navigate to `examples/example.sav`
3. Click **Open**

You should now see 214 entities loaded!

### 2. Try the Search

In the search box at the top, try these searches:

- `monster` - See all monster entities (57 found)
- `player` - Find the player entity (1 found)
- `health` - Find all entities with health property
- `100` - Find entities with value 100

### 3. Edit an Entity

1. Click on the **player** entity in the list (usually #2)
2. In the right panel, find the **health** property
3. Change it from `53.000000` to `100`
4. Wait 1 second - it auto-saves!

### 4. View Modes

Toggle between view modes using the buttons above the entity list:

- **Block View**: Grid layout, shows first 5 properties per entity
- **Single Column**: List layout, shows all properties

### 5. Configure Settings

1. Click the **Settings** tab in the left sidebar
2. Set your Quake directory (optional for now)
3. Settings are automatically saved

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [CLAUDE.md](CLAUDE.md) for architecture and development info
- Try loading your own Quake savegames!

## Common Entity Classnames

- `worldspawn` - Map info (#1)
- `player` - Player character
- `monster_hell_knight`, `monster_knight`, etc. - Monsters
- `item_health`, `item_shells` - Items
- `trigger_teleport`, `trigger_secret` - Triggers
- `func_door`, `func_plat` - Brush entities

## Tips

- **Auto-save**: Changes save automatically after 1 second
- **File watching**: If you load `dev.sav`, Hidromiel watches for external changes
- **Property types**: The parser auto-detects numbers, vectors, and strings
- **Vector values**: Space-separated numbers (e.g., `1.5 2.0 3.5`)

## Troubleshooting

**Entities not showing?**
- Make sure you opened a valid `.sav` file
- Try the example file first: `examples/example.sav`

**Search not working?**
- Search is debounced (300ms delay)
- Type at least one character

**Can't edit?**
- Make sure you've selected an entity (click it in the list)
- Check that the file isn't read-only

## Have Fun!

You're now ready to debug your Quake mods! Edit away!
