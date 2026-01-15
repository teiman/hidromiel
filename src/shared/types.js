/**
 * @typedef {Object} Entity
 * @property {string} classname - Entity class name (e.g., "worldspawn", "player", "monster_hell_knight")
 * @property {Record<string, any>} properties - Key-value pairs of entity properties
 * @property {number} [entityIndex] - Index of entity in the savegame (for reference)
 */

/**
 * @typedef {Object} AppConfig
 * @property {string} quakeDir - Path to Quake installation directory
 * @property {string} modDir - Path to mod directory (relative to quakeDir or absolute)
 * @property {string} [lastOpenedFile] - Last opened savegame file path
 * @property {Object} [windowBounds] - Window size and position
 */

/**
 * @typedef {Object} SavegameData
 * @property {Entity[]} entities - Array of parsed entities
 * @property {string} filePath - Path to the savegame file
 * @property {Date} loadedAt - Timestamp when the savegame was loaded
 */

export {};
