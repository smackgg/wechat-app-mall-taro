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

