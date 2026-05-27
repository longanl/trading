<template>
  <div class="detail-container" v-loading="loading">
    <div v-if="goods" class="content-box">
      <div class="seller-card">
        <div class="seller-left">
          <el-avatar :size="48" :src="goods.avatar || 'https://api.dicebear.com/8.x/fun-emoji/svg?seed=common'" />
          <div class="seller-meta">
            <div class="name-row">
              <span class="nickname">{{ goods.nickname || '神秘用户' }}</span>
              <el-tag size="small" type="warning" effect="dark" class="credit-tag">实名认证</el-tag>
            </div>
            <div class="stats-row">
              <span>发布于 {{ formatDate(goods.updateTime) }} | 浏览 {{ goods.viewCount || 0 }}</span>
            </div>
          </div>
        </div>
        <div class="seller-right">
          <el-button round icon="Shop">闲鱼号</el-button>
        </div>
      </div>

      <div class="goods-main">
        <el-row :gutter="30">
          <el-col :md="10" :sm="24">
            <div class="gallery-container">
              <div class="thumb-list" v-if="goods.imageUrls && goods.imageUrls.length">
                <div 
                  v-for="(url, index) in goods.imageUrls" 
                  :key="index"
                  :class="['thumb-item', currentImgIndex === index ? 'active' : '']"
                  @click="currentImgIndex = index"
                >
                  <el-image :src="url" fit="cover" />
                </div>
              </div>
              
              <div class="main-image-wrapper">
                <el-image 
                  v-if="goods.imageUrls && goods.imageUrls.length"
                  :src="goods.imageUrls[currentImgIndex]" 
                  class="main-img" 
                  :preview-src-list="goods.imageUrls"
                  :initial-index="currentImgIndex"
                />
                <el-empty v-else description="暂无图片" :image-size="100" />
                
                <div v-if="goods.imageUrls?.length > 1" class="image-nav left" @click="prevImg">
                  <el-icon><ArrowLeft /></el-icon>
                </div>
                <div v-if="goods.imageUrls?.length > 1" class="image-nav right" @click="nextImg">
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>
            </div>
            <div class="report-bar">
              <span><el-icon><CircleCheck /></el-icon> 担保交易 · 资产已存证</span>
              <span class="report-link">举报</span>
            </div>
          </el-col>

          <el-col :md="14" :sm="24">
            <div class="info-side">
              <div class="price-line">
                <span class="price-symbol">￥</span>
                <span class="price-value">{{ goods.price }}</span>
                <span class="postage" v-if="goods.originalPrice">
                  原价: <del>￥{{ goods.originalPrice }}</del>
                </span>
                <div class="browse-stats">{{ goods.collectCount || 0 }}人想要 | {{ goods.viewCount || 0 }}浏览</div>
              </div>

              <div class="description-area">
                <h2 style="margin-bottom: 10px;">{{ goods.title }}</h2>
                <p class="desc-text">{{ goods.description }}</p>
                <div class="attribute-list">
                  <div class="attr-item"><span>分类：</span>{{ goods.categoryName || '未分类' }}</div>
                  <div class="attr-item">
                    <span>成色：</span>
                    {{ goods.quality === 1 ? '全新' : goods.quality === 2 ? '良好' : '常用' }}
                  </div>
                </div>
              </div>

              <div class="action-footer">
                <div class="main-btns">
                  <el-button type="warning" class="chat-btn" size="large">
                    <el-icon><ChatDotRound /></el-icon> 聊一聊
                  </el-button>
                  <el-button type="info" class="buy-btn" size="large" @click="handleBuy">
                    立即购买
                  </el-button>
                </div>
                <el-button class="collect-btn" size="large" round>
                  <el-icon><Star /></el-icon> 收藏
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <el-empty v-else-if="!loading" description="该资产已失效" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, ChatDotRound, Star, CircleCheck, Shop } from '@element-plus/icons-vue'
import { getGoodsDetailApi } from '@/api/goods'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const goods = ref(null)
const loading = ref(true)
const currentImgIndex = ref(0) // 当前展示图片的索引

// 加载详情数据
const loadDetail = async () => {
  // 注意：如果是通过雪花算法生成的长 ID，建议从 route.query 获取后转为字符串
  const id = route.query.id
  if (!id) {
    ElMessage.error('参数错误')
    loading.value = false
    return
  }
  
  try {
    const res = await getGoodsDetailApi(id)
    if (res.code === 200 || res.code === 1) {
      goods.value = res.data
      // 兼容处理：如果没有图片数组，初始化为空数组
      if (!goods.value.imageUrls) {
        goods.value.imageUrls = []
      }
    } else {
      ElMessage.error(res.msg || '获取详情失败')
    }
  } catch (err) {
    console.error('详情加载异常:', err)
  } finally {
    loading.value = false
  }
}

// 跳转下单确认页
const handleBuy = () => {
  if (!goods.value) return
  if (goods.value.status !== 1) {
    ElMessage.warning('该商品已不可购买')
    return
  }
  if(!goods.value.id){
    console.log("goodsid为空")
  }
  router.push(`/order/confirm?goodsId=${String(goods.value.id)}`)
}

// 图片切换逻辑
const prevImg = () => {
  if (currentImgIndex.value > 0) {
    currentImgIndex.value--
  } else {
    currentImgIndex.value = goods.value.imageUrls.length - 1
  }
}

const nextImg = () => {
  if (currentImgIndex.value < goods.value.imageUrls.length - 1) {
    currentImgIndex.value++
  } else {
    currentImgIndex.value = 0
  }
}

// 简单时间格式化
const formatDate = (dateStr) => {
  if (!dateStr) return '未知时间'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

onMounted(loadDetail)
</script>

<style scoped>
.detail-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 15px;
}

.content-box {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
}

/* 卖家信息栏 */
.seller-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 16px;
  margin-bottom: 24px;
}
.seller-left { display: flex; gap: 12px; }
.nickname { font-weight: bold; font-size: 16px; margin-right: 8px; }
.credit-tag { border-radius: 4px; border: none; font-size: 11px; }
.stats-row { color: #999; font-size: 12px; margin-top: 4px; }

/* 图片画廊 */
.gallery-container {
  display: flex;
  gap: 12px;
}
.thumb-list { width: 60px; display: flex; flex-direction: column; gap: 8px; }
.thumb-item { 
  width: 60px; height: 60px; border-radius: 8px; overflow: hidden; 
  border: 2px solid transparent; cursor: pointer;
}
.thumb-item.active { border-color: #333; }
.main-image-wrapper { 
  flex: 1; position: relative; border-radius: 12px; overflow: hidden;
  aspect-ratio: 1/1; background: #f1f1f1;
}
.image-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 36px; height: 36px; background: rgba(255,255,255,0.8);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.image-nav.left { left: 10px; }
.image-nav.right { right: 10px; }

.report-bar { 
  margin-top: 12px; display: flex; justify-content: space-between; 
  font-size: 12px; color: #007bff; 
}
.report-link { color: #999; cursor: pointer; }

/* 右侧信息 */
.info-side { display: flex; flex-direction: column; height: 100%; }
.price-line { margin-bottom: 24px; position: relative; }
.price-symbol { color: #ff5000; font-size: 18px; font-weight: bold; }
.price-value { color: #ff5000; font-size: 36px; font-weight: 800; }
.postage { color: #666; font-size: 14px; margin-left: 10px; }
.browse-stats { position: absolute; right: 0; top: 15px; color: #ccc; font-size: 12px; }

.desc-text { 
  font-size: 18px; line-height: 1.6; color: #333; font-weight: 500;
  margin-bottom: 30px; white-space: pre-wrap;
}

.attribute-list { color: #999; font-size: 14px; display: flex; gap: 40px; margin-bottom: 40px; }

/* 底部操作区 */
.action-footer { margin-top: auto; display: flex; gap: 15px; align-items: center; }
.main-btns { 
  display: flex; flex: 1; border-radius: 12px; overflow: hidden; 
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}
.chat-btn { 
  background: #0ea5e9 !important; color: #333 !important; border: none !important; 
  width: 50%; height: 54px !important; font-weight: bold; border-radius: 0 !important;
}
.buy-btn { 
  background: #1e293b !important; color: #fff !important; border: none !important; 
  width: 50%; height: 54px !important; font-weight: bold; border-radius: 0 !important;
}
.collect-btn { background: #f2f2f2 !important; border: none !important; height: 54px !important; }
</style>