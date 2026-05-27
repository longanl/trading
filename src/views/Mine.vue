<template>
  <div class="user-center-container">
    <div class="center-content">
      <div class="header-card">
        <div class="user-info-row">
          <div class="user-main">
            <el-avatar :size="70" :src="userInfo.avatar || 'https://api.dicebear.com/8.x/rings/svg?seed=longan'" border />
            <div class="user-text">
              <h2 class="nickname">{{ userInfo.nickname }}</h2>
              <div class="user-tags">
                <el-tag size="small" effect="dark" type="warning">资深卖家</el-tag>
                <el-tag size="small" effect="plain" type="info">已实名</el-tag>
              </div>
            </div>
          </div>
           <el-button type="primary" round icon="Edit" @click="showProfileDialog">
             编辑资料
           </el-button>
        </div>

        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          class="top-horizontal-menu"
          @select="handleMenuSelect"
          :ellipsis="false"
        >
          <el-menu-item index="info">个人信息</el-menu-item>
          <el-menu-item index="release">我发布的</el-menu-item>
          <el-menu-item index="buy">我买到的</el-menu-item>
          <el-menu-item index="sell">我卖出的</el-menu-item>
          <el-menu-item index="wallet">账单流水</el-menu-item>
          <el-menu-item index="address">收货地址</el-menu-item>
        </el-menu>
      </div>

      <div class="stat-row">
        <div class="stat-card gold">
          <div class="stat-icon"><el-icon><Money /></el-icon></div>
          <div class="stat-data">
            <span class="label">账户余额</span>
            <span class="value">￥{{ userInfo.balance.toFixed(2) }}</span>
          </div>
        </div>
        <div class="stat-card blue">
          <div class="stat-icon"><el-icon><Trophy /></el-icon></div>
          <div class="stat-data">
            <span class="label">信用分</span>
            <span class="value">{{ creditInfo.score }}</span>
          </div>
        </div>
        <div class="stat-card red">
          <div class="stat-icon"><el-icon><Star /></el-icon></div>
          <div class="stat-data">
            <span class="label">好评 / 差评</span>
            <span class="value">{{ creditInfo.goodNum }} / {{ creditInfo.badNum }}</span>
          </div>
        </div>
      </div>

      <div class="main-body">
        <transition name="fade-slide" mode="out-in">
          <div :key="activeMenu" class="content-wrapper">
            <div v-if="activeMenu === 'info'" class="form-container">
               <h3>基本资料</h3>
               <el-form label-width="80px" style="max-width:500px;">
                 <el-form-item label="邮箱">
                   <el-input :model-value="userInfo.email" disabled />
                 </el-form-item>
                 <el-form-item label="用户名">
                   <el-input :model-value="userInfo.username" disabled />
                 </el-form-item>
               </el-form>

               <el-divider />
               <h3>个人资料</h3>
               <el-form label-width="80px" style="max-width:500px;">
                 <el-form-item label="性别">
                   <el-select v-model="profileForm.gender" style="width:100%">
                     <el-option :value="0" label="未知" />
                     <el-option :value="1" label="男" />
                     <el-option :value="2" label="女" />
                   </el-select>
                 </el-form-item>
                 <el-form-item label="生日">
                   <el-date-picker v-model="profileForm.birthday" type="date" value-format="YYYY-MM-DD" style="width:100%" />
                 </el-form-item>
                 <el-form-item label="地址">
                   <el-input v-model="profileForm.address" />
                 </el-form-item>
                 <el-form-item label="个性签名">
                   <el-input v-model="profileForm.signature" type="textarea" :rows="2" />
                 </el-form-item>
                 <el-form-item>
                   <el-button type="primary" @click="saveProfile">{{ profileLoaded ? '更新资料' : '保存资料' }}</el-button>
                 </el-form-item>
               </el-form>
            </div>
            
            <div v-if="activeMenu === 'release'">
              <h3 class="section-title">我发布的商品</h3>
              <div class="filter-bar" style="margin-bottom: 20px;">
                <el-radio-group v-model="myGoodsQuery.status" size="small" @change="handleStatusChange">
                  <el-radio-button :label="1">上架中</el-radio-button>
                  <el-radio-button :label="0">已下架</el-radio-button>
                  <el-radio-button :label="2">已卖出</el-radio-button>
                </el-radio-group>
              </div>
              
              <!-- 商品列表 -->
              <div v-loading="myGoodsLoading" element-loading-text="加载中...">
                <el-row :gutter="15">
                  <el-col 
                    v-for="item in myGoodsList" 
                    :key="item.id" 
                    :xs="12" :sm="8" :md="6" :lg="4.8" 
                    class="card-col"
                  >
                    <el-card 
                      class="goods-card" 
                      :body-style="{ padding: '0px' }" 
                      shadow="hover"
                      @click="router.push(`/goods/detail?id=${item.id}`)"
                    >
                      <div class="image-wrapper">
                        <el-image 
                          :src="item.imageUrls?.[0]" 
                          fit="cover"
                          class="goods-image"
                          lazy
                        >
                          <template #placeholder>
                            <div class="image-slot">加载中...</div>
                          </template>
                          <template #error>
                            <div class="image-slot">暂无图片</div>
                          </template>
                        </el-image>
                      </div>
                      
                      <div class="goods-info">
                        <div class="goods-title">{{ item.title }}</div>
                        <div class="goods-price-row">
                          <span class="price-box">
                            <span class="symbol">￥</span>
                            <span class="price-num">{{ item.price }}</span>
                          </span>
                        </div>
                        <div class="goods-footer">
                          <div class="status-info">
                            <el-tag 
                              size="small" 
                              :type="item.quality === 1 ? 'success' : 'info'" 
                              effect="plain"
                            >
                              {{ item.qualityText }}
                            </el-tag>
                          </div>
                          <div class="card-actions">
                            <span class="view-count">浏览 {{ item.viewCount }}</span>
                            <el-icon 
                              class="edit-icon" 
                              @click.stop="router.push(`/goods/edit?id=${item.id}`)"
                            >
                              <Edit />
                            </el-icon>
                          </div>
                        </div>
                        <div class="goods-time">{{ item.createTime }}</div>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
              
              <!-- 分页 -->
              <div class="pagination-wrapper" v-if="myGoodsTotal > 0" style="margin-top: 20px;">
                <el-pagination
                  v-model:current-page="myGoodsQuery.page"
                  v-model:page-size="myGoodsQuery.size"
                  layout="prev, pager, next, jumper"
                  :total="myGoodsTotal"
                  background
                  @current-change="handleMyGoodsPageChange"
                />
              </div>
              
              <el-empty 
                v-if="!myGoodsLoading && myGoodsList.length === 0" 
                description="暂无商品，去发布第一个商品吧！" 
              />
            </div>

            <!-- 我买到的 -->
            <div v-if="activeMenu === 'buy'">
              <h3 class="section-title">我买到的</h3>
              <div class="filter-bar" style="margin-bottom: 20px;">
                <el-radio-group :model-value="orderStore.buyQuery.status" size="small" @change="orderStore.setBuyStatus">
                  <el-radio-button :label="null">全部</el-radio-button>
                  <el-radio-button :label="0">待付款</el-radio-button>
                  <el-radio-button :label="1">待发货</el-radio-button>
                  <el-radio-button :label="2">待收货</el-radio-button>
                  <el-radio-button :label="3">已完成</el-radio-button>
                </el-radio-group>
              </div>
              <div v-loading="orderStore.buyLoading">
                <div v-for="item in orderStore.buyList" :key="item.orderId" class="order-card" @click="router.push(`/order/detail?id=${item.orderId}`)">
                  <el-image :src="item.imageUrl" fit="cover" class="order-img" />
                  <div class="order-info">
                    <div class="order-title">{{ item.title }}</div>
                    <div class="order-meta">
                      <span class="order-price">￥{{ item.price }}</span>
                      <el-tag :type="orderStore.statusTagType(item.status)" size="small">{{ orderStore.statusText(item.status) }}</el-tag>
                    </div>
                    <div class="order-time">{{ item.createTime?.replace('T', ' ').substring(0, 19) }}</div>
                  </div>
                </div>
              </div>
              <div class="pagination-wrapper" v-if="orderStore.buyTotal > 0">
                <el-pagination :current-page="orderStore.buyQuery.page" :page-size="orderStore.buyQuery.size"
                  layout="prev, pager, next, total" :total="orderStore.buyTotal" background @current-change="(p) => { orderStore.buyQuery.page = p; orderStore.fetchBuyOrders() }" />
              </div>
              <el-empty v-if="!orderStore.buyLoading && orderStore.buyList.length === 0" description="暂无订单" />
            </div>

            <!-- 我卖出的 -->
            <div v-if="activeMenu === 'sell'">
              <h3 class="section-title">我卖出的</h3>
              <div class="filter-bar" style="margin-bottom: 20px;">
                <el-radio-group :model-value="orderStore.sellQuery.status" size="small" @change="orderStore.setSellStatus">
                  <el-radio-button :label="null">全部</el-radio-button>
                  <el-radio-button :label="1">待发货</el-radio-button>
                  <el-radio-button :label="2">待收货</el-radio-button>
                  <el-radio-button :label="3">已完成</el-radio-button>
                </el-radio-group>
              </div>
              <div v-loading="orderStore.sellLoading">
                <div v-for="item in orderStore.sellList" :key="item.orderId" class="order-card" @click="router.push(`/order/detail?id=${item.orderId}`)">
                  <el-image :src="item.imageUrl" fit="cover" class="order-img" />
                  <div class="order-info">
                    <div class="order-title">{{ item.title }}</div>
                    <div class="order-meta">
                      <span class="order-price">￥{{ item.price }}</span>
                      <el-tag :type="orderStore.statusTagType(item.status)" size="small">{{ orderStore.statusText(item.status) }}</el-tag>
                    </div>
                    <div class="order-time">{{ item.createTime?.replace('T', ' ').substring(0, 19) }}</div>
                  </div>
                </div>
              </div>
              <div class="pagination-wrapper" v-if="orderStore.sellTotal > 0">
                <el-pagination :current-page="orderStore.sellQuery.page" :page-size="orderStore.sellQuery.size"
                  layout="prev, pager, next, total" :total="orderStore.sellTotal" background @current-change="(p) => { orderStore.sellQuery.page = p; orderStore.fetchSellOrders() }" />
              </div>
              <el-empty v-if="!orderStore.sellLoading && orderStore.sellList.length === 0" description="暂无订单" />
            </div>

            <div v-if="activeMenu === 'wallet'">
              <h3 class="section-title">账单流水</h3>

              <!-- 类型筛选 -->
              <div class="filter-bar" style="margin-bottom: 20px;">
                <el-radio-group :model-value="walletLogQuery.type" size="small" @change="handleWalletTypeChange">
                  <el-radio-button :label="null">全部</el-radio-button>
                  <el-radio-button :label="1">收入</el-radio-button>
                  <el-radio-button :label="2">支出</el-radio-button>
                </el-radio-group>
              </div>

              <!-- 流水表格 -->
              <el-table :data="walletLogList" v-loading="walletLogLoading" stripe style="width: 100%">
                <el-table-column prop="createTime" label="时间" width="180" />
                <el-table-column label="类型" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.type === 1 ? 'success' : 'danger'" size="small">
                      {{ row.type === 1 ? '收入' : '支出' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="业务类型" width="100">
                  <template #default="{ row }">
                    {{ businessTypeText(row.businessType) }}
                  </template>
                </el-table-column>
                <el-table-column label="金额" width="120">
                  <template #default="{ row }">
                    <span :style="{ color: row.type === 1 ? '#67c23a' : '#f56c6c', fontWeight: 'bold' }">
                      {{ row.type === 1 ? '+' : '-' }}{{ row.amount }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="balance" label="余额" width="120" />
                <el-table-column prop="orderNo" label="订单号" width="200" />
                <el-table-column prop="remark" label="备注" />
              </el-table>

              <!-- 分页 -->
              <div class="pagination-wrapper" v-if="walletLogTotal > 0" style="margin-top: 20px;">
                <el-pagination
                  v-model:current-page="walletLogQuery.page"
                  v-model:page-size="walletLogQuery.size"
                  layout="prev, pager, next, jumper, total"
                  :total="walletLogTotal"
                  background
                  @current-change="handleWalletLogPageChange"
                />
              </div>

              <el-empty
                v-if="!walletLogLoading && walletLogList.length === 0"
                description="暂无流水记录"
              />
            </div>

            <!-- 收货地址 -->
            <div v-if="activeMenu === 'address'">
              <div class="section-header">
                <h3 class="section-title">收货地址</h3>
                <el-button type="primary" icon="Plus" @click="showAddressDialog()">添加新地址</el-button>
              </div>

              <div v-loading="addressLoading">
                <div v-for="item in addressList" :key="item.id" class="address-card">
                  <div class="address-info">
                    <div class="address-header">
                      <span class="receiver">{{ item.receiver }}</span>
                      <span class="phone">{{ item.phone }}</span>
                      <el-tag v-if="item.isDefault === 1" type="danger" size="small">默认</el-tag>
                    </div>
                    <div class="address-detail">{{ item.address }}</div>
                  </div>
                  <div class="address-actions">
                    <el-button v-if="item.isDefault !== 1" link type="primary" @click="handleSetDefault(item.id)">设为默认</el-button>
                    <el-button link type="primary" @click="showAddressDialog(item)">编辑</el-button>
                    <el-button link type="danger" @click="handleDeleteAddress(item.id)">删除</el-button>
                  </div>
                </div>
              </div>

              <el-empty v-if="!addressLoading && addressList.length === 0" description="暂无收货地址" />
            </div>
            
            </div>
        </transition>
      </div>
    </div>
  </div>

  <!-- 地址编辑弹窗 -->
  <el-dialog v-model="addressDialogVisible" :title="editingAddress ? '编辑地址' : '添加地址'" width="500px">
    <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="80px">
      <el-form-item label="收件人" prop="receiver">
        <el-input v-model="addressForm.receiver" placeholder="请输入收件人姓名" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="addressForm.phone" placeholder="请输入手机号" maxlength="11" />
      </el-form-item>
      <el-form-item label="详细地址" prop="address">
        <el-input v-model="addressForm.address" type="textarea" :rows="3" placeholder="请输入详细地址" />
      </el-form-item>
      <el-form-item label="默认地址">
        <el-switch v-model="addressForm.isDefault" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="addressDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="addressSaving" @click="handleSaveAddress">保存</el-button>
    </template>
  </el-dialog>

  <!-- 编辑资料弹窗 -->
  <el-dialog v-model="profileDialogVisible" title="编辑资料" width="500px">
    <el-form :model="infoForm" ref="profileFormRef" label-width="80px">
      <el-form-item label="昵称">
        <el-input v-model="infoForm.nickname" placeholder="请输入昵称" maxlength="20" />
      </el-form-item>
      <el-form-item label="头像">
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :auto-upload="false"
          :on-change="handleAvatarChange"
          accept="image/*"
        >
          <el-avatar :size="80" :src="infoForm.avatar || 'https://api.dicebear.com/8.x/rings/svg?seed=longan'" />
          <div class="avatar-tip">点击更换头像</div>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="profileDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="profileSaving" @click="saveInfo">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  User, Sell, ShoppingBag, Star, Wallet, Location, Shop, Edit, Money, Trophy, Plus, Delete
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyGoodsApi } from '@/api/goods'
import { useOrderStore } from '@/stores/order'
import {
  getUserInfoApi, updateUserInfoApi, getUserProfileApi, setUserProfileApi,
  getWalletApi, getCreditApi, getWalletLogApi, updateUserProfileApi
} from '@/api/user'
import { getAddressListApi, addAddressApi, updateAddressApi, deleteAddressApi, setDefaultAddressApi } from '@/api/address'
import { uploadUserAvatarApi } from '@/api/common'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const orderStore = useOrderStore()
const activeMenu = ref('info')

// 用户基本信息
const userInfo = reactive({
  id: null,
  username: '',
  nickname: '',
  avatar: '',
  email: '',
  balance: 0,
  releaseCount: 0,
  collectCount: 0
})

// 信用信息
const creditInfo = reactive({
  score: 0,
  level: 1,
  goodNum: 0,
  badNum: 0
})

// 用户资料（可编辑）
const profileForm = reactive({
  gender: 0,
  birthday: '',
  address: '',
  signature: ''
})
const profileLoaded = ref(false)

// 基本信息编辑表单（username 不可修改，不需要提交）
const infoForm = reactive({
  nickname: '',
  avatar: ''
})
const profileDialogVisible = ref(false)
const profileSaving = ref(false)
const profileFormRef = ref(null)

const showProfileDialog = () => {
  infoForm.nickname = userInfo.nickname
  infoForm.avatar = userInfo.avatar
  profileDialogVisible.value = true
}

// 钱包流水相关
const walletLogLoading = ref(false)
const walletLogList = ref([])
const walletLogTotal = ref(0)
const walletLogPages = ref(0)
const walletLogQuery = reactive({
  type: null,
  page: 1,
  size: 10
})

// 我的商品相关
const myGoodsLoading = ref(false)
const myGoodsList = ref([])
const myGoodsTotal = ref(0)
const myGoodsQuery = reactive({
  status: 1,
  page: 1,
  size: 12
})

// 收货地址相关
const addressLoading = ref(false)
const addressList = ref([])
const addressDialogVisible = ref(false)
const addressSaving = ref(false)
const editingAddress = ref(null)
const addressFormRef = ref(null)
const addressForm = reactive({
  receiver: '',
  phone: '',
  address: '',
  isDefault: 0
})
const addressRules = {
  receiver: [{ required: true, message: '请输入收件人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

// 加载用户基本信息
const loadUserInfo = async () => {
  try {
    const res = await getUserInfoApi()
    if (res.code === 200) {
      const data = res.data
      userInfo.id = data.id
      userInfo.username = data.username || ''
      userInfo.nickname = data.nickname || ''
      userInfo.avatar = data.avatar || ''
      userInfo.email = data.email || ''
      infoForm.nickname = data.nickname || ''
      infoForm.avatar = data.avatar || ''
    }
  } catch (e) {
    console.error('获取用户信息失败:', e)
  }
}

// 加载用户资料
const loadUserProfile = async () => {
  try {
    const res = await getUserProfileApi()
    if (res.code === 200 && res.data) {
      const data = res.data
      profileForm.gender = data.gender ?? 0
      profileForm.birthday = data.birthday || ''
      profileForm.address = data.address || ''
      profileForm.signature = data.signature || ''
      profileLoaded.value = true
    }
  } catch (e) {
    console.error('获取用户资料失败:', e)
  }
}

// 加载钱包信息
const loadWallet = async () => {
  try {
    const res = await getWalletApi()
    if (res.code === 200) {
      userInfo.balance = res.data.balance || 0
    }
  } catch (e) {
    console.error('获取钱包信息失败:', e)
  }
}

// 加载信用信息
const loadCredit = async () => {
  try {
    const res = await getCreditApi()
    if (res.code === 200) {
      Object.assign(creditInfo, res.data)
    }
  } catch (e) {
    console.error('获取信用信息失败:', e)
  }
}

// 加载钱包流水
const loadWalletLog = async () => {
  walletLogLoading.value = true
  try {
    const res = await getWalletLogApi(walletLogQuery)
    if (res.code === 200) {
      walletLogList.value = res.data.list || []
      walletLogTotal.value = res.data.total || 0
      walletLogPages.value = res.data.pages || 0
    }
  } catch (e) {
    console.error('获取钱包流水失败:', e)
  } finally {
    walletLogLoading.value = false
  }
}

// 加载我的商品
const loadMyGoods = async () => {
  myGoodsLoading.value = true
  try {
    const res = await getMyGoodsApi(myGoodsQuery)
    if (res.code === 200) {
      myGoodsList.value = res.data.list || []
      myGoodsTotal.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取我的商品失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    myGoodsLoading.value = false
  }
}

// 头像上传
const handleAvatarChange = async (uploadFile) => {
  if (!uploadFile.raw) return
  try {
    const res = await uploadUserAvatarApi(uploadFile.raw)
    if (res.code === 200) {
      infoForm.avatar = res.data
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(res.msg || '上传失败')
    }
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

// 保存基本信息
const saveInfo = async () => {
  profileSaving.value = true
  try {
    const res = await updateUserInfoApi(infoForm)
    if (res.code === 200) {
      ElMessage.success('信息更新成功')
      profileDialogVisible.value = false
      await loadUserInfo()
      const userStore = useUserStore()
      await userStore.fetchUserInfo()
    } else {
      ElMessage.error(res.msg || '更新失败')
    }
  } catch (e) {
    ElMessage.error('更新失败')
  } finally {
    profileSaving.value = false
  }
}

// 保存用户资料
const saveProfile = async () => {
  console.log("进入saveProfile函数")
  try {
    console.log("准备发起请求")
    const res = await updateUserProfileApi(profileForm)
    if (res.code === 200) {
      ElMessage.success('资料更新成功')
      profileLoaded.value = true
    }
  } catch (e) {
    console.log("进入catch")
    ElMessage.error('更新失败')
  }
}

// 切换状态筛选
const handleStatusChange = (status) => {
  myGoodsQuery.status = status
  myGoodsQuery.page = 1
  loadMyGoods()
}

// 我的商品翻页
const handleMyGoodsPageChange = (page) => {
  myGoodsQuery.page = page
  loadMyGoods()
}

// 钱包流水筛选
const handleWalletTypeChange = (type) => {
  walletLogQuery.type = type
  walletLogQuery.page = 1
  loadWalletLog()
}

// 钱包流水翻页
const handleWalletLogPageChange = (page) => {
  walletLogQuery.page = page
  loadWalletLog()
}

// 菜单切换
const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'release') loadMyGoods()
  if (index === 'wallet') loadWalletLog()
  if (index === 'info') loadUserProfile()
  if (index === 'buy') orderStore.fetchBuyOrders()
  if (index === 'sell') orderStore.fetchSellOrders()
  if (index === 'address') loadAddressList()
}

// 加载收货地址列表
const loadAddressList = async () => {
  addressLoading.value = true
  try {
    const res = await getAddressListApi()
    if (res.code === 200) {
      addressList.value = res.data || []
    }
  } catch (e) {
    console.error('获取地址列表失败:', e)
  } finally {
    addressLoading.value = false
  }
}

// 显示地址编辑弹窗
const showAddressDialog = (addr) => {
  editingAddress.value = addr || null
  if (addr) {
    addressForm.receiver = addr.receiver
    addressForm.phone = addr.phone
    addressForm.address = addr.address
    addressForm.isDefault = addr.isDefault
  } else {
    addressForm.receiver = ''
    addressForm.phone = ''
    addressForm.address = ''
    addressForm.isDefault = 0
  }
  addressDialogVisible.value = true
}

// 保存收货地址
const handleSaveAddress = async () => {
  if (!addressFormRef.value) return
  await addressFormRef.value.validate(async (valid) => {
    if (!valid) return
    addressSaving.value = true
    try {
      let res
      if (editingAddress.value) {
        res = await updateAddressApi(editingAddress.value.id, addressForm)
      } else {
        res = await addAddressApi(addressForm)
      }
      if (res.code === 200) {
        ElMessage.success(editingAddress.value ? '地址更新成功' : '地址添加成功')
        addressDialogVisible.value = false
        loadAddressList()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    } catch (e) {
      ElMessage.error('操作失败')
    } finally {
      addressSaving.value = false
    }
  })
}

// 删除收货地址
const handleDeleteAddress = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该地址？', '删除地址', { type: 'warning' })
    const res = await deleteAddressApi(id)
    if (res.code === 200) {
      ElMessage.success('地址已删除')
      loadAddressList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

// 设置默认地址
const handleSetDefault = async (id) => {
  try {
    const res = await setDefaultAddressApi(id)
    if (res.code === 200) {
      ElMessage.success('已设为默认地址')
      loadAddressList()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}


// 业务类型文本
const businessTypeText = (type) => {
  const map = { 1: '充值', 2: '消费', 3: '退款', 4: '佣金', 5: '签到', 6: '活动' }
  return map[type] || '其他'
}

// 性别文本
const genderText = (g) => {
  const map = { 0: '未知', 1: '男', 2: '女' }
  return map[g] || '未知'
}

onMounted(async () => {
  const userStore = useUserStore()
  await userStore.fetchUserInfo()
  userInfo.nickname = userStore.nickname
  userInfo.avatar = userStore.avatar
  await Promise.all([loadUserInfo(), loadWallet(), loadCredit()])
})
</script>

<style scoped>
/* 全局背景与布局 */
.user-center-container {
  min-height: 100vh;
  background-color: #f6f7f9;
  padding-bottom: 50px;
}

.center-content {
  max-width: 1000px; /* 顶部布局不需要太宽，1000px 视觉最舒适 */
  margin: 0 auto;
  padding-top: 30px;
}

/* 顶部卡片 */
.header-card {
  background: #fff;
  border-radius: 24px;
  padding: 30px 30px 0 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  margin-bottom: 20px;
}

.user-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.user-main {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nickname {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #1e293b;
}

.user-tags {
  display: flex;
  gap: 8px;
}

/* 横向菜单美化 */
.top-horizontal-menu {
  border-bottom: none !important;
  justify-content: center;
}

.top-horizontal-menu .el-menu-item {
  font-size: 16px;
  height: 60px;
  line-height: 60px;
  margin: 0 15px;
  color: #64748b;
  border-bottom-width: 3px !important;
}

.top-horizontal-menu .el-menu-item.is-active {
  color: #eab308 !important; /* 闲鱼黄 */
  border-bottom-color: #eab308 !important;
  font-weight: bold;
}

/* 统计卡片 */
.stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.gold .stat-icon { background: #fef9c3; color: #ca8a04; }
.blue .stat-icon { background: #dbeafe; color: #2563eb; }
.red .stat-icon { background: #fee2e2; color: #dc2626; }

.stat-data { display: flex; flex-direction: column; }
.stat-data .label { font-size: 13px; color: #94a3b8; }
.stat-data .value { font-size: 20px; font-weight: bold; color: #1e293b; }

/* 主体内容区 */
.main-body {
  background: #fff;
  border-radius: 24px;
  padding: 40px;
  min-height: 400px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.section-title {
  margin-top: 0;
  margin-bottom: 25px;
  color: #334155;
  border-left: 4px solid #eab308;
  padding-left: 15px;
}

/* 动画效果 */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from { opacity: 0; transform: translateY(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }

/* 商品卡片样式 */
.card-col {
  margin-bottom: 15px;
}

.goods-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.goods-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.image-wrapper {
  height: 180px;
  overflow: hidden;
}

.goods-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.goods-card:hover .goods-image {
  transform: scale(1.05);
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f5f5;
  color: #999;
}

.goods-info {
  padding: 12px;
}

.goods-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-price-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.price-box {
  display: flex;
  align-items: baseline;
}

.symbol {
  font-size: 12px;
  color: #ff5722;
}

.price-num {
  font-size: 18px;
  font-weight: bold;
  color: #ff5722;
}

.goods-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-icon {
  font-size: 16px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}

.edit-icon:hover {
  color: #0ea5e9;
}

.status-info {
  display: flex;
  gap: 8px;
}

.view-count {
  font-size: 12px;
  color: #999;
}

.goods-time {
  font-size: 12px;
  color: #999;
  text-align: right;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
}

/* 表单容器 */
.form-container h3 {
  margin: 0 0 20px 0;
  color: #334155;
  border-left: 4px solid #eab308;
  padding-left: 15px;
  font-size: 16px;
}

/* 订单卡片 */
.order-card {
  display: flex;
  gap: 15px;
  padding: 15px;
  margin-bottom: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.order-card:hover {
  background: #f0f1f3;
  transform: translateY(-1px);
}
.order-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  flex-shrink: 0;
}
.order-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.order-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.order-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.order-price {
  color: #ff5000;
  font-weight: bold;
  font-size: 16px;
}
.order-time {
  font-size: 12px;
  color: #94a3b8;
}

/* 收货地址样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.address-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.2s;
}

.address-card:hover {
  background: #f0f1f3;
}

.address-info {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.receiver {
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
}

.phone {
  color: #64748b;
  font-size: 14px;
}

.address-detail {
  color: #475569;
  font-size: 14px;
  line-height: 1.5;
}

.address-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 头像上传样式 */
.avatar-uploader {
  text-align: center;
}

.avatar-uploader .el-avatar {
  cursor: pointer;
  transition: opacity 0.3s;
}

.avatar-uploader .el-avatar:hover {
  opacity: 0.8;
}

.avatar-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #94a3b8;
}
</style>