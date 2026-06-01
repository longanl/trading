import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { getMyOrderApi, getOrderDetailApi, buyOrderApi, confirmOrderApi, cancelOrderApi, applyRefundApi, sendOrderApi, agreeRefundApi, rejectRefundApi } from '@/api/order'
import { ElMessage } from 'element-plus'

export const useOrderStore = defineStore('order', () => {
  // ========== 买家订单 ==========
  const buyList = ref([])
  const buyTotal = ref(0)
  const buyLoading = ref(false)
  const buyQuery = reactive({ role: 1, status: null, page: 1, size: 10 })

  // ========== 卖家订单 ==========
  const sellList = ref([])
  const sellTotal = ref(0)
  const sellLoading = ref(false)
  const sellQuery = reactive({ role: 2, status: null, page: 1, size: 10 })

  // ========== 当前订单详情 ==========
  const currentOrder = ref(null)
  const detailLoading = ref(false)

  // ========== 加载买家订单 ==========
  const fetchBuyOrders = async () => {
    buyLoading.value = true
    try {
      const res = await getMyOrderApi(buyQuery)
      if (res.code === 200) {
        buyList.value = res.data.list || []
        buyTotal.value = res.data.total || 0
      }
    } catch (e) {
      console.error('获取买家订单失败:', e)
    } finally {
      buyLoading.value = false
    }
  }

  // ========== 加载卖家订单 ==========
  const fetchSellOrders = async () => {
    sellLoading.value = true
    try {
      const res = await getMyOrderApi(sellQuery)
      if (res.code === 200) {
        sellList.value = res.data.list || []
        sellTotal.value = res.data.total || 0
      }
    } catch (e) {
      console.error('获取卖家订单失败:', e)
    } finally {
      sellLoading.value = false
    }
  }

  // ========== 加载订单详情 ==========
  const fetchOrderDetail = async (id) => {
    detailLoading.value = true
    try {
      const res = await getOrderDetailApi(id)
      if (res.code === 200 && res.data) {
        currentOrder.value = res.data
      }
    } catch (e) {
      console.error('加载订单失败:', e)
    } finally {
      detailLoading.value = false
    }
  }

  // ========== 支付 ==========
  const payOrder = async (id) => {
    console.log("调用支付api")
    const res = await buyOrderApi(id)
    return res
  }

  // ========== 发货 ==========
  const sendOrder = async (id, deliveryNo) => {
    const res = await sendOrderApi(id, deliveryNo)
    return res
  }

  // ========== 确认收货 ==========
  const confirmOrder = async (id) => {
    const res = await confirmOrderApi(id)
    return res
  }

  // ========== 取消订单 ==========
  const cancelOrder = async (id) => {
    const res = await cancelOrderApi(id)
    return res
  }

  // ========== 申请退款 ==========
  const refundOrder = async (data) => {
    const res = await applyRefundApi(data)
    return res
  }

  // ========== 同意退款 ==========
  const agreeRefund = async (id) => {
    const res = await agreeRefundApi(id)
    return res
  }

  // ========== 拒绝退款 ==========
  const rejectRefund = async (id) => {
    const res = await rejectRefundApi(id)
    return res
  }

  // ========== 买家状态筛选 ==========
  const setBuyStatus = (status) => {
    buyQuery.status = status
    buyQuery.page = 1
    fetchBuyOrders()
  }

  // ========== 卖家状态筛选 ==========
  const setSellStatus = (status) => {
    sellQuery.status = status
    sellQuery.page = 1
    fetchSellOrders()
  }

  // ========== 工具方法 ==========
  const statusText = (s) => {
    const map = { 0: '待付款', 1: '待发货', 2: '待收货', 3: '已完成', 4: '已取消', 5: '退款中' }
    return map[s] || '未知'
  }

  const statusTagType = (s) => {
    const map = { 0: 'warning', 1: 'primary', 2: 'success', 3: 'info', 4: 'danger', 5: 'danger' }
    return map[s] || 'info'
  }

  return {
    // 买家
    buyList, buyTotal, buyLoading, buyQuery, fetchBuyOrders, setBuyStatus,
    // 卖家
    sellList, sellTotal, sellLoading, sellQuery, fetchSellOrders, setSellStatus,
    // 详情
    currentOrder, detailLoading, fetchOrderDetail,
    // 操作
    payOrder, sendOrder, confirmOrder, cancelOrder, refundOrder, agreeRefund, rejectRefund,
    // 工具
    statusText, statusTagType
  }
})
