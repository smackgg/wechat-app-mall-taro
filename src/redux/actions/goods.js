import {
  productDetail,
  products,
  category,
} from '@/services/goods'

export const GET_PRODUCT_DETAIL_SUCCESS = 'config/GET_PRODUCT_DETAIL_SUCCESS'
export const GET_PRODUCTS_SUCCESS = 'config/GET_PRODUCTS_SUCCESS'
export const GET_CATEGORY_SUCCESS = 'config/GET_CATEGORY_SUCCESS'

// 商品详情
export const getProductDetail = (data = {}) => async dispatch => {
  const res = await productDetail({
    id: data.productId,
  })
  dispatch({
    type: GET_PRODUCT_DETAIL_SUCCESS,
    data: res.data,
    productId: data.productId,
  })
}

// 商品详情
export const getProducts = (data = {}) => async dispatch => {
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
export const getCategory = () => async dispatch => {
  const res = await category()
  dispatch({
    type: GET_CATEGORY_SUCCESS,
    data: res.data,
  })
}
