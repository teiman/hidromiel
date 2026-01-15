import chokidar from 'chokidar';
import { EventEmitter } from 'events';
import path from 'path';

/**
 * File watcher for monitoring Quake savegame files
 * @extends EventEmitter
 */
export class SavegameWatcher extends EventEmitter {
  constructor() {
    super();
    this.watcher = null;
    this.watchPath = null;
    this.debounceTimeout = null;
    this.debounceDelay = 500; // 500ms debounce
  }

  /**
   * Start watching a savegame file
   * @param {string} filePath - Path to the savegame file to watch
   */
  watch(filePath) {
    // Stop any existing watcher
    this.stop();

    const normalizedPath = path.normalize(filePath);
    this.watchPath = normalizedPath;

    // Create new watcher
    this.watcher = chokidar.watch(normalizedPath, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100
      }
    });

    // Handle file changes with debouncing
    this.watcher.on('change', (changedPath) => {
      this.handleChange(changedPath);
    });

    this.watcher.on('error', (error) => {
      this.emit('error', error);
    });

    this.emit('watching', normalizedPath);
  }

  /**
   * Handle file change with debouncing
   * @param {string} filePath - Path to the changed file
   * @private
   */
  handleChange(filePath) {
    // Clear existing timeout
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    // Set new timeout
    this.debounceTimeout = setTimeout(() => {
      this.emit('changed', filePath);
      this.debounceTimeout = null;
    }, this.debounceDelay);
  }

  /**
   * Stop watching the current file
   */
  async stop() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }

    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      this.watchPath = null;
      this.emit('stopped');
    }
  }

  /**
   * Check if currently watching a file
   * @returns {boolean} True if watching a file
   */
  isWatching() {
    return this.watcher !== null;
  }

  /**
   * Get the currently watched file path
   * @returns {string|null} The watched file path or null
   */
  getWatchedPath() {
    return this.watchPath;
  }
}
