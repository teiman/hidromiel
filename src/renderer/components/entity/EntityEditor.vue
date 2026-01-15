<template>
  <div class="entity-editor">
    <n-card v-if="entity" :title="`Edit Entity #${entity.entityIndex} - ${entity.classname}`">
      <n-space vertical :size="12">
        <n-alert v-if="isSaving" type="info" closable>
          Auto-saving changes...
        </n-alert>

        <n-form label-placement="left" label-width="160">
          <n-form-item
            v-for="[key, value] in Object.entries(entity.properties)"
            :key="key"
            :label="key"
          >
            <n-input
              :value="formatValueForInput(value)"
              @update:value="(newValue) => handlePropertyChange(key, newValue)"
              placeholder="Enter value"
            />
          </n-form-item>
        </n-form>
      </n-space>
    </n-card>

    <n-empty v-else description="Select an entity to edit" class="empty-editor">
      <template #icon>
        <n-icon :component="CreateOutline" size="48" />
      </template>
    </n-empty>
  </div>
</template>

<script setup>
import { NCard, NSpace, NForm, NFormItem, NInput, NEmpty, NIcon, NAlert } from 'naive-ui';
import { CreateOutline } from '@vicons/ionicons5';

const props = defineProps({
  entity: {
    type: Object,
    default: null
  },
  isSaving: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:property']);

const formatValueForInput = (value) => {
  if (Array.isArray(value)) {
    return value.join(' ');
  }

  return value.toString();
};

const parseInputValue = (stringValue) => {
  // Check if it's a vector (space-separated numbers)
  if (stringValue.includes(' ')) {
    const parts = stringValue.split(/\s+/);
    const allNumbers = parts.every(part => !isNaN(parseFloat(part)));

    if (allNumbers) {
      return parts.map(part => parseFloat(part));
    }
  }

  // Check if it's a single number
  const num = parseFloat(stringValue);
  if (!isNaN(num) && stringValue === num.toString()) {
    return num;
  }

  // Return as string
  return stringValue;
};

const handlePropertyChange = (key, newValue) => {
  const parsedValue = parseInputValue(newValue);
  emit('update:property', key, parsedValue);
};
</script>

<style scoped>
.entity-editor {
  height: 100%;
  overflow-y: auto;
}

.empty-editor {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
