import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMineBoardStore = defineStore('mineBoard', () => {
  // 当前活跃菜单 - 从 localStorage 恢复或使用默认值
  const savedMenu = typeof window !== 'undefined' ? localStorage.getItem('mine_active_menu') : null
  const activeMenu = ref(savedMenu || 'info')

  // 设置活跃菜单
  const setActiveMenu = (menu) => {
    activeMenu.value = menu
    // 同步保存到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('mine_active_menu', menu)
    }
  }

  return {
    activeMenu,
    setActiveMenu
  }
})
