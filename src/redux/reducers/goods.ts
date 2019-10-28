import { AnyAction } from 'redux'

import {
  GET_PRODUCT_DETAIL_SUCCESS,
  GET_PRODUCTS_SUCCESS,
  GET_CATEGORY_SUCCESS,
  GET_REPUTATION_SUCCESS,
} from '../actions/goods'

export type Product = {
  id: number,
  pic: string,
  name: string,
  goodsName: string,
  number: number,
  property: string,
  score: number,
  amount: number,
  active: boolean,
  price: number,
  label: string,
  minPrice: number,
  minScore: number,
  characteristic: string,
}

export type CategoryItem = {
  icon: string
  id: number
  isUse: boolean
  level: number
  name: string
  paixu: number
}

type INITIAL_STATE = {
  productDetail: {},
  category: CategoryItem[],
  products: { [key: string]: Product },
  reputations: {},
}

const INITIAL_STATE: INITIAL_STATE = {
  productDetail: {},
  category: [],
  products: {},
  reputations: {},
}

export default function user(state = INITIAL_STATE, action: AnyAction) {
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
    case GET_REPUTATION_SUCCESS:
      return {
        ...state,
        reputations: {
          ...state.reputations,
          [action.goodsId]: action.data,
        },
      }
    default:
      return state
  }
}
