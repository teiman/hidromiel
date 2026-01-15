/**
 * @typedef {import('../../shared/types.js').Entity} Entity
 */

/**
 * Parse a Quake savegame file content into structured entities
 * @param {string} content - The raw savegame file content
 * @returns {Entity[]} Array of parsed entities
 */
export function parseSavegame(content) {
  const entities = [];
  const lines = content.split(/\r?\n/);

  let currentEntity = null;
  let entityIndex = 0;
  let inEntity = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Start of entity block
    if (line.startsWith('{')) {
      inEntity = true;
      currentEntity = {
        classname: '',
        properties: {},
        entityIndex: entityIndex++
      };
      continue;
    }

    // End of entity block
    if (line === '}') {
      if (currentEntity && inEntity) {
        entities.push(currentEntity);
        currentEntity = null;
      }
      inEntity = false;
      continue;
    }

    // Parse property lines (format: "key" "value")
    if (inEntity && line.startsWith('"')) {
      const match = line.match(/"([^"]+)"\s+"([^"]*)"/);
      if (match) {
        const [, key, value] = match;

        // Convert value to appropriate type
        const parsedValue = parseValue(value);

        if (key === 'classname') {
          currentEntity.classname = parsedValue;
        }

        currentEntity.properties[key] = parsedValue;
      }
    }
  }

  return entities;
}

/**
 * Parse a string value to its appropriate type
 * @param {string} value - The string value to parse
 * @returns {string|number|number[]} Parsed value
 */
function parseValue(value) {
  if (value === '') {
    return '';
  }

  // Check if it's a vector (space-separated numbers)
  if (value.includes(' ')) {
    const parts = value.split(/\s+/);
    const allNumbers = parts.every(part => !isNaN(parseFloat(part)));

    if (allNumbers) {
      return parts.map(part => parseFloat(part));
    }
  }

  // Check if it's a single number
  const num = parseFloat(value);
  if (!isNaN(num) && value === num.toString()) {
    return num;
  }

  // Return as string
  return value;
}

/**
 * Serialize entities back to Quake savegame format
 * @param {Entity[]} entities - Array of entities to serialize
 * @param {string} header - The original header content (before first {)
 * @returns {string} Serialized savegame content
 */
export function serializeSavegame(entities, header = '') {
  let output = header;

  for (const entity of entities) {
    // Add entity comment if it has an index
    if (entity.entityIndex !== undefined) {
      output += `{ // #${entity.entityIndex}\n`;
    } else {
      output += '{\n';
    }

    // Write all properties
    for (const [key, value] of Object.entries(entity.properties)) {
      const serializedValue = serializeValue(value);
      output += `"${key}" "${serializedValue}"\n`;
    }

    output += '}\n';
  }

  return output;
}

/**
 * Serialize a value back to string format
 * @param {any} value - The value to serialize
 * @returns {string} Serialized value
 */
function serializeValue(value) {
  if (Array.isArray(value)) {
    return value.join(' ');
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  return value;
}

/**
 * Extract the header portion of a savegame (everything before the first entity)
 * @param {string} content - The raw savegame file content
 * @returns {string} The header content
 */
export function extractHeader(content) {
  const firstBraceIndex = content.indexOf('{');
  if (firstBraceIndex === -1) {
    return content;
  }
  return content.substring(0, firstBraceIndex);
}
