import request from '@/utils/request'

// 创建订单
export const createOrderApi = (data) => request.post('/order/create', data)

// 支付（购买）
export const buyOrderApi = (id) => request.post('/order/buy', null, { params: { id: String(id) } })

// 订单详情
export const getOrderDetailApi = (id) => request.get(`/order/${String(id)}`)

// 卖家发货
export const sendOrderApi = (id, deliveryNo) => request.post(`/order/${String(id)}/send`, deliveryNo)

// 确认收货
export const confirmOrderApi = (id) => request.post(`/order/${String(id)}/confirm`)

// 取消订单
export const cancelOrderApi = (id) => request.post(`/order/${String(id)}/cancel`)

// 申请退款
export const applyRefundApi = (data) => request.post('/order/refund/apply', data)

// 同意退款
export const agreeRefundApi = (id) => request.post(`/order/refund/${String(id)}/agree`)

// 拒绝退款
export const rejectRefundApi = (id) => request.post(`/order/refund/${String(id)}/reject`)

// 我的订单列表
export const getMyOrderApi = (params) => request.get('/order/my', { params })
