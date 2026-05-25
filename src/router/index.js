import { createRouter, createWebHistory } from 'vue-router'

// 使用动态导入 (懒加载)，这能极大减少循环依赖报错
const Layout = () => import('../layout/Layout.vue')
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const Home = () => import('../views/Home.vue')
const Publish = () => import('../views/Publish.vue')
const Message = () => import('../views/Message.vue')
const Mine = () => import('../views/Mine.vue')
const Detail = () => import('../views/Detail.vue')


const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/', redirect: '/home' },
  {
    path: '/',
    component: Layout,
    children: [
      { path: 'home', component: Home },
      { path: 'publish', component: Publish },
      { path: 'message', component: Message },
      { path: 'mine', component: Mine },
      { 
        path: 'goods/detail', 
        name: 'GoodsDetail', 
        component: Detail,
        meta: { title: '商品详情' } 
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router