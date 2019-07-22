import {
  GET_ORDER_DETAIL_SUCCESS,
  GET_ORDER_STATISTICS_SUCCESS,
} from '../actions/order'

const INITIAL_STATE = {
  orders: {},
  orderStatistics: {},
}

export default function user(state = INITIAL_STATE, action) {
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
    default:
      return state
  }
}
