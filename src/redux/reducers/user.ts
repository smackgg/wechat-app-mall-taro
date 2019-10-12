import Taro from '@tarojs/taro'
import { AnyAction } from 'redux';
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
  GET_BILL_RULES_SUCCESS,
  GET_LEVEL_DETAIL_SUCCESS,
} from '../actions/user'

const shopCartInfo = Taro.getStorageSync('shopCartInfo') || {}

setCartBadge()


export type USER_DETAIL = {
  avatarUrl: string
  city?: string
  dateAdd?: string
  dateLogin?: string
  id?: number
  ipAdd?: string
  ipLogin?: string
  isIdcardCheck?: boolean
  isSeller?: boolean
  levelId?: number,
  levelRenew?: false
  mobile?: string
  nick?: string
  province?: string
  source?: number
  sourceStr?: string
  status?: 0
  statusStr?: string
}

export type INITIAL_STATE = {
  userDetail: USER_DETAIL, // 用户信息
  levelList: any[], // 所有 vip 等级列表
  userLevel: {
    lv?: number,
    name?: string,
  }, // 用户 vip 等级
  addressList: any[], // 地址列表
  defaultAddress: null, // 默认地址
  userAmount: {
    balance: number,
    freeze: number,
    score: number,
    totleConsumed: number
  }, // 用户资产信息
  cashLog: any[], // 资金明细
  scoreLog: any[], // 积分明细
  coupons: any[],
  getableCoupons: [],
  shopCartInfo: {}, // 购物车信息
  rechargeSendRules: any[], // 充值赠送规则
  billDiscountsRules: any[], // 买单优惠规则
}

const INITIAL_STATE: INITIAL_STATE = {
  userDetail: {
    avatarUrl: '',
  }, // 用户信息
  levelList: [], // 所有 vip 等级列表
  userLevel: {}, // 用户 vip 等级
  addressList: [], // 地址列表
  defaultAddress: null, // 默认地址
  userAmount: {
    balance: 0,
    freeze: 0,
    score: 0,
    totleConsumed: 0,
  }, // 用户资产信息
  cashLog: [], // 资金明细
  scoreLog: [], // 积分明细
  coupons: [],
  getableCoupons: [],
  shopCartInfo: shopCartInfo || {}, // 购物车信息
  rechargeSendRules: [], // 充值赠送规则
  billDiscountsRules: [], // 买单优惠规则
}

export default function user(state = INITIAL_STATE, action: AnyAction): INITIAL_STATE {
  switch (action.type) {
    case GET_USER_DETAIL_SUCCESS:
      return {
        ...state,
        userDetail: action.data,
      }
    case GET_LEVEL_LIST_SUCCESS: {
      const levelList = (action.data || []).map((level: any, index: number) => ({ ...level, lv: index + 1 }))
      return {
        ...state,
        levelList,
        userLevel: levelList.filter((item: any) => item.id === state.userDetail.levelId)[0] || {},
      }
    }
    case GET_LEVEL_DETAIL_SUCCESS: {
      const levelList = state.levelList.map(level => {
        if (level.id === action.id) {
          const extJson = action.data.extJson || {}
          return {
            ...level,
            potences: Object.keys(extJson).filter(key => key.includes('会员权益')).map(key => extJson[key]),
          }
        }
        return level
      })
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
    case GET_BILL_RULES_SUCCESS: {
      return {
        ...state,
        billDiscountsRules: action.data,
      }
    }
    default:
      return state
  }
}
