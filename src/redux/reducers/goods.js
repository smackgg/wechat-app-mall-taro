import {
  GET_PRODUCT_DETAIL_SUCCESS,
} from '../actions/goods'

const INITIAL_STATE = {
  productDetail: {},
}

export default function user(state = INITIAL_STATE, action) {
  switch (action.type) {
    case GET_PRODUCT_DETAIL_SUCCESS:
      return {
        ...state,
        productDetail: {
          ...state.productDetail,
          [action.productId]: action.data,
        },
      }
    default:
      return state
  }
}
