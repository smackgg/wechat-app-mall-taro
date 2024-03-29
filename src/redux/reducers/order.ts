import { AnyAction } from 'redux'
import {
  GET_ORDER_DETAIL_SUCCESS,
  GET_ORDER_STATISTICS_SUCCESS,
  GET_ORDER_LIST_SUCCESS,
} from '../actions/order'

type OrderStatistics = {
  count_id_close?: number
  count_id_no_confirm?: number
  count_id_no_pay?: number
  count_id_no_reputation?: number
  count_id_no_transfer?: number
  count_id_success?: number
}

export type OrderState = {
  orders: {},
  orderStatistics: OrderStatistics,
  orderList: {
    '-1': any[], // 已关闭
    0: any[], // 待支付
    1: any[], // 待发货
    2: any[], // 待收货
    3: any[], // 待评价
    4: any[], // 已完成
  },
}

const INITIAL_STATE: OrderState = {
  orders: {},
  orderStatistics: {},
  orderList: {
    '-1': [], // 已关闭
    0: [], // 待支付
    1: [], // 待发货
    2: [], // 待收货
    3: [], // 待评价
    4: [], // 已完成
  },
}

export default function user(state = INITIAL_STATE, action: AnyAction): OrderState {
  switch (action.type) {
    case GET_ORDER_DETAIL_SUCCESS:
      return {
        ...state,
        orders: {
          ...state.orders,
          [action.orderId]: action.data,
        },
      }
    case GET_ORDER_STATISTICS_SUCCESS:
      return {
        ...state,
        orderStatistics: action.data,
      }
    case GET_ORDER_LIST_SUCCESS:
      return {
        ...state,
        orderList: {
          ...state.orderList,
          [action.status]: action.data,
        },
      }
    default:
      return state
  }
}
