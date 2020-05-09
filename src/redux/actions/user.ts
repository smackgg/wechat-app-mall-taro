import {
  userDetail,
  levelList,
  addressList,
  defaultAddress,
  userAmount,
  userCashLog,
  coupons,
  getableCoupons,
  userScoreLog,
  rechargeSendRules,
  payBillDiscounts,
  levelDetail,
} from '@/services/user'
import { cError } from '@/utils'
import { Dispatch } from 'redux'

export const GET_USER_DETAIL_SUCCESS = 'config/GET_USER_DETAIL_SUCCESS'
export const GET_LEVEL_LIST_SUCCESS = 'config/GET_LEVEL_LIST_SUCCESS'
export const GET_LEVEL_DETAIL_SUCCESS = 'config/GET_LEVEL_DETAIL_SUCCESS'
export const GET_ADDRESS_LIST_SUCCESS = 'config/GET_ADDRESS_LIST_SUCCESS'
export const GET_DEFAULT_ADDRESS_SUCCESS = 'config/GET_DEFAULT_ADDRESS_SUCCESS'
export const GET_USER_AMOUNT_SUCCESS = 'config/GET_USER_AMOUNT_SUCCESS'
export const GET_USER_CASHLOG_SUCCESS = 'config/GET_USER_CASHLOG_SUCCESS'
export const GET_USER_SCORELOG_SUCCESS = 'config/GET_USER_SCORELOG_SUCCESS'
export const GET_RECHARGE_RULES_SUCCESS = 'config/GET_RECHARGE_RULES_SUCCESS'
export const GET_BILL_RULES_SUCCESS = 'config/GET_BILL_RULES_SUCCESS'

// 优惠券
export const GET_COUPONS_SUCCESS = 'config/GET_COUPONS_SUCCESS'
export const GET_GETABLE_COUPONS_SUCCESS = 'config/GET_GETABLE_COUPONS_SUCCESS'

// 购物车
export const ADD_SHOP_CART = 'config/ADD_SHOP_CART'
export const UPDATE_SHOP_CART = 'config/UPDATE_SHOP_CART'

// 用户详情
export const getUserDetail = () => async (dispatch: Dispatch) => {
  const res = await userDetail()
  const { base, ext = {} } = res.data
  dispatch({
    type: GET_USER_DETAIL_SUCCESS,
    data: {
      ...base,
      ext,
    },
  })
  return res.data.base
}

// vip list
export const getLevelList = () => async (dispatch: Dispatch) => {
  const res = await levelList()
  dispatch({
    type: GET_LEVEL_LIST_SUCCESS,
    data: res.data.result,
  })
  return res.data
}

// 获取会员详情
export const getLevelDetail = (data: Parameters<typeof levelDetail>[0]) => async (dispatch: Dispatch) => {
  const res = await levelDetail(data)
  dispatch({
    type: GET_LEVEL_DETAIL_SUCCESS,
    data: res.data,
    id: data.id,
  })
  return res.data
}


export const getAddressList = () => async (dispatch: Dispatch) => {
  const [error, res] = await cError(addressList())
  dispatch({
    type: GET_ADDRESS_LIST_SUCCESS,
    data: error ? [] : res.data,
  })
  return res.data
}

export const getDefaultAddress = () => async (dispatch: Dispatch) => {
  const [error, res] = await cError(defaultAddress())
  dispatch({
    type: GET_DEFAULT_ADDRESS_SUCCESS,
    data: error ? null : res.data,
  })
  return res.data
}

// 获取用户资产
export const getUserAmount = () => async (dispatch: Dispatch) => {
  const [error, res] = await cError(userAmount())
  dispatch({
    type: GET_USER_AMOUNT_SUCCESS,
    data: error ? {} : res.data,
  })
  return res.data
}

// 获取用户明细
export const getUserCashLog = () => async (dispatch: Dispatch) => {
  const [error, res] = await cError(userCashLog())
  dispatch({
    type: GET_USER_CASHLOG_SUCCESS,
    data: error ? [] : res.data,
  })
  return res.data
}

// 获取积分明细
export const getUserScoreLog = () => async (dispatch: Dispatch) => {
  const [error, res] = await cError(userScoreLog())
  dispatch({
    type: GET_USER_SCORELOG_SUCCESS,
    data: (error ? [] : res.data.result).map((item: any) => ({
      ...item,
      amount: Math.abs(item.score),
    })),
  })
  return res.data
}


// 获取优惠券列表
export const getCoupons = (data: Parameters<typeof coupons>[0]) => async (dispatch: Dispatch) => {
  const [error, res] = await cError(coupons(data))
  return dispatch({
    type: GET_COUPONS_SUCCESS,
    data: error ? [] : res.data,
  })
}

// 获取可领取优惠券
export const getGetableCoupons = () => async (dispatch: Dispatch) => {
  const [error, res] = await cError(getableCoupons())
  return dispatch({
    type: GET_GETABLE_COUPONS_SUCCESS,
    data: error ? [] : res.data,
  })
}

type ProductInfo = {
  number: number | string
  goodsId: string
  propertyChildIds: string
  active?: boolean
}
type AddCartParams = {
  type?: string
  productInfo: ProductInfo
}

// 添加购物车
export const addCart = ({
  type = 'cart',
  productInfo,
}: AddCartParams) => async (dispatch: Dispatch) => dispatch({
  type: ADD_SHOP_CART,
  data: productInfo,
  actionType: type,
})

// 更新购物车信息
export const updateCart = ({
  type = 'update',
  products,
}: {
  type?: string,
  products: ProductInfo[]
}) => async (dispatch: Dispatch) => {
  return dispatch({
    type: UPDATE_SHOP_CART,
    products,
    actionType: type,
  })
}

// 获取用户充值赠送规则
export const getRechargeSendRules = () => async (dispatch: Dispatch) => {
  const res = await rechargeSendRules()
  return dispatch({
    type: GET_RECHARGE_RULES_SUCCESS,
    data: res.data,
  })
}

// 获取用户在线买单优惠规则
export const getPayBillDiscounts = () => async (dispatch: Dispatch) => {
  const res = await payBillDiscounts()
  return dispatch({
    type: GET_BILL_RULES_SUCCESS,
    data: res.data,
  })
}
