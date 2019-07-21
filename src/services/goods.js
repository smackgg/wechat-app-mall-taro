/*
  商品模块 api
*/
import request from '@/utils/request'
// 商品详情
export const productDetail = data => request({
  url: '/shop/goods/detail',
  data,
})

// 获取sku库存、价格
export const productPrice = data => request({
  url: '/shop/goods/price',
  method: 'post',
  data,
})

// 获取商品列表

/*
*
* @param {String} categoryId
* recommendStatus
*/
// 获取sku库存、价格
export const products = data => request({
  url: '/shop/goods/list',
  method: 'post',
  data,
})

// 获取分类
export const category = () => request({
  url: '/shop/goods/category/all',
})
