import {
  productDetail,
  products,
  category,
  reputation,
} from '@/services/goods'
import { Dispatch } from 'redux'

export const GET_PRODUCT_DETAIL_SUCCESS = 'config/GET_PRODUCT_DETAIL_SUCCESS'
export const GET_PRODUCTS_SUCCESS = 'config/GET_PRODUCTS_SUCCESS'
export const GET_CATEGORY_SUCCESS = 'config/GET_CATEGORY_SUCCESS'
export const GET_REPUTATION_SUCCESS = 'config/GET_REPUTATION_SUCCESS'


// 商品详情
export const getProductDetail = (data: { id: string }) => async (dispatch: Dispatch) => {
  const res = await productDetail({
    id: data.id,
  })
  dispatch({
    type: GET_PRODUCT_DETAIL_SUCCESS,
    data: res.data,
    productId: data.id,
  })
}

// 商品详情
export const getProducts = (data: {
  key: string,
  categoryId?: number,
  recommendStatus?: number,
  page?: number,
  pageSize?: number,
}) => async (dispatch: Dispatch) => {
  const { key } = data
  delete data.key
  const res = await products(data)
  dispatch({
    type: GET_PRODUCTS_SUCCESS,
    data: res.data,
    key,
  })
}

// 获取分类
export const getCategory = () => async (dispatch: Dispatch) => {
  const res = await category()
  dispatch({
    type: GET_CATEGORY_SUCCESS,
    data: res.data,
  })
}

// 获取商品评价列表
export const getReputation = (data: {
  goodsId: string,
}) => async (dispatch: Dispatch) => {
  const res = await reputation(data)
  dispatch({
    type: GET_REPUTATION_SUCCESS,
    data: res.data,
    goodsId: data.goodsId,
  })
}
