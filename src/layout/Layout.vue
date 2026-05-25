<template>
  <el-config-provider :locale="zhCn">
    <el-container class="app-layout">
      <el-header class="custom-header">
        <div class="logo-area">
          <div class="logo-icon-bg">
            <el-icon class="logo-icon" :size="20"><Platform /></el-icon>
          </div>
          <span class="logo-text">LONGAN<span class="logo-apex">APEX</span></span>
        </div>

        <div class="header-center">
          <el-input
            v-model="searchQuery"
            placeholder="搜好物 / 找订单 / 验证链上存证"
            class="search-bar"
            clearable
          >
            <template #prefix>
              <el-icon class="el-input__icon"><Search /></el-icon>
            </template>
            <template #append>
              <el-button type="primary" class="search-btn">搜索</el-button>
            </template>
          </el-input>
        </div>

        <div class="header-right">
          <el-tooltip content="区块链模块未激活" placement="bottom">
            <el-tag type="info" effect="plain" class="chain-tag">
              <i class="dot-inactive"></i> Web2 Mode
            </el-tag>
          </el-tooltip>
          
          <el-divider direction="vertical" />
          
          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="36" :src="userStore.avatar || 'https://api.dicebear.com/8.x/rings/svg?seed=longan'" />
              <span class="username">{{ userStore.nickname || '加载中...' }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/mine')"><el-icon><User /></el-icon>个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="logout"><el-icon><SwitchButton /></el-icon>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-container class="main-body">
        <el-aside width="240px" class="custom-aside">
          <el-menu
            :default-active="activePath"
            class="el-menu-vertical"
            @select="handleSelect"
            background-color="#ffffff"
            text-color="#475569"
            active-text-color="#0ea5e9"
          >
            <el-menu-item index="/home">
              <el-icon><House /></el-icon>
              <span>平台首页</span>
            </el-menu-item>
            <el-menu-item index="/publish">
              <el-icon><CirclePlus /></el-icon>
              <span>发布闲置</span>
            </el-menu-item>
            <el-menu-item index="/message">
              <el-icon><ChatLineRound /></el-icon>
              <span>消息中心</span>
<!--              <el-badge :value="5" class="msg-badge" type="danger" />-->
            </el-menu-item>
            <el-menu-item index="/mine">
              <el-icon><Management /></el-icon>
              <span>个人中心</span>
            </el-menu-item>
            
            <div class="menu-footer">
              <el-divider />
              <div class="version-info">Longan Apex v1.0</div>
            </div>
          </el-menu>
        </el-aside>

        <el-main class="custom-main">
          <router-view v-slot="{ Component }">
            <transition name="el-fade-in" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user' // 确保导入路径正确
import { Search, House, CirclePlus, ChatLineRound, Management, Platform, ArrowDown, User, Goods, SwitchButton } from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const router = useRouter()
const route = useRoute()

// --- 补上这一行，解决所有 undefined 报错 ---
const userStore = useUserStore() 
// ---------------------------------------

const searchQuery = ref('')
const activePath = computed(() => route.path)

const handleSelect = (path) => {
  router.push(path)
}

// 初始化时加载用户信息
onMounted(() => {
  userStore.fetchUserInfo()
})

// 建议增加：退出登录逻辑
const logout = () => {
  userStore.clearUserInfo()
  router.push('/login')
}
</script>

<style scoped>
/* 核心配色及预设 */
:root {
  --lp-primary: #0ea5e9;
  --lp-success: #10b981;
  --lp-warning: #f59e0b;
  --text-main: #1e293b;
  --text-reg: #64748b;
  --border-light: #e2e8f0;
}

/* 1. 核心修复：锁定视口高度，禁止全局滚动 */
.app-layout {
  height: 100vh;
  background-color: #f8fafc;
  font-family: 'PingFang SC', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 禁止外层滚动条 */
}

/* 顶部 Header：保持固定高度 */
.custom-header {
  height: 64px;
  flex-shrink: 0; /* 确保 Header 不会被挤压 */
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  z-index: 10;
}

/* 2. 核心修复：中间主体部分占据剩余高度 */
.main-body {
  flex: 1; 
  overflow: hidden; /* 这一层也必须禁止滚动，由子元素控制 */
  display: flex;
}

/* 3. 核心修复：侧边栏独立滚动（如果菜单太长） */
.custom-aside {
  background: #ffffff;
  border-right: 1px solid var(--border-light);
  overflow-y: auto; /* 允许菜单滚动 */
  height: 100%;
}

/* 4. 核心修复：内容区独立滚动 */
.custom-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto; /* 只在这里开启纵向滚动条 */
  height: 100%;
  background-color: #f8fafc;
}

/* --- 以下是你原有的 UI 样式，保持不变 --- */
.logo-area { display: flex; align-items: center; gap: 12px; }
.logo-icon-bg {
  width: 36px; height: 36px;
  background-color: #f0f9ff;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: var(--lp-primary);
}
.logo-text { font-weight: 700; font-size: 18px; color: var(--text-main); letter-spacing: 0.5px; }
.logo-apex { color: var(--lp-primary); font-weight: 800; }

.search-bar { width: 500px; }
:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  background-color: #f8fafc;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--lp-primary) inset !important;
  background-color: #fff;
}
:deep(.el-input-group__append) {
  background-color: var(--lp-primary);
  color: white;
  border-radius: 0 8px 8px 0;
  border: none;
}

.header-right { display: flex; align-items: center; gap: 16px; }
.chain-tag { border-radius: 6px; font-family: monospace; background: #f1f5f9; }
.dot-inactive {
  display: inline-block; width: 6px; height: 6px;
  background: #94a3b8; border-radius: 50%; margin-right: 6px;
}

.user-info {
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; padding: 4px 8px; border-radius: 8px;
  transition: background 0.2s;
}
.user-info:hover { background-color: #f1f5f9; }
.username { font-weight: 500; color: var(--text-main); font-size: 14px; }

.el-menu { border-right: none; padding-top: 16px; min-height: 100%; position: relative; }
:deep(.el-menu-item) {
  height: 50px; line-height: 50px;
  margin: 4px 12px; border-radius: 8px;
}
:deep(.el-menu-item.is-active) { background-color: #f0f9ff; font-weight: 600; }

.msg-badge { margin-left: auto; }
.menu-footer {
  margin-top: 40px; /* 改为 margin 方案，防止 absolute 遮挡菜单底部项 */
  padding: 0 24px 24px; text-align: center;
  color: #94a3b8; font-size: 12px;
}
</style>