import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseSavegame, serializeSavegame, extractHeader } from '../src/main/savegame/parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const examplesDir = path.join(__dirname, '../examples');
const tempDir = path.join(__dirname, '../temp');

/**
 * Ensure temp directory exists
 */
function ensureTempDir() {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
}

/**
 * Get all .sav files from examples directory
 */
function getAllSavegames() {
  const files = fs.readdirSync(examplesDir);
  return files.filter(file => file.endsWith('.sav')).sort();
}

/**
 * Deep equality check for entity properties
 */
function deepEqual(a, b) {
  // Handle arrays (vectors like origin, angles)
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
  }

  // Direct comparison for numbers and strings
  return a === b;
}

/**
 * Check if two entity arrays match
 */
function entitiesMatch(original, reparsed) {
  // Check entity count
  if (original.length !== reparsed.length) {
    return {
      match: false,
      error: `Entity count mismatch: expected ${original.length}, got ${reparsed.length}`
    };
  }

  // Compare each entity
  for (let i = 0; i < original.length; i++) {
    const a = original[i];
    const b = reparsed[i];

    // Check classname
    if (a.classname !== b.classname) {
      return {
        match: false,
        error: `Entity #${i} classname mismatch: expected "${a.classname}", got "${b.classname}"`
      };
    }

    // Check property count
    const keysA = Object.keys(a.properties);
    const keysB = Object.keys(b.properties);
    if (keysA.length !== keysB.length) {
      return {
        match: false,
        error: `Entity #${i} (${a.classname}) property count mismatch: expected ${keysA.length}, got ${keysB.length}`
      };
    }

    // Check each property value
    for (const key of keysA) {
      if (!deepEqual(a.properties[key], b.properties[key])) {
        return {
          match: false,
          error: `Entity #${i} (${a.classname}) property "${key}" mismatch: expected ${JSON.stringify(a.properties[key])}, got ${JSON.stringify(b.properties[key])}`
        };
      }
    }
  }

  return { match: true };
}

/**
 * Validate a single savegame file
 */
function validateSavegame(filename) {
  const originalPath = path.join(examplesDir, filename);
  const tempPath = path.join(tempDir, filename);

  try {
    // Read original file
    const originalContent = fs.readFileSync(originalPath, 'utf8');

    // Parse original
    const originalEntities = parseSavegame(originalContent);
    const header = extractHeader(originalContent);

    // Serialize
    const serialized = serializeSavegame(originalEntities, header);

    // Write to temp
    fs.writeFileSync(tempPath, serialized, 'utf8');

    // Re-parse from temp file
    const reparsedContent = fs.readFileSync(tempPath, 'utf8');
    const reparsedEntities = parseSavegame(reparsedContent);

    // Compare entities
    const comparison = entitiesMatch(originalEntities, reparsedEntities);

    if (comparison.match) {
      return {
        success: true,
        entityCount: originalEntities.length
      };
    } else {
      return {
        success: false,
        error: comparison.error,
        entityCount: originalEntities.length
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

/**
 * Main validation function
 */
function main() {
  console.log('Validating savegames...');
  console.log('━'.repeat(60));
  console.log('');

  // Ensure temp directory exists
  ensureTempDir();

  // Get all savegame files
  const savegames = getAllSavegames();

  if (savegames.length === 0) {
    console.log('No savegame files found in examples/');
    process.exit(1);
  }

  // Validate each file
  const results = [];
  for (const filename of savegames) {
    const result = validateSavegame(filename);
    results.push({ filename, ...result });

    if (result.success) {
      console.log(`✓ ${filename} (${result.entityCount} entities)`);
    } else {
      console.log(`✗ ${filename} - ERROR: ${result.error}`);
      if (result.stack && process.argv.includes('--verbose')) {
        console.log(`  Stack: ${result.stack}`);
      }
    }
  }

  // Summary
  console.log('');
  console.log('━'.repeat(60));
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`Results: ${passed}/${total} passed`);

  // Exit with appropriate code
  if (passed === total) {
    console.log('All validations passed! ✓');
    process.exit(0);
  } else {
    console.log(`${total - passed} validation(s) failed.`);
    process.exit(1);
  }
}

// Run main
main();
