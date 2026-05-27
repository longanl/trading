<template>
  <div class="order-confirm-container">
    <div class="confirm-card" v-loading="loading">
      <h3 class="section-title">确认订单</h3>

      <!-- 商品信息 -->
      <div class="goods-section" v-if="goods">
        <el-image :src="goods.imageUrls?.[0]" fit="cover" class="goods-img" />
        <div class="goods-info">
          <div class="goods-title">{{ goods.title }}</div>
          <div class="goods-quality">成色：{{ qualityText(goods.quality) }}</div>
          <div class="goods-price">
            <span class="symbol">￥</span>
            <span class="price">{{ goods.price }}</span>
          </div>
        </div>
      </div>

      <el-divider />

      <!-- 收货地址 -->
      <h4 style="margin-bottom:15px;">收货地址</h4>
      <el-form :model="addressForm" :rules="rules" ref="formRef" label-width="80px" style="max-width:500px;">
        <el-form-item label="收货人" prop="receiver">
          <el-input v-model="addressForm.receiver" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="addressForm.address" type="textarea" :rows="2" placeholder="请输入详细收货地址" />
        </el-form-item>
      </el-form>

      <el-divider />

      <!-- 提交 -->
      <div class="submit-row">
        <div class="total-label">
          合计：<span class="total-price">￥{{ goods?.price || '0.00' }}</span>
        </div>
        <el-button type="danger" size="large" :loading="submitting" @click="handleSubmit">
          提交订单
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getGoodsDetailApi } from '@/api/goods'
import { createOrderApi, buyOrderApi } from '@/api/order'
import { getDefaultAddressApi } from '@/api/address'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const submitting = ref(false)
const goods = ref(null)
const formRef = ref(null)
const orderId = ref(null)

const addressForm = reactive({
  receiver: '',
  phone: '',
  address: ''
})

const rules = {
  receiver: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入收货地址', trigger: 'blur' }]
}

const qualityText = (q) => {
  const map = { 1: '全新', 2: '99新', 3: '95新', 4: '九成新', 5: '七成新及以下' }
  return map[q] || '未知'
}

const loadGoods = async () => {
  const goodsId = route.query.goodsId
  if (!goodsId) {
    ElMessage.error('缺少商品参数')
    router.back()
    return
  }
  try {
    const res = await getGoodsDetailApi(goodsId)
    if (res.code === 200) {
      goods.value = res.data
      if (!goods.value.imageUrls) goods.value.imageUrls = []
    }
  } catch (e) {
    console.error('加载商品失败:', e)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      // 1. 创建订单
      console.log("开始创建订单")
      const createRes = await createOrderApi({
        goodsId: String(goods.value.id),
        receiver: addressForm.receiver,
        phone: addressForm.phone,
        address: addressForm.address
      })
      if (createRes.code !== 200) {
        ElMessage.error(createRes.msg || '创建订单失败')
        return
      }
      orderId.value = createRes.data.id

      // 2. 支付
      const buyRes = await buyOrderApi(orderId.value)
      if (buyRes.code !== 200) {
        ElMessage.error(buyRes.msg || '支付失败')
        return
      }

      ElMessage.success('下单成功')
      router.push(`/order/detail?id=${orderId.value}`)
    } catch (e) {
      ElMessage.error('下单失败，请重试')
    } finally {
      submitting.value = false
    }
  })
}

// 加载默认收货地址
const loadDefaultAddress = async () => {
  try {
    const res = await getDefaultAddressApi()
    if (res.code === 200 && res.data) {
      addressForm.receiver = res.data.receiver || ''
      addressForm.phone = res.data.phone || ''
      addressForm.address = res.data.address || ''
    }
  } catch (e) {
    console.error('获取默认地址失败:', e)
  }
}

onMounted(() => {
  loadGoods()
  loadDefaultAddress()
})
</script>

<style scoped>
.order-confirm-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 0 15px;
}
.confirm-card {
  background: #fff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}
.section-title {
  margin: 0 0 25px 0;
  color: #334155;
  border-left: 4px solid #eab308;
  padding-left: 15px;
  font-size: 18px;
}
.goods-section {
  display: flex;
  gap: 16px;
  align-items: center;
}
.goods-img {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  flex-shrink: 0;
}
.goods-info {
  flex: 1;
}
.goods-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
}
.goods-quality {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 10px;
}
.goods-price {
  color: #ff5000;
}
.symbol {
  font-size: 14px;
}
.price {
  font-size: 24px;
  font-weight: 800;
}
.submit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}
.total-label {
  font-size: 15px;
  color: #333;
}
.total-price {
  color: #ff5000;
  font-size: 24px;
  font-weight: 800;
}
</style>
