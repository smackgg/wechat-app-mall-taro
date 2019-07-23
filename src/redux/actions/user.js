import {
  userDetail,
  levelList,
  addressList,
  defaultAddress,
  userAmount,
  userCashLog,
  coupons,
  getableCoupons,
} from '@/services/user'
import { cError } from '@/utils'

export const GET_USER_DETAIL_SUCCESS = 'config/GET_USER_DETAIL_SUCCESS'
export const GET_LEVEL_LIST_SUCCESS = 'config/GET_LEVEL_LIST_SUCCESS'
export const GET_ADDRESS_LIST_SUCCESS = 'config/GET_ADDRESS_LIST_SUCCESS'
export const GET_DEFAULT_ADDRESS_SUCCESS = 'config/GET_DEFAULT_ADDRESS_SUCCESS'
export const GET_USER_AMOUNT_SUCCESS = 'config/GET_USER_AMOUNT_SUCCESS'
export const GET_USER_CASHLOG_SUCCESS = 'config/GET_USER_CASHLOG_SUCCESS'

export const GET_COUPONS_SUCCESS = 'config/GET_COUPONS_SUCCESS'
export const GET_GETABLE_COUPONS_SUCCESS = 'config/GET_GETABLE_COUPONS_SUCCESS'


// 用户详情
export const getUserDetail = () => async dispatch => {
  const res = await userDetail()
  dispatch({
    type: GET_USER_DETAIL_SUCCESS,
    data: res.data.base,
  })
  return res.data.base
}

// vip list
export const getLevelList = () => async dispatch => {
  const res = await levelList()
  dispatch({
    type: GET_LEVEL_LIST_SUCCESS,
    data: res.data.result,
  })
  return res.data
}

export const getAddressList = () => async dispatch => {
  const [error, res] = await cError(addressList())
  dispatch({
    type: GET_ADDRESS_LIST_SUCCESS,
    data: error ? [] : res.data,
  })
  return res.data
}

export const getDefaultAddress = () => async dispatch => {
  const [error, res] = await cError(defaultAddress())
  dispatch({
    type: GET_DEFAULT_ADDRESS_SUCCESS,
    data: error ? {} : res.data,
  })
  return res.data
}

// 获取用户资产
export const getUserAmount = () => async dispatch => {
  const [error, res] = await cError(userAmount())
  dispatch({
    type: GET_USER_AMOUNT_SUCCESS,
    data: error ? {} : res.data,
  })
  return res.data
}

// 获取用户资产
export const getUserCashLog = () => async dispatch => {
  const [error, res] = await cError(userCashLog())
  dispatch({
    type: GET_USER_CASHLOG_SUCCESS,
    data: error ? {} : res.data,
  })
  return res.data
}

// 获取优惠券列表
export const getCoupons = () => async dispatch => {
  const [error, res] = await cError(coupons())
  return dispatch({
    type: GET_COUPONS_SUCCESS,
    data: error ? {} : res.data,
  })
}

// 获取可领取优惠券
export const getGetableCoupons = data => async dispatch => {
  const [error, res] = await cError(getableCoupons(data))
  return dispatch({
    type: GET_GETABLE_COUPONS_SUCCESS,
    data: error ? [] : res.data,
  })
}
