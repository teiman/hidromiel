const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose safe IPC methods to the renderer process via window.electron
 */
contextBridge.exposeInMainWorld('electron', {
  /**
   * Load and parse a savegame file
   * @param {string} filePath - Path to the savegame file
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  loadSavegame: (filePath) => ipcRenderer.invoke('load-savegame', filePath),

  /**
   * Save entities back to a savegame file
   * @param {object} params - Save parameters
   * @param {string} params.filePath - Path to save to
   * @param {Array} params.entities - Entities to save
   * @param {string} params.header - Header content
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  saveSavegame: (params) => ipcRenderer.invoke('save-savegame', params),

  /**
   * Get application configuration
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getConfig: () => ipcRenderer.invoke('get-config'),

  /**
   * Set application configuration
   * @param {object} config - Configuration object
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  setConfig: (config) => ipcRenderer.invoke('set-config', config),

  /**
   * Start watching a file for changes
   * @param {string} filePath - Path to watch
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  watchFile: (filePath) => ipcRenderer.invoke('watch-file', filePath),

  /**
   * Stop watching the current file
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  stopWatch: () => ipcRenderer.invoke('stop-watch'),

  /**
   * Select a file using native dialog
   * @param {object} options - Dialog options
   * @returns {Promise<{success: boolean, filePath?: string, canceled?: boolean, error?: string}>}
   */
  selectFile: (options) => ipcRenderer.invoke('select-file', options),

  /**
   * Select a directory using native dialog
   * @param {object} options - Dialog options
   * @returns {Promise<{success: boolean, path?: string, canceled?: boolean, error?: string}>}
   */
  selectDirectory: (options) => ipcRenderer.invoke('select-directory', options),

  /**
   * Listen for savegame file changes
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function to remove listener
   */
  onSavegameChanged: (callback) => {
    const listener = (event, filePath) => callback(filePath);
    ipcRenderer.on('savegame-changed', listener);
    return () => ipcRenderer.removeListener('savegame-changed', listener);
  },

  /**
   * Listen for watcher errors
   * @param {Function} callback - Callback function
   * @returns {Function} Cleanup function to remove listener
   */
  onWatcherError: (callback) => {
    const listener = (event, error) => callback(error);
    ipcRenderer.on('watcher-error', listener);
    return () => ipcRenderer.removeListener('watcher-error', listener);
  }
});
