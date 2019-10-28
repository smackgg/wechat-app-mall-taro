/*
  商品模块 api
*/
import request from '@/utils/request'


// 商品详情
export const productDetail = (data: { id: string }) => request({
  url: '/shop/goods/detail',
  data,
})

// 获取sku库存、价格
export const productPrice = (data: {
  propertyChildIds: string,
  goodsId: string,
}) => request({
  url: '/shop/goods/price',
  method: 'POST',
  data,
})

// 获取商品列表

/*
*
* @param {String} categoryId
* recommendStatus
*/
// 获取sku库存、价格
export const products = (data: {
  categoryId?: number,
  recommendStatus?: number,
  page?: number,
  pageSize?: number,
}) => request({
  url: '/shop/goods/list',
  method: 'POST',
  data,
})

// 获取分类
export const category = () => request({
  url: '/shop/goods/category/all',
})

// 获取商品评价列表
export const reputation = (data: {
  goodsId: string,
}) => request({
  url: '/shop/goods/reputation',
  data,
})
