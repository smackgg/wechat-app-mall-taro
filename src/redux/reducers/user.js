import Taro from '@tarojs/taro'
import { addCart, updateCart } from '@/utils/shopCart'
import { setCartBadge } from '@/utils'

import {
  GET_USER_DETAIL_SUCCESS,
  GET_LEVEL_LIST_SUCCESS,
  GET_ADDRESS_LIST_SUCCESS,
  GET_DEFAULT_ADDRESS_SUCCESS,
  GET_USER_AMOUNT_SUCCESS,
  GET_USER_CASHLOG_SUCCESS,
  GET_COUPONS_SUCCESS,
  GET_GETABLE_COUPONS_SUCCESS,
  ADD_SHOP_CART,
  UPDATE_SHOP_CART,
  GET_USER_SCORELOG_SUCCESS,
  GET_RECHARGE_RULES_SUCCESS,
} from '../actions/user'

const shopCartInfo = Taro.getStorageSync('shopCartInfo') || {}

setCartBadge()


const INITIAL_STATE = {
  userDetail: {}, // 用户信息
  levelList: [], // 所有 vip 等级列表
  userLevel: {}, // 用户 vip 等级
  addressList: [], // 地址列表
  defaultAddress: null, // 默认地址
  userAmount: {
    balance: 0,
    freeze: 0,
    score: 0,
  }, // 用户资产信息
  cashLog: [], // 资金明细
  scoreLog: [], // 积分明细
  coupons: [],
  shopCartInfo: shopCartInfo || {}, // 购物车信息
  rechargeSendRules: [], // 充值赠送规则
}

export default function user(state = INITIAL_STATE, action) {
  switch (action.type) {
    case GET_USER_DETAIL_SUCCESS:
      return {
        ...state,
        userDetail: action.data,
      }
    case GET_LEVEL_LIST_SUCCESS: {
      const levelList = (action.data || []).map((level, index) => ({ ...level, lv: index + 1 }))
      return {
        ...state,
        levelList,
        userLevel: levelList.filter(item => item.id === state.userDetail.levelId)[0] || {},
      }
    }
    case GET_ADDRESS_LIST_SUCCESS:
      return {
        ...state,
        addressList: action.data,
      }
    case GET_DEFAULT_ADDRESS_SUCCESS:
      return {
        ...state,
        defaultAddress: action.data,
      }
    case GET_USER_AMOUNT_SUCCESS:
      return {
        ...state,
        userAmount: action.data,
      }
    case GET_USER_CASHLOG_SUCCESS:
      return {
        ...state,
        cashLog: action.data,
      }
    case GET_USER_SCORELOG_SUCCESS:
      return {
        ...state,
        scoreLog: action.data,
      }
    case GET_COUPONS_SUCCESS:
      return {
        ...state,
        coupons: action.data,
      }
    case GET_GETABLE_COUPONS_SUCCESS:
      return {
        ...state,
        getableCoupons: action.data,
      }
    case ADD_SHOP_CART: {
      const { actionType, data } = action
      const info = addCart({
        type: actionType,
        productInfo: data,
      })

      if (actionType === 'cart') {
        setCartBadge()
        return {
          ...state,
          shopCartInfo: info,
        }
      }
      return {
        ...state,
      }
    }
    case UPDATE_SHOP_CART: {
      const { products, actionType } = action
      const info = updateCart({
        type: actionType,
        products,
      })
      setCartBadge()
      return {
        ...state,
        shopCartInfo: info,
      }
    }
    case GET_RECHARGE_RULES_SUCCESS: {
      return {
        ...state,
        rechargeSendRules: action.data,
      }
    }
    default:
      return state
  }
}
