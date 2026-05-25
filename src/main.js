import { createApp } from 'vue'
import { createPinia } from 'pinia' // 1. 导入 Pinia
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
const pinia = createPinia() // 2. 创建 Pinia 实例

// 3. 全局注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)   // 4. 挂载 Pinia
app.use(ElementPlus)
app.use(router)

app.mount('#app')