import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref('parchment');

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    currentTheme.value = theme;
    localStorage.setItem('theme', theme);
  }

  function toggleTheme() {
    const next = currentTheme.value === 'dark' ? 'parchment' : 'dark';
    applyTheme(next);
  }

  function loadTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'parchment') {
      applyTheme(saved);
    } else {
      applyTheme('parchment');
    }
  }

  return { currentTheme, applyTheme, toggleTheme, loadTheme };
});
