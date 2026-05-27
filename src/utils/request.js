import axios from 'axios'
import JSONbig from 'json-bigint'
import { ElMessage } from 'element-plus'
import router from '../router'

const request = axios.create({
  baseURL: '/api',
  timeout: 8000,
  transformResponse: [function (data) {
    try {
      return JSONbig.parse(data)
    } catch (e) {
      return data
    }
  }]
})

// 请求拦截器
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果后端返回 code 且不是 200，说明业务逻辑有误
    if (res.code && res.code !== 200) {
      ElMessage.error(res.msg || '业务请求错误')
      
      // 特殊逻辑：如果是 401（未登录或 Token 过期）
      if (res.code === 401) {
        localStorage.clear() // 清空本地缓存
        router.push('/login') // 强制跳回登录页
      }
      
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    
    return res // 直接返回 data 部分，简化组件调用
  },
  error => {
    // 处理网络错误或 HTTP 状态码非 2xx 的情况
    let message = ''
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '登录已过期，请重新登录'
          localStorage.clear()
          router.push('/login')
          break
        case 403:
          message = '权限不足，无法访问'
          break
        case 404:
          message = '请求资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = '网络连接异常'
      }
    } else {
      message = '请求超时或网络异常'
    }
    
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request