// 商品模块 api

import request from '@/utils/request'
// 商品详情
export const productDetail = data => request({
  url: '/shop/goods/detail',
  data,
})
