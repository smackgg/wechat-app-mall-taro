/*
  https://api.it120.cc/doc.html#/%E5%89%8D%E7%AB%AFapi%E6%8E%A5%E5%8F%A3%E6%96%87%E6%A1%A3/%E7%AB%99%E7%82%B9%E8%AE%BE%E7%BD%AE/siteTypeUsingGET
  站点设置 api
*/
import request from '@/utils/request'

// 当前商户vip级别
export const vipLevel = () => request({
  url: '/config/vipLevel',
})

// 获取系统参数等（商城名称、最小充值金额
export const systemConfig = (data: { keys: string }) => request({
  url: '/config/values',
  data,
})

// 获取banner
export const banners = (data: { type: string }) => request({
  url: '/banner/list',
  data,
})

// 其它接口
// 获取省份列表
export const province = () => request({
  url: '/common/region/province',
  needSubDomain: false,
})

// 获取下级省市区数据
export const nextRegion = (data: { pid: string }) => request({
  url: '/common/region/child',
  needSubDomain: false,
  data,
})

