import {
  userDetail,
  levelList,
  addressList,
  defaultAddress,
  userAmount,
} from '@/services/user'
import { cError } from '@/utils'

export const GET_USER_DETAIL_SUCCESS = 'config/GET_USER_DETAIL_SUCCESS'
export const GET_LEVEL_LIST_SUCCESS = 'config/GET_LEVEL_LIST_SUCCESS'
export const GET_ADDRESS_LIST_SUCCESS = 'config/GET_ADDRESS_LIST_SUCCESS'
export const GET_DEFAULT_ADDRESS_SUCCESS = 'config/GET_DEFAULT_ADDRESS_SUCCESS'
export const GET_USER_AMOUNT_SUCCESS = 'config/GET_USER_AMOUNT_SUCCESS'

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

