import Taro from '@tarojs/taro'
import { addCart, updateCart } from '@/utils/shopCart'

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
} from '../actions/user'

const shopCartInfo = Taro.getStorageSync('shopCartInfo')

const INITIAL_STATE = {
  userDetail: {},
  levelList: [],
  userLevel: {},
  addressList: [],
  defaultAddress: null,
  userAmount: {
    balance: 0,
    freeze: 0,
    score: 0,
  },
  cashLog: [], // 资金流水
  coupons: [],
  shopCartInfo: shopCartInfo || {},
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
      const { products } = action
      const info = updateCart({
        products,
      })
      return {
        ...state,
        shopCartInfo: info,
      }
    }
    default:
      return state
  }
}
