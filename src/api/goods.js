import request from '../utils/request'

// 发布商品
export const publishProductApi = (data) => {
  return request.post('/goods', data)
}

// 获取商品列表 (搜索/筛选)
export const getGoodsListApi = (params) => {
  return request.get('/goods/list', { params })
}

// 获取商品详情
export const getGoodsDetailApi = (id) => {
  return request.get(`/goods/${String(id)}`)
}

// 获取我的商品
export const getMyGoodsApi = (params) => {
  return request.get('/goods/my', { params })
}

// 修改商品
export const updateGoodsApi = (id, data) => {
  return request.put(`/goods/${id}`, data)
}