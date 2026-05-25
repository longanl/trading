<template>
  <div class="home-container">
    <div class="filter-bar">
      <div class="left">
        <span class="status-text">全部宝贝 <span class="count">({{ total }})</span></span>
      </div>
      <div class="right">
        <el-radio-group v-model="query.sort" size="small" @change="handleSort">
          <el-radio-button :value="1">综合</el-radio-button>
          <el-radio-button :value="2">最新</el-radio-button>
          <el-radio-button :value="3">价格</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div v-loading="loading" element-loading-text="正在搜寻宝贝...">
      <el-row :gutter="15">
        <el-col 
          v-for="item in goodsList" 
          :key="item.id" 
          :xs="12" :sm="8" :md="6" :lg="4.8" 
          class="card-col"
        >
          <el-card 
            class="goods-card" 
            :body-style="{ padding: '0px' }" 
            shadow="hover"
            @click="toDetail(item.id)"
          >
            <div class="image-wrapper">
              <el-image 
                :src="item.image" 
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
                <span v-if="item.originalPrice" class="original-price">￥{{ item.originalPrice }}</span>
              </div>
              <div class="goods-footer">
                <div class="seller-info">
                  <el-avatar :size="16" icon="UserFilled" />
                  <span class="user-name">用户{{ item.userId }}</span>
                </div>
                <el-tag size="small" type="success" effect="plain" class="quality-tag">
                  {{ getQualityText(item.quality) }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.size"
        layout="prev, pager, next, jumper"
        :total="total"
        background
        @current-change="handlePageChange"
      />
    </div>

    <el-empty 
      v-if="!loading && goodsList.length === 0" 
      description="这里空空如也，去发布第一个商品吧！" 
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getGoodsListApi } from '@/api/goods'

const router = useRouter()
const loading = ref(false)
const goodsList = ref([])
const total = ref(0)

// 查询参数
const query = reactive({
  keyword: '',
  categoryId: null,
  sort: 1, // 1:综合, 2:最新, 3:价格
  page: 1,
  size: 10
})

// 加载数据
const loadGoods = async () => {
  loading.value = true
  try {
    const res = await getGoodsListApi(query)
    if (res.code === 200) {
      // 适配 IPage 返回结构：res.data 为 PageResult 对象，包含 list 和 total
      goodsList.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 跳转详情页
const toDetail = (id) => {
  router.push({
    path: '/goods/detail',
    query: { id }
  })
}

// 切换排序
const handleSort = () => {
  query.page = 1
  loadGoods()
}

// 切换页码
const handlePageChange = (page) => {
  query.page = page
  loadGoods()
  // 滚动回顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 转化成色文本
const getQualityText = (quality) => {
  const map = { 1: '全新', 2: '九成新', 3: '八成新', 4: '七成新' }
  return map[quality] || '普通'
}

onMounted(() => {
  loadGoods()
})
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 10px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 0 5px;
}

.status-text {
  font-size: 16px;
  color: #334155;
  font-weight: 600;
}

.status-text .count {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 400;
}

.card-col {
  margin-bottom: 20px;
}

.goods-card {
  border-radius: 10px;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  background: #fff;
}

.goods-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1);
}

.image-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: #f1f5f9;
  position: relative;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #94a3b8;
  font-size: 12px;
}

.goods-image {
  width: 100%;
  height: 100%;
}

.goods-info {
  padding: 12px;
}

.goods-title {
  font-size: 14px;
  color: #1e293b;
  height: 40px;
  line-height: 20px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
}

.goods-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 10px;
}

.price-box {
  color: #f43f5e;
}

.symbol {
  font-size: 12px;
  font-weight: bold;
}

.price-num {
  font-size: 20px;
  font-weight: 800;
}

.original-price {
  font-size: 12px;
  color: #94a3b8;
  text-decoration: line-through;
}

.goods-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-name {
  font-size: 12px;
  color: #64748b;
}

.quality-tag {
  border: none;
  background-color: #f0fdf4;
  color: #16a34a;
}

.pagination-wrapper {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  padding-bottom: 20px;
}

/* 强制 5 列布局适配 */
@media (min-width: 1200px) {
  .el-col-lg-4-8 {
    max-width: 20%;
    flex: 0 0 20%;
  }
}
</style>