<template>
  <div class="publish-container">
    <el-card class="publish-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="header-icon"><CirclePlus /></el-icon>
            <span class="header-title">发布闲置资产</span>
          </div>
          <el-tag type="primary" effect="plain" class="chain-status">
            <el-icon><Link /></el-icon> 准备接入 Web3 存证
          </el-tag>
        </div>
      </template>

      <el-form 
        :model="goodsForm" 
        :rules="rules" 
        ref="formRef" 
        label-position="top"
        class="custom-form"
      >
        <el-form-item label="资产名称" prop="title">
          <el-input 
            v-model="goodsForm.title" 
            placeholder="例如：iPhone 15 Pro / 绝版游戏存档 / 专业Logo设计" 
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="资产分类" prop="categoryId">
              <el-cascader
                v-model="goodsForm.categoryId"
                :props="cascaderProps"
                placeholder="动态加载分类"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="成色/状态评估" prop="quality">
              <el-radio-group v-model="goodsForm.quality" class="quality-group">
                <el-radio-button :value="1">全新/极优</el-radio-button>
                <el-radio-button :value="2">良好</el-radio-button>
                <el-radio-button :value="3">常用</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="转让价格 (CNY)" prop="price">
              <el-input-number 
                v-model="goodsForm.price" 
                :precision="2" 
                :step="100" 
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入手原价 (CNY)" prop="originalPrice">
              <el-input-number 
                v-model="goodsForm.originalPrice" 
                :precision="2" 
                :step="100" 
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="详细介绍" prop="description">
          <el-input
            v-model="goodsForm.description"
            type="textarea"
            :rows="6"
            placeholder="请详细描述资产的来源、功能细节、交付方式或保修情况..."
            resize="none"
          />
        </el-form-item>

        <el-form-item label="实拍图片/展示截图 (最多3张)" prop="imageUrls">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-change="handleImageChange"
            :on-remove="handleRemove"
            :limit="3"
            class="image-uploader"
          >
            <div class="upload-slot">
              <el-icon><CameraFilled /></el-icon>
              <span>添加图片</span>
            </div>
          </el-upload>
        </el-form-item>

        <div class="form-footer">
          <div class="footer-tips">
            <el-icon><InfoFilled /></el-icon>
            支持实物、虚拟卡密、技术攻略发布
          </div>
          <div class="action-btns">
            <el-button @click="resetForm" size="large" class="cancel-btn">重置</el-button>
            <el-button type="primary" size="large" class="submit-btn" @click="submitForm">
              立即发布资产
            </el-button>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { CameraFilled, CirclePlus, Link, InfoFilled } from '@element-plus/icons-vue'
import { uploadGoodsImgApi } from '@/api/common'
import { getLevel1Api, getChildrenApi } from '@/api/category'
import { publishProductApi } from '@/api/goods'
import { ElMessage } from 'element-plus'

const formRef = ref()
const loading = ref(false)

// 1. 对应后端的 GoodsDTO
const goodsForm = reactive({
  title: '',
  description: '',
  price: 0.00,
  originalPrice: 0.00,
  categoryId: null, // 级联选择器最终绑定的值
  quality: 1,
  imageUrls: [] 
})

// 2. 级联选择器：懒加载配置 (核心修改区)
const cascaderProps = {
  lazy: true,
  emitPath: false,
  // 如果你的数据库里只有两级，这样配置最稳
  async lazyLoad(node, resolve) {
    const { level, data } = node
    
    try {
      let nodes = []
      if (level === 0) {
        // --- 第一步：请求一级分类 (后端 SQL: where parent_id = 0) ---
        const res = await getLevel1Api()
        if (res.code === 200) {
          nodes = res.data.map(item => ({
            value: item.id,
            label: item.name,
            leaf: false // 一级分类下面肯定有二级
          }))
        }
      } else {
        // --- 第二步：根据一级 ID 请求二级 (后端 SQL: where parent_id = #{parentId}) ---
        const res = await getChildrenApi(data.value)
        if (res.code === 200) {
          nodes = res.data.map(item => ({
            value: item.id,
            label: item.name,
            leaf: true // 到了二级就标记为叶子节点，停止展开
          }))
        }
      }
      resolve(nodes)
    } catch (e) {
      console.error('分类加载失败:', e)
      resolve([]) // 必须 resolve 否则级联组件会一直处于加载状态
    }
  }
}

// 3. 处理图片上传
const handleImageChange = async (uploadFile) => {
  if (uploadFile.status !== 'ready') return
  try {
    const res = await uploadGoodsImgApi(uploadFile.raw)
    // 注意：这里也改为 200，或者根据你 common/upload 接口的实际返回来定
    if (res.code === 200) { 
      const serverUrl = res.data
      goodsForm.imageUrls.push(serverUrl)
      uploadFile.serverUrl = serverUrl 
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error(res.msg || '上传失败')
    }
  } catch (err) {
    ElMessage.error('图片服务器连接失败')
  }
}

// 4. 处理图片删除
const handleRemove = (uploadFile) => {
  const targetUrl = uploadFile.serverUrl
  const index = goodsForm.imageUrls.indexOf(targetUrl)
  if (index !== -1) {
    goodsForm.imageUrls.splice(index, 1)
  }
}

// 5. 提交发布
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (goodsForm.imageUrls.length === 0) {
        return ElMessage.warning('请至少上传一张实拍图')
      }
      
      loading.value = true
      try {
        const res = await publishProductApi(goodsForm)
        if (res.code === 200) {
          ElMessage.success('资产发布成功！正在同步 Web3 存证...')
          resetForm()
        } else {
          ElMessage.error(res.msg || '发布失败')
        }
      } catch (err) {
        ElMessage.error('发布请求异常，请检查后端接口')
      } finally {
        loading.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
  goodsForm.imageUrls = []
}

// 校验规则
const rules = {
  title: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格' }],
  description: [{ required: true, message: '请输入详细描述', trigger: 'blur' }]
}
</script>

<style scoped>
.publish-container {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.publish-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 20px;
  color: #0ea5e9;
}

.header-title {
  font-weight: 700;
  font-size: 18px;
  color: #1e293b;
}

.chain-status {
  font-family: monospace;
  font-weight: 600;
}

/* 样式适配 Layout */
:deep(.el-form-item__label) {
  font-weight: 600;
  color: #475569;
}

:deep(.el-input__wrapper), 
:deep(.el-textarea__inner),
:deep(.el-input-number__wrapper),
:deep(.el-cascader .el-input__wrapper) {
  background-color: #f8fafc !important;
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;
  border-radius: 8px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #0ea5e9 inset !important;
}

/* Radio Button 风格化 */
.quality-group { display: flex; gap: 8px; }
:deep(.el-radio-button__inner) {
  border-radius: 6px !important;
  border: 1px solid #e2e8f0 !important;
  background: white;
  color: #64748b;
}
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #0ea5e9 !important;
  border-color: #0ea5e9 !important;
  color: white;
}

.upload-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #94a3b8;
}

/* 底部按钮 */
.form-footer {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-tips {
  font-size: 13px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
}

.submit-btn {
  background-color: #0ea5e9 !important;
  border-color: #0ea5e9 !important;
  padding: 0 32px;
  font-weight: 600;
  height: 48px;
}
</style>