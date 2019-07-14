import { productDetail } from '@/services/goods'

export const GET_PRODUCT_DETAIL_SUCCESS = 'config/GET_PRODUCT_DETAIL_SUCCESS'

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

