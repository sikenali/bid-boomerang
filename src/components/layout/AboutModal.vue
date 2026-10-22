<script setup>
import { computed } from 'vue';
import UiModal from '../ui/UiModal.vue';
import AboutSettingsView from './AboutSettingsView.vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(['update:visible']);

const modalVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
});
</script>

<template>
  <UiModal
    v-model="modalVisible"
    title="关于回旋标"
    subtitle="文档智能处理平台"
    icon="ri-information-line"
    width="640"
    :max-width="720"
    :show-footer="false"
    :close-on-click-overlay="true"
  >
    <AboutSettingsView />
  </UiModal>
</template>
