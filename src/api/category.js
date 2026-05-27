import request from '@/utils/request'

// 获取一级分类
export function getLevel1Api() {
  return request({ url: '/category/level1', method: 'get' })
}

// 获取子分类
export function getChildrenApi(parentId) {
  return request({ url: `/category/children/${String(parentId)}`, method: 'get' })
}