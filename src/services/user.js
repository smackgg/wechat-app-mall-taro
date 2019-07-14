// https://api.it120.cc/doc.html#/%E5%89%8D%E7%AB%AFapi%E6%8E%A5%E5%8F%A3%E6%96%87%E6%A1%A3/%E5%BE%AE%E4%BF%A1%E5%BC%80%E5%8F%91/amountUsingGET_7
// 用户模块 api
import request from '@/utils/request'

// 检测登录token是否有效
export const checkToken = () => request({
  url: '/user/check-token',
})

// 登录
export const login = data => request({
  url: '/user/wxapp/login',
  method: 'post',
  data: {
    ...data,
    type: 2,
  },
})

// 注册
export const register = data => request({
  url: '/user/wxapp/register/complex',
  method: 'post',
  data,
})

// 获取用户详情信息
export const userDetail = () => request({
  url: '/user/detail',
})

// 绑定手机号
export const bindMobile = data => request({
  url: '/user/wxapp/bindMobile',
  method: 'post',
  data,
})

// 获取所有的会员等级列表
export const levelList = () => request({
  url: '/user/level/list',
  method: 'post',
})
