import { ref, onMounted } from 'vue';

/**
 * Composable for managing application configuration
 * @returns {object} Configuration state and methods
 */
export function useConfig() {
  const quakeDir = ref('');
  const modDir = ref('');
  const lastOpenedFile = ref('');
  const isLoading = ref(false);
  const error = ref(null);

  /**
   * Load configuration from store
   */
  const loadConfig = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await window.electron.getConfig();

      if (result.success) {
        quakeDir.value = result.data.quakeDir || '';
        modDir.value = result.data.modDir || '';
        lastOpenedFile.value = result.data.lastOpenedFile || '';
      } else {
        error.value = result.error;
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Save configuration to store
   * @param {object} config - Configuration object to save
   */
  const saveConfig = async (config) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await window.electron.setConfig(config);

      if (result.success) {
        // Update local state if successful
        if (config.quakeDir !== undefined) quakeDir.value = config.quakeDir;
        if (config.modDir !== undefined) modDir.value = config.modDir;
        if (config.lastOpenedFile !== undefined) lastOpenedFile.value = config.lastOpenedFile;
      } else {
        error.value = result.error;
      }

      return result.success;
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Select a directory using native dialog
   * @param {object} options - Dialog options
   * @returns {Promise<string|null>} Selected directory path or null
   */
  const selectDirectory = async (options = {}) => {
    try {
      const result = await window.electron.selectDirectory(options);

      if (result.success && !result.canceled) {
        return result.path;
      }

      return null;
    } catch (err) {
      error.value = err.message;
      return null;
    }
  };

  // Load config on mount
  onMounted(() => {
    loadConfig();
  });

  return {
    quakeDir,
    modDir,
    lastOpenedFile,
    isLoading,
    error,
    loadConfig,
    saveConfig,
    selectDirectory
  };
}
