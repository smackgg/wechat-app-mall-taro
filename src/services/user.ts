/*
  https://api.it120.cc/doc.html#/%E5%89%8D%E7%AB%AFapi%E6%8E%A5%E5%8F%A3%E6%96%87%E6%A1%A3/%E5%BE%AE%E4%BF%A1%E5%BC%80%E5%8F%91/amountUsingGET_7
  用户模块 api
*/
import request from '@/utils/request'

// 检测登录token是否有效
export const checkToken = () => request({
  url: '/user/check-token',
  interceptTokenError: false,
})

// 登录
export const login = (data: { code: string, type?: number }) => request({
  url: '/user/wxapp/login',
  method: 'POST',
  data: {
    ...data,
    type: 2,
  },
  interceptTokenError: false,
})

// 注册
export const register = (data: {
  code: string,
  encryptedData: string,
  iv: string,
  referrer: string,
}) => request({
  url: '/user/wxapp/register/complex',
  method: 'POST',
  data,
})

// 修改用户信息
export const modifyUserInfo = (data: {
  nick: string,
  extJsonStr: string,
}) => request({
  url: '/user/modify',
  method: 'POST',
  data,
})

// 获取用户详情信息
export const userDetail = () => request({
  url: '/user/detail',
})

// 绑定手机号
export const bindMobile = (data: {
  encryptedData: string,
  iv: string,
}) => request({
  url: '/user/wxapp/bindMobile',
  method: 'POST',
  data,
})

// 获取所有的会员等级列表
export const levelList = () => request({
  url: '/user/level/list',
  method: 'POST',
})

// 获取会员等级详情
export const levelDetail = (data: { id: string }) => request({
  url: '/user/level/info',
  data,
})

// 获取地址列表
export const addressList = () => request({
  url: '/user/shipping-address/list',
})


interface AddressInfo {
  provinceId: number | string
  cityId: number | string
  districtId: number | string
  linkMan: string
  address: string
  mobile: number | string
  code: number | string
  isDefault: boolean
}

interface ModifyAddressInfo {
  provinceId?: number | string
  cityId?: number | string
  districtId?: number | string
  linkMan?: string
  address?: string
  mobile?: number | string
  code?: number | string
  isDefault?: boolean
  id: number | string
}
// 添加地址
export const addAddress = (data: AddressInfo) => request({
  url: '/user/shipping-address/add',
  method: 'POST',
  data,
})

// 编辑地址
export const updateAddress = (data: ModifyAddressInfo) => request({
  url: '/user/shipping-address/update',
  method: 'POST',
  data,
})

// 删除地址
export const deleteAddress = (data: ModifyAddressInfo) => request({
  url: '/user/shipping-address/delete',
  method: 'POST',
  data,
})

// 获取默认地址
export const defaultAddress = () => request({
  url: '/user/shipping-address/default',
})

// 查看用户资产
export const userAmount = () => request({
  url: '/user/amount',
})

// 查看用户用户资金流水
export const userCashLog = () => request({
  url: '/user/cashLog',
})

// 获取积分明细
export const userScoreLog = () => request({
  url: '/score/logs',
})

// 查询用户优惠券
export const coupons = (data: { status: number }) => request({
  url: '/discounts/my',
  data,
})

// 查询可领取优惠券
export const getableCoupons = () => request({
  url: '/discounts/coupons',
})

// 领取优惠券
export const getCoupon = data => request({
  url: '/discounts/fetch',
  method: 'POST',
  data,
})

// 用户充值赠送规则
export const rechargeSendRules = () => request({
  url: '/user/recharge/send/rule',
})

// 用户在线买单减免规则
export const payBillDiscounts = () => request({
  url: '/payBill/discounts',
})
