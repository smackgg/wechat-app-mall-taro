/*
  https://api.it120.cc/doc.html#/%E5%89%8D%E7%AB%AFapi%E6%8E%A5%E5%8F%A3%E6%96%87%E6%A1%A3/%E5%BE%AE%E4%BF%A1%E5%BC%80%E5%8F%91/amountUsingGET_7
  订单 api
*/
import request from '@/utils/request'

// 创建订单
export const createOrder = data => request({
  url: '/order/create',
  method: 'post',
  data,
})

// 获取订单详情
export const orderDetail = data => request({
  url: '/order/detail',
  data,
})

// 使用余额支付订单
export const orderPay = data => request({
  url: '/order/pay',
  method: 'post',
  data,
})

// 在线买单
export const billPay = data => request({
  url: '/payBill/pay',
  method: 'post',
  data,
})

// 查询订单统计
export const orderStatistics = () => request({
  url: '/order/statistics',
})

// 订单列表
export const orderList = data => request({
  url: '/order/list',
  method: 'post',
  data,
})

// 取消订单
export const orderClose = data => request({
  url: '/order/close',
  method: 'post',
  data,
})

// 确认收货
export const orderDelivery = data => request({
  url: '/order/delivery',
  method: 'post',
  data,
})

// 订单评价
export const orderReputation = data => request({
  url: '/order/reputation',
  method: 'post',
  data,
})
