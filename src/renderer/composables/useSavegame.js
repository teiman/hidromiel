import { ref, computed, onMounted, onUnmounted } from 'vue';

/**
 * Composable for managing savegame state and operations
 * @returns {object} Savegame state and methods
 */
export function useSavegame() {
  const entities = ref([]);
  const header = ref('');
  const filePath = ref('');
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref(null);
  const searchQuery = ref('');
  const selectedEntityIndex = ref(null);

  // Auto-save debounce
  let saveTimeout = null;
  const SAVE_DEBOUNCE_MS = 1000;

  /**
   * Filtered entities based on search query
   */
  const filteredEntities = computed(() => {
    if (!searchQuery.value) {
      return entities.value;
    }

    const query = searchQuery.value.toLowerCase();

    return entities.value.filter(entity => {
      // Search in classname
      if (entity.classname.toLowerCase().includes(query)) {
        return true;
      }

      // Search in property keys and values
      for (const [key, value] of Object.entries(entity.properties)) {
        if (key.toLowerCase().includes(query)) {
          return true;
        }

        if (value && value.toString().toLowerCase().includes(query)) {
          return true;
        }
      }

      return false;
    });
  });

  /**
   * Currently selected entity
   */
  const selectedEntity = computed(() => {
    if (selectedEntityIndex.value === null) return null;
    return entities.value.find(e => e.entityIndex === selectedEntityIndex.value);
  });

  /**
   * Load a savegame file
   * @param {string} path - Path to the savegame file
   */
  const loadSavegame = async (path) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await window.electron.loadSavegame(path);

      if (result.success) {
        entities.value = result.data.entities;
        header.value = result.data.header;
        filePath.value = result.data.filePath;

        // Save as last opened file
        await window.electron.setConfig({ lastOpenedFile: path });

        // Start watching the file
        await window.electron.watchFile(path);

        return true;
      } else {
        error.value = result.error;
        return false;
      }
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Save the current savegame
   */
  const saveSavegame = async () => {
    if (!filePath.value) return false;

    isSaving.value = true;
    error.value = null;

    try {
      const result = await window.electron.saveSavegame({
        filePath: filePath.value,
        entities: entities.value,
        header: header.value
      });

      if (result.success) {
        return true;
      } else {
        error.value = result.error;
        return false;
      }
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * Trigger auto-save with debouncing
   */
  const autoSave = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      saveSavegame();
    }, SAVE_DEBOUNCE_MS);
  };

  /**
   * Update an entity property
   * @param {number} entityIndex - Index of the entity
   * @param {string} key - Property key
   * @param {any} value - New value
   */
  const updateEntityProperty = (entityIndex, key, value) => {
    const entity = entities.value.find(e => e.entityIndex === entityIndex);

    if (entity) {
      entity.properties[key] = value;

      // Update classname if that's what was changed
      if (key === 'classname') {
        entity.classname = value;
      }

      // Trigger auto-save
      autoSave();
    }
  };

  /**
   * Select a file using native dialog
   * @returns {Promise<string|null>} Selected file path or null
   */
  const selectFile = async () => {
    try {
      const result = await window.electron.selectFile({
        title: 'Open Savegame',
        filters: [
          { name: 'Savegame Files', extensions: ['sav'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.success && !result.canceled) {
        return result.filePath;
      }

      return null;
    } catch (err) {
      error.value = err.message;
      return null;
    }
  };

  /**
   * Load a file selected via dialog
   */
  const loadFileFromDialog = async () => {
    const path = await selectFile();

    if (path) {
      await loadSavegame(path);
    }
  };

  // Setup listeners for file changes
  let removeChangeListener = null;
  let removeErrorListener = null;

  onMounted(async () => {
    // Load last opened file automatically
    try {
      const configResult = await window.electron.getConfig();
      if (configResult.success && configResult.data.lastOpenedFile) {
        await loadSavegame(configResult.data.lastOpenedFile);
      }
    } catch (err) {
      // Silently fail if auto-load doesn't work
      console.log('Could not auto-load last file:', err);
    }

    // Listen for file changes
    removeChangeListener = window.electron.onSavegameChanged(async (changedPath) => {
      if (changedPath === filePath.value) {
        // Reload the savegame
        await loadSavegame(changedPath);
      }
    });

    // Listen for watcher errors
    removeErrorListener = window.electron.onWatcherError((err) => {
      error.value = err;
    });
  });

  onUnmounted(() => {
    // Clear save timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Remove listeners
    if (removeChangeListener) removeChangeListener();
    if (removeErrorListener) removeErrorListener();
  });

  return {
    entities,
    filteredEntities,
    selectedEntity,
    selectedEntityIndex,
    header,
    filePath,
    isLoading,
    isSaving,
    error,
    searchQuery,
    loadSavegame,
    saveSavegame,
    updateEntityProperty,
    selectFile,
    loadFileFromDialog
  };
}
