import {
  GET_ORDER_DETAIL_SUCCESS,
} from '../actions/order'

const INITIAL_STATE = {
  orders: {},
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
    default:
      return state
  }
}
