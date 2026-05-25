import request from '@/utils/request'

// 上传文件（通用）
export const uploadFileApi = (file, type) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`/common/upload/${type}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 上传用户头像
export function uploadUserAvatarApi(file) {
  return uploadFileApi(file, 'user')
}

// 上传商品图片
export function uploadGoodsImgApi(file) {
  return uploadFileApi(file, 'goods')
}