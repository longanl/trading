import request from '@/utils/request'

// 注册接口
export const registerApi = (data) => request.post('/user/register', data)

// 登录接口
export const loginApi = (data) => request.post('/user/login', data)

// 获取用户信息接口
export const getUserInfoApi = () => request.get('/user/info')

// 更新用户基本信息（昵称、头像）
export const updateUserInfoApi = (data) => request.put('/user/info', data)

// 获取用户个人资料详情
export const getUserProfileApi = () => request.get('/user/profile')

// 设置用户资料（无则新增，有则更新）
export const setUserProfileApi = (data) => request.post('/user/profile', data)

// 更新用户个人资料
export const updateUserProfileApi = (data) => request.put('/user/profile', data)

// 查询钱包
export const getWalletApi = () => request.get('/user/wallet')

// 查询钱包流水（分页）
export const getWalletLogApi = (params) => request.get('/user/wallet/log', { params })

// 查询信用信息
export const getCreditApi = () => request.get('/user/credit')

// 记录用户行为
export const recordBehaviorApi = (data) => request.post('/user/behavior', data)