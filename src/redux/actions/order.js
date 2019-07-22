import { orderDetail, orderStatistics } from '@/services/order'

export const GET_ORDER_DETAIL_SUCCESS = 'config/GET_ORDER_DETAIL_SUCCESS'
export const GET_ORDER_STATISTICS_SUCCESS = 'config/GET_ORDER_STATISTICS_SUCCESS'

// 订单详情
export const getOrderDetail = (data = {}) => async dispatch => {
  const res = await orderDetail({
    id: data.orderId,
  })
  return dispatch({
    type: GET_ORDER_DETAIL_SUCCESS,
    data: res.data,
    orderId: data.orderId,
  })
}

// 查询订单统计
export const getOrderStatistics= () => async dispatch => {
  const res = await orderStatistics()
  return dispatch({
    type: GET_ORDER_STATISTICS_SUCCESS,
    data: res.data,
  })
}
