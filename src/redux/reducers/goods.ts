import { AnyAction } from 'redux'
import { UserDetail } from './user'

import {
  GET_PRODUCT_DETAIL_SUCCESS,
  GET_PRODUCTS_SUCCESS,
  GET_CATEGORY_SUCCESS,
  GET_REPUTATION_SUCCESS,
} from '../actions/goods'

export type Product = {
  id: number
  pic: string
  name: string
  goodsName?: string
  number: number
  property: string
  score: number
  amount: number
  amountReal: number
  active: boolean
  price: number
  label: string
  minPrice: number
  minScore: number
  characteristic: string
  propertyIds: string
  originalPrice: number
  stores: number
  categoryId: number
  // commission: 0
  // commissionType: 0
  gotScore: number
  gotScoreType: number
  kanjia: false
  kanjiaPrice: number
  limitation: false
  logisticsId: number
  miaosha: false
  numberFav: number
  numberGoodReputation: number
  numberOrders: number
  numberSells: number
  paixu: number
  pingtuan: false
  pingtuanPrice: number
  recommendStatus: number
  recommendStatusStr: string
  shopId: number
  status: number
  statusStr: string
  tags: string
  // userId: 15672
  // vetStatus: 1
  views: number
  weight: number
}

export type CategoryItem = {
  icon: string
  id: string
  isUse: boolean
  level: number
  name: string
  paixu: number
}

export type Properties = {
  childsCurGoods: { id: number, name: string, propertyId: number, checked?: boolean }[]
  dateAdd: string
  id: number
  name: string
  reserveTimes: any
}

export type ProductDetail = {
  basicInfo: Product
  extJson: any
  properties: Properties[]
  pics: {
    goodsId: number
    id: number
    pic: string
  }[],
  logistics: any
  content: string
}

interface ReputationGoods extends Product {
  dateReputation: string
  goodReputation: number
  goodReputationStr: string
  goodReputationRemark: string
}
export type Reputation = {
  goods: ReputationGoods
  user: UserDetail
}

export type ProductsState = {
  productDetail?: { [key: string]: ProductDetail }
  category: CategoryItem[]
  products: { [key: string]: Product[] }
  reputations: { [key: string]: Reputation[] }
}

const INITIAL_STATE: ProductsState = {
  productDetail: undefined,
  category: [],
  products: {},
  reputations: {},
}

export default function user(state = INITIAL_STATE, action: AnyAction): ProductsState {
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
