// https://api.it120.cc/doc.html#/%E5%89%8D%E7%AB%AFapi%E6%8E%A5%E5%8F%A3%E6%96%87%E6%A1%A3/%E7%AB%99%E7%82%B9%E8%AE%BE%E7%BD%AE/siteTypeUsingGET
// 站点设置 api
import request from '@/utils/request'

// 当前商户vip级别
export const vipLevel = () => request({
  url: '/config/vipLevel',
})
