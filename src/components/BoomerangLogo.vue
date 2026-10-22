<template>
  <RiTargetLine
    :size="String(size)"
    color="var(--color-primary, #C0392B)"
    class="boomerang-logo"
  />
</template>

<script setup>
defineProps({
  size: { type: Number, default: 26 },
});
</script>

<style scoped>
.boomerang-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}
</style>
