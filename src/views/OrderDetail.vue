<template>
  <div class="order-detail-container" v-loading="orderStore.detailLoading">
    <div class="detail-card" v-if="order">
      <!-- 订单状态步骤条 -->
      <el-steps :active="statusStep" finish-status="success" align-center style="margin-bottom:30px;">
        <el-step title="下单" :description="formatTime(order.createTime)" />
        <el-step title="付款" :description="formatTime(order.payTime)" />
        <el-step title="发货" :description="formatTime(order.sendTime)" />
        <el-step title="完成" :description="formatTime(order.finishTime)" />
      </el-steps>

      <!-- 状态标签 -->
      <div style="text-align:center;margin-bottom:20px;">
        <el-tag :type="orderStore.statusTagType(order.status)" size="large" effect="dark">
          {{ orderStore.statusText(order.status) }}
        </el-tag>
      </div>

      <!-- 商品信息 -->
      <div class="section">
        <h3 class="section-title">商品信息</h3>
        <div class="goods-row" @click="router.push(`/goods/detail?id=${order.goodsId}`)">
          <el-image :src="order.goodsImage" fit="cover" class="goods-img" />
          <div class="goods-info">
            <div class="goods-title">{{ order.goodsTitle }}</div>
            <div class="goods-price">￥{{ order.price }}</div>
          </div>
        </div>
      </div>

      <!-- 收货地址 -->
      <div class="section">
        <h3 class="section-title">收货信息</h3>
        <div class="address-info">
          <p><b>{{ order.receiver }}</b> {{ order.phone }}</p>
          <p style="color:#666;">{{ order.address }}</p>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="section">
        <h3 class="section-title">订单信息</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单编号">{{ order.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatTime(order.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ formatTime(order.payTime) || '未支付' }}</el-descriptions-item>
          <el-descriptions-item label="发货时间">{{ formatTime(order.sendTime) || '未发货' }}</el-descriptions-item>
          <el-descriptions-item label="物流单号">{{ order.deliveryNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="成交金额">
            <span style="color:#ff5000;font-weight:bold;">￥{{ order.price }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <template v-if="order.status === 0">
          <el-button type="primary" size="large" :loading="paying" @click="handlePay">去支付</el-button>
          <el-button size="large" :loading="cancelling" @click="handleCancel">取消订单</el-button>
        </template>
        <template v-if="order.status === 1 && isSeller">
          <el-button type="primary" size="large" :loading="sending" @click="handleSend">发货</el-button>
        </template>
        <template v-if="order.status === 2">
          <el-button type="success" size="large" :loading="confirming" @click="handleConfirm">确认收货</el-button>
          <el-button type="warning" size="large" @click="handleRefund">申请退款</el-button>
        </template>
        <el-button size="large" @click="router.push('/mine')">返回我的</el-button>
      </div>
    </div>

    <el-empty v-else-if="!orderStore.detailLoading" description="订单不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()
const order = computed(() => orderStore.currentOrder)

const isSeller = computed(() => userStore.userId && order.value?.sellerId === userStore.userId)

const paying = ref(false)
const cancelling = ref(false)
const confirming = ref(false)
const sending = ref(false)

const statusStep = computed(() => {
  const map = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 0, 5: 3 }
  return map[order.value?.status] || 0
})

const formatTime = (t) => {
  if (!t) return ''
  return t.replace('T', ' ').substring(0, 19)
}

const handlePay = async () => {
  paying.value = true
  try {
    console.log("开始支付")
    const res = await orderStore.payOrder(order.value.id)
    if (res.code === 200) {
      ElMessage.success('支付成功')
      orderStore.fetchOrderDetail(order.value.id)
    } else {
      ElMessage.error(res.msg || '支付失败')
    }
  } catch (e) {
    ElMessage.error('支付失败')
  } finally {
    paying.value = false
  }
}

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定取消该订单？商品将重新上架。', '取消订单', { type: 'warning' })
    cancelling.value = true
    const res = await orderStore.cancelOrder(order.value.id)
    if (res.code === 200) {
      ElMessage.success('订单已取消')
      orderStore.fetchOrderDetail(order.value.id)
    } else {
      ElMessage.error(res.msg || '取消失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('取消失败')
  } finally {
    cancelling.value = false
  }
}

const handleSend = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入物流单号', '发货', {
      inputPlaceholder: '物流单号',
      inputValidator: (v) => !!v || '请输入物流单号'
    })
    sending.value = true
    const res = await orderStore.sendOrder(order.value.id, value)
    if (res.code === 200) {
      ElMessage.success('发货成功')
      orderStore.fetchOrderDetail(order.value.id)
    } else {
      ElMessage.error(res.msg || '发货失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('发货失败')
  } finally {
    sending.value = false
  }
}

const handleConfirm = async () => {
  try {
    await ElMessageBox.confirm('确认已收到商品？', '确认收货', { type: 'info' })
    confirming.value = true
    const res = await orderStore.confirmOrder(order.value.id)
    if (res.code === 200) {
      ElMessage.success('确认收货成功')
      orderStore.fetchOrderDetail(order.value.id)
    } else {
      ElMessage.error(res.msg || '确认失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('确认失败')
  } finally {
    confirming.value = false
  }
}

const handleRefund = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入退款原因', '申请退款', {
      inputPlaceholder: '退款原因',
      inputValidator: (v) => !!v || '请输入原因'
    })
    const res = await orderStore.refundOrder({ orderId: order.value.id, reason: value, amount: order.value.price })
    if (res.code === 200) {
      ElMessage.success('退款申请已提交')
      orderStore.fetchOrderDetail(order.value.id)
    } else {
      ElMessage.error(res.msg || '申请失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('申请失败')
  }
}

onMounted(() => {
  const id = route.query.id
  if (!id) {
    ElMessage.error('缺少订单参数')
    router.back()
    return
  }
  orderStore.fetchOrderDetail(id)
})
</script>

<style scoped>
.order-detail-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 0 15px;
}
.detail-card {
  background: #fff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}
.section {
  margin-bottom: 25px;
}
.section-title {
  margin: 0 0 15px 0;
  color: #334155;
  border-left: 4px solid #eab308;
  padding-left: 15px;
  font-size: 15px;
}
.goods-row {
  display: flex;
  gap: 15px;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  transition: background 0.2s;
}
.goods-row:hover { background: #f8f9fa; }
.goods-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  flex-shrink: 0;
}
.goods-info { flex: 1; }
.goods-title { font-size: 15px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
.goods-price { color: #ff5000; font-size: 18px; font-weight: bold; }
.address-info { padding: 10px; background: #f8f9fa; border-radius: 10px; }
.address-info p { margin: 4px 0; }
.action-bar {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}
</style>
