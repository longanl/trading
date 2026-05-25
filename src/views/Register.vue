<template>
  <div style="width:300px;margin:100px auto;">
    <h2 style="text-align:center;margin-bottom:20px;">注册账号</h2>
    <el-input v-model="form.email" placeholder="邮箱" />
    <el-input v-model="form.password" type="password" placeholder="密码" style="margin-top:10px" show-password />
    <el-input v-model="confirmPassword" type="password" placeholder="确认密码" style="margin-top:10px" show-password />
    <el-button type="primary" @click="register" style="margin-top:10px;width:100%" :loading="loading">
      注册
    </el-button>
    <div style="text-align:center;margin-top:15px;">
      <span style="color:#999;font-size:13px;">已有账号？</span>
      <el-link type="primary" @click="router.push('/login')">去登录</el-link>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { registerApi } from '@/api/user'

const router = useRouter()
const loading = ref(false)
const confirmPassword = ref('')

const form = reactive({
  email: '',
  password: ''
})

const register = async () => {
  if (!form.email || !form.password) {
    ElMessage.warning('请填写邮箱和密码')
    return
  }
  if (form.password !== confirmPassword.value) {
    ElMessage.error('两次密码不一致')
    return
  }
  loading.value = true
  try {
    const res = await registerApi(form)
    if (res.code === 200) {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    }
  } catch (e) {
    ElMessage.error('注册失败，邮箱可能已被使用')
  } finally {
    loading.value = false
  }
}
</script>
