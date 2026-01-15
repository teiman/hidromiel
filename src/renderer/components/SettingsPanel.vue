<template>
  <n-card title="Configuration" class="settings-panel">
    <n-form :model="formValue" label-placement="left" label-width="140">
      <n-form-item label="Quake Directory">
        <n-input-group>
          <n-input
            v-model:value="formValue.quakeDir"
            placeholder="C:\Quake"
            @update:value="handleQuakeDirChange"
          />
          <n-button @click="selectQuakeDir">
            Browse
          </n-button>
        </n-input-group>
      </n-form-item>

      <n-form-item label="Mod Directory">
        <n-input-group>
          <n-input
            v-model:value="formValue.modDir"
            placeholder="id1 or mod name"
            @update:value="handleModDirChange"
          />
          <n-button @click="selectModDir">
            Browse
          </n-button>
        </n-input-group>
      </n-form-item>

      <n-form-item label="Last Opened File">
        <n-input
          v-model:value="formValue.lastOpenedFile"
          readonly
          placeholder="No file opened yet"
        />
      </n-form-item>
    </n-form>

    <template #action>
      <n-space justify="end">
        <n-button @click="loadConfig">
          Reload
        </n-button>
      </n-space>
    </template>
  </n-card>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { NCard, NForm, NFormItem, NInput, NInputGroup, NButton, NSpace, useMessage } from 'naive-ui';
import { useConfig } from '../composables/useConfig';

const message = useMessage();
const { quakeDir, modDir, lastOpenedFile, loadConfig, saveConfig, selectDirectory } = useConfig();

const formValue = reactive({
  quakeDir: '',
  modDir: '',
  lastOpenedFile: ''
});

// Sync form values with config
watch([quakeDir, modDir, lastOpenedFile], () => {
  formValue.quakeDir = quakeDir.value;
  formValue.modDir = modDir.value;
  formValue.lastOpenedFile = lastOpenedFile.value;
}, { immediate: true });

const handleQuakeDirChange = async (value) => {
  const success = await saveConfig({ quakeDir: value });
  if (success) {
    message.success('Quake directory saved');
  } else {
    message.error('Failed to save Quake directory');
  }
};

const handleModDirChange = async (value) => {
  const success = await saveConfig({ modDir: value });
  if (success) {
    message.success('Mod directory saved');
  } else {
    message.error('Failed to save mod directory');
  }
};

const selectQuakeDir = async () => {
  const path = await selectDirectory({
    title: 'Select Quake Directory',
    defaultPath: formValue.quakeDir
  });

  if (path) {
    formValue.quakeDir = path;
    await handleQuakeDirChange(path);
  }
};

const selectModDir = async () => {
  const path = await selectDirectory({
    title: 'Select Mod Directory',
    defaultPath: formValue.modDir || formValue.quakeDir
  });

  if (path) {
    formValue.modDir = path;
    await handleModDirChange(path);
  }
};
</script>

<style scoped>
.settings-panel {
  max-width: 800px;
  margin: 0 auto;
}
</style>
