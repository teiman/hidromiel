<template>
  <n-layout class="main-layout">
    <n-layout-header bordered class="header">
      <n-space justify="space-between" align="center" style="height: 100%">
        <n-text strong style="font-size: 18px">Hidromiel</n-text>

        <n-space>
          <n-button @click="loadFileFromDialog" :loading="isLoading">
            Open Savegame
          </n-button>

          <n-button
            v-if="filePath"
            @click="saveSavegame"
            :loading="isSaving"
            type="primary"
          >
            Save Now
          </n-button>

          <n-text v-if="filePath" depth="3" style="font-size: 12px">
            {{ filePath }}
          </n-text>
        </n-space>
      </n-space>
    </n-layout-header>

    <n-layout-content content-style="padding: 16px; height: calc(100vh - 64px);">
      <n-split direction="horizontal" :default-size="0.5">
        <template #1>
          <EntityList
            :entities="entities"
            :filtered-entities="filteredEntities"
            v-model:search-query="searchQuery"
            v-model:selected-entity-index="selectedEntityIndex"
          />
        </template>

        <template #2>
          <EntityEditor
            :entity="selectedEntity"
            :is-saving="isSaving"
            @update:property="handlePropertyUpdate"
          />
        </template>
      </n-split>
    </n-layout-content>
  </n-layout>
</template>

<script setup>
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NSpace,
  NButton,
  NText,
  NSplit
} from 'naive-ui';
import EntityList from '../components/entity/EntityList.vue';
import EntityEditor from '../components/entity/EntityEditor.vue';
import { useSavegame } from '../composables/useSavegame';

const {
  entities,
  filteredEntities,
  selectedEntity,
  selectedEntityIndex,
  filePath,
  isLoading,
  isSaving,
  error,
  searchQuery,
  saveSavegame,
  updateEntityProperty,
  loadFileFromDialog
} = useSavegame();

const handlePropertyUpdate = (key, value) => {
  if (selectedEntity.value) {
    updateEntityProperty(selectedEntity.value.entityIndex, key, value);
  }
};
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
}
</style>
