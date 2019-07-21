import {
  GET_PRODUCT_DETAIL_SUCCESS,
  GET_PRODUCTS_SUCCESS,
  GET_CATEGORY_SUCCESS,
} from '../actions/goods'

const INITIAL_STATE = {
  productDetail: {},
  category: [],
  products: {},
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
    case GET_PRODUCTS_SUCCESS:
      return {
        ...state,
        products: {
          ...state.products,
          [action.key]: action.data,
        },
      }
    case GET_CATEGORY_SUCCESS:
      return {
        ...state,
        category: action.data,
      }
    default:
      return state
  }
}
