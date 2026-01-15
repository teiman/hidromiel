import { ipcMain } from 'electron';
import fs from 'fs/promises';
import { parseSavegame, serializeSavegame, extractHeader } from '../savegame/parser.js';

/**
 * @typedef {import('../../shared/types.js').Entity} Entity
 */

/**
 * Setup IPC handlers for communication between main and renderer processes
 * @param {import('electron').BrowserWindow} mainWindow - The main application window
 * @param {import('../savegame/watcher.js').SavegameWatcher} watcher - The file watcher instance
 * @param {import('electron-store')} store - The configuration store
 */
export function setupIpcHandlers(mainWindow, watcher, store) {
  /**
   * Load and parse a savegame file
   */
  ipcMain.handle('load-savegame', async (event, filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const entities = parseSavegame(content);
      const header = extractHeader(content);

      return {
        success: true,
        data: {
          entities,
          header,
          filePath,
          loadedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  /**
   * Save entities back to a savegame file
   */
  ipcMain.handle('save-savegame', async (event, { filePath, entities, header }) => {
    try {
      const content = serializeSavegame(entities, header);
      await fs.writeFile(filePath, content, 'utf-8');

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  /**
   * Get configuration
   */
  ipcMain.handle('get-config', async () => {
    try {
      return {
        success: true,
        data: {
          quakeDir: store.get('quakeDir', ''),
          modDir: store.get('modDir', ''),
          lastOpenedFile: store.get('lastOpenedFile', ''),
          windowBounds: store.get('windowBounds', null)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  /**
   * Set configuration
   */
  ipcMain.handle('set-config', async (event, config) => {
    try {
      if (config.quakeDir !== undefined) store.set('quakeDir', config.quakeDir);
      if (config.modDir !== undefined) store.set('modDir', config.modDir);
      if (config.lastOpenedFile !== undefined) store.set('lastOpenedFile', config.lastOpenedFile);
      if (config.windowBounds !== undefined) store.set('windowBounds', config.windowBounds);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  /**
   * Start watching a savegame file
   */
  ipcMain.handle('watch-file', async (event, filePath) => {
    try {
      watcher.watch(filePath);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  /**
   * Stop watching the current file
   */
  ipcMain.handle('stop-watch', async () => {
    try {
      await watcher.stop();
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  /**
   * Select a file using native file dialog
   */
  ipcMain.handle('select-file', async (event, options = {}) => {
    const { dialog } = await import('electron');

    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: options.title || 'Select File',
        defaultPath: options.defaultPath,
        filters: options.filters || [
          { name: 'Savegame Files', extensions: ['sav'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || result.filePaths.length === 0) {
        return {
          success: false,
          canceled: true
        };
      }

      return {
        success: true,
        filePath: result.filePaths[0]
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  /**
   * Select a directory using native file dialog
   */
  ipcMain.handle('select-directory', async (event, options = {}) => {
    const { dialog } = await import('electron');

    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: options.title || 'Select Directory',
        defaultPath: options.defaultPath,
        properties: ['openDirectory']
      });

      if (result.canceled || result.filePaths.length === 0) {
        return {
          success: false,
          canceled: true
        };
      }

      return {
        success: true,
        path: result.filePaths[0]
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });

  // Setup watcher event handlers
  watcher.on('changed', (filePath) => {
    mainWindow.webContents.send('savegame-changed', filePath);
  });

  watcher.on('error', (error) => {
    mainWindow.webContents.send('watcher-error', error.message);
  });
}
