<template>
  <div class="entity-list">
    <div class="search-header">
      <n-space justify="space-between" align="center">
        <n-input
          v-model:value="localSearchQuery"
          placeholder="Search entities (classname, properties, values...)"
          clearable
          style="flex: 1"
        >
          <template #prefix>
            <n-icon :component="SearchIcon" />
          </template>
        </n-input>

        <n-button-group>
          <n-button
            :type="viewMode === 'cell' ? 'primary' : 'default'"
            @click="viewMode = 'cell'"
          >
            Cell View
          </n-button>
          <n-button
            :type="viewMode === 'block' ? 'primary' : 'default'"
            @click="viewMode = 'block'"
          >
            Block View
          </n-button>
          <n-button
            :type="viewMode === 'list' ? 'primary' : 'default'"
            @click="viewMode = 'list'"
          >
            List
          </n-button>
        </n-button-group>
      </n-space>

      <n-divider style="margin: 12px 0" />

      <div class="entity-count">
        <n-text depth="3">
          Showing {{ filteredEntities.length }} of {{ entities.length }} entities
        </n-text>
      </div>
    </div>

    <div v-if="filteredEntities.length === 0" class="empty-state">
      <n-empty description="No entities found">
        <template #icon>
          <n-icon :component="SearchIcon" size="48" />
        </template>
      </n-empty>
    </div>

    <!-- List View Mode (Summary by classname) -->
    <div v-else-if="viewMode === 'list'" class="entities-container list-view">
      <div
        v-for="[classname, count] in classnameSummary"
        :key="classname"
        class="list-item"
      >
        <span class="list-classname">{{ classname || '(no classname)' }}</span>
        <span class="list-count">{{ count }}</span>
      </div>
    </div>

    <!-- Cell View Mode -->
    <div v-else-if="viewMode === 'cell'" class="entities-container cell-view">
      <n-tooltip
        v-for="entity in filteredEntities"
        :key="entity.entityIndex"
        placement="top"
      >
        <template #trigger>
          <div
            class="entity-cell"
            :class="{
              'selected': selectedEntityIndex === entity.entityIndex,
              'empty': !entity.classname
            }"
            :style="{ backgroundColor: getClassnameColor(entity.classname) }"
            @click="selectEntity(entity.entityIndex)"
          >
            <span v-if="!entity.classname" class="empty-indicator"> </span>
            <span v-if="entity.classname">{{ entity.classname[0] }}</span>
          </div>
        </template>
        <span>#{{ entity.entityIndex }} - {{ entity.classname || 'No classname' }}</span>
      </n-tooltip>
    </div>

    <!-- Block View Mode -->
    <div v-else-if="viewMode === 'block'" class="entities-container block-view">
      <n-card
        v-for="entity in filteredEntities"
        :key="entity.entityIndex"
        :title="`#${entity.entityIndex} - ${entity.classname}`"
        size="small"
        class="entity-card"
        :class="{ 'selected': selectedEntityIndex === entity.entityIndex }"
        hoverable
        @click="selectEntity(entity.entityIndex)"
      >
        <n-space vertical :size="4">
          <div
            v-for="[key, value] in Object.entries(entity.properties).slice(0, 5)"
            :key="key"
            class="property-row"
          >
            <n-text depth="3" class="property-key">{{ key }}:</n-text>
            <n-text class="property-value">{{ formatValue(value) }}</n-text>
          </div>
          <n-text
            v-if="Object.keys(entity.properties).length > 5"
            depth="3"
            italic
          >
            ... {{ Object.keys(entity.properties).length - 5 }} more properties
          </n-text>
        </n-space>
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import {
  NSpace,
  NInput,
  NButton,
  NButtonGroup,
  NCard,
  NText,
  NEmpty,
  NDivider,
  NIcon,
  NTooltip
} from 'naive-ui';
import { SearchOutline as SearchIcon } from '@vicons/ionicons5';

const props = defineProps({
  entities: {
    type: Array,
    required: true
  },
  filteredEntities: {
    type: Array,
    required: true
  },
  searchQuery: {
    type: String,
    default: ''
  },
  selectedEntityIndex: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['update:searchQuery', 'update:selectedEntityIndex']);

const viewMode = ref('cell');//Modo cell by default
const localSearchQuery = ref(props.searchQuery);

// Debounced search
let searchTimeout = null;
watch(localSearchQuery, (newValue) => {
  if (searchTimeout) clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    emit('update:searchQuery', newValue);
  }, 300);
});

const selectEntity = (index) => {
  emit('update:selectedEntityIndex', index);
};

/**
 * Compute summary of entities grouped by classname
 * Returns array of [classname, count] pairs sorted alphabetically by classname
 */
const classnameSummary = computed(() => {
  const counts = new Map();

  for (const entity of props.filteredEntities) {
    const classname = entity.classname || '';
    counts.set(classname, (counts.get(classname) || 0) + 1);
  }

  // Convert to array and sort alphabetically by classname
  return Array.from(counts.entries()).sort((a, b) => {
    const nameA = a[0] || '';
    const nameB = b[0] || '';
    return nameA.localeCompare(nameB);
  });
});

const formatValue = (value) => {
  if (Array.isArray(value)) {
    return value.join(' ');
  }

  if (typeof value === 'number') {
    return value.toFixed(6).replace(/\.?0+$/, '');
  }

  if (value === '') {
    return '(empty)';
  }

  return value;
};

/**
 * Generate a consistent color for a classname using a simple hash
 */
const getClassnameColor = (classname) => {
  if (!classname) {
    return 'transparent'; // Transparent for empty classnames (hollow squares)
  }

  // Simple hash function to generate a number from the string
  let hash = 0;
  for (let i = 0; i < classname.length; i++) {
    hash = classname.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Generate HSL color with good saturation and lightness for visibility
  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
  const lightness = 45 + (Math.abs(hash >> 8) % 15); // 45-60%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
</script>

<style scoped>
.entity-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-header {
  flex-shrink: 0;
  padding-bottom: 8px;
}

.entity-count {
  padding: 0 4px;
}

.entities-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px;
  min-height: 0;
}

.entities-container.cell-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, 32px);
  gap: 4px;
  align-content: start;
  padding: 8px;
}

.entities-container.block-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  align-content: start;
}

.entities-container.list-view {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
}

.list-item {
  padding: 4px 8px;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
  display: grid;
  grid-template-columns: minmax(0, max-content) auto;
  gap: 8px;
  align-items: center;
  max-width: 600px;
}

.list-classname {
  white-space: nowrap;
}

.list-count {
  color: var(--n-text-color-depth-3);
  text-align: right;
}

.entity-card {
  cursor: pointer;
  transition: all 0.2s;
}

.entity-card.selected {
  border-color: var(--n-border-color-active);
  box-shadow: 0 0 0 2px var(--n-border-color-active);
}

.property-row {
  display: flex;
  gap: 8px;
  font-size: 13px;
  line-height: 1.4;
}

.property-key {
  flex-shrink: 0;
  font-weight: 500;
  min-width: 120px;
}

.property-value {
  word-break: break-all;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Cell view specific styles */
.entity-cell {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
}

.entity-cell.empty {
  border: 2px solid rgba(255, 255, 255, 0.3);
  background-color: transparent !important;
}

.entity-cell:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.entity-cell.selected {
  border-color: #ffffff;
  box-shadow: 0 0 0 2px #ffffff, 0 0 8px rgba(255, 255, 255, 0.5);
  transform: scale(1.2);
  z-index: 20;
}

.empty-indicator {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  font-weight: bold;
}
</style>
