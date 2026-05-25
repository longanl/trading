import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfoApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // 响应式状态：增加 nickname
  const username = ref(localStorage.getItem('username') || '')
  const nickname = ref(localStorage.getItem('nickname') || '') // 新增
  const avatar = ref(localStorage.getItem('avatar') || '')
  const email = ref(localStorage.getItem('email') || '')

  /**
   * 获取用户详细信息
   */
  const fetchUserInfo = async () => {
    try {
      const res = await getUserInfoApi()
      
      if (res.code === 200) {
        const data = res.data
        
        // 更新 Pinia 状态
        username.value = data.username
        nickname.value = data.nickname
        avatar.value = data.avatar || 'https://api.dicebear.com/8.x/rings/svg?seed=longan'
        email.value = data.email

        // 同步到本地存储
        localStorage.setItem('username', data.username)
        localStorage.setItem('nickname', nickname.value) // 新增
        localStorage.setItem('avatar', avatar.value)
        localStorage.setItem('email', data.email)
        
        return data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      clearUserInfo() 
      throw error
    }
  }

  /**
   * 退出登录时清空数据
   */
  const clearUserInfo = () => {
    username.value = ''
    nickname.value = '' // 新增
    avatar.value = ''
    email.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('nickname') // 新增
    localStorage.removeItem('avatar')
    localStorage.removeItem('email')
  }

  return { 
    username, 
    nickname, // 记得导出
    avatar, 
    email, 
    fetchUserInfo, 
    clearUserInfo 
  }
})