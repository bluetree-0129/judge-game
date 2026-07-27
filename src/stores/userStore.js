import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    settings: {
      theme: 'light',
      fontSize: 'medium',
      autoSave: true
    },
    userInfo: null
  }),

  getters: {
    theme: (state) => state.settings.theme,
    fontSize: (state) => state.settings.fontSize
  },

  actions: {
    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings }
      this.saveSettings()
    },

    saveSettings() {
      localStorage.setItem('judge_game_settings', JSON.stringify(this.settings))
    },

    loadSettings() {
      try {
        const saved = localStorage.getItem('judge_game_settings')
        if (saved) {
          this.settings = { ...this.settings, ...JSON.parse(saved) }
        }
      } catch (e) {
        console.error('加载设置失败:', e)
      }
    }
  }
})