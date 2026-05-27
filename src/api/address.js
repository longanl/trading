import request from '@/utils/request'

// 获取收货地址列表
export const getAddressListApi = () => request.get('/user/address/list')

// 获取默认收货地址
export const getDefaultAddressApi = () => request.get('/user/address/default')

// 添加收货地址
export const addAddressApi = (data) => request.post('/user/address', data)

// 更新收货地址
export const updateAddressApi = (id, data) => request.put(`/user/address/${String(id)}`, data)

// 删除收货地址
export const deleteAddressApi = (id) => request.delete(`/user/address/${String(id)}`)

// 设置默认地址
export const setDefaultAddressApi = (id) => request.put(`/user/address/${String(id)}/default`)
