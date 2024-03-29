import { orderDetail, orderStatistics, orderList } from '@/services/order'
import { cError } from '@/utils'
import { Dispatch } from 'redux'

export const GET_ORDER_DETAIL_SUCCESS = 'config/GET_ORDER_DETAIL_SUCCESS'
export const GET_ORDER_STATISTICS_SUCCESS = 'config/GET_ORDER_STATISTICS_SUCCESS'
export const GET_ORDER_LIST_SUCCESS = 'config/GET_ORDER_LIST_SUCCESS'


// 订单详情
export const getOrderDetail = (data: Parameters<typeof orderDetail>[0]) => async (dispatch: Dispatch) => {
  const res = await orderDetail(data)
  return dispatch({
    type: GET_ORDER_DETAIL_SUCCESS,
    data: res.data,
    orderId: data.id,
  })
}

// 查询订单统计
export const getOrderStatistics = () => async (dispatch: Dispatch) => {
  const res = await orderStatistics()
  return dispatch({
    type: GET_ORDER_STATISTICS_SUCCESS,
    data: res.data,
  })
}

// 订单列表
export const getOrderList = (data: Parameters<typeof orderList>[0]) => async (dispatch: Dispatch) => {
  const { status = 'all' } = data
  const [error, res] = await cError(orderList(data))

  return dispatch({
    type: GET_ORDER_LIST_SUCCESS,
    data: error ? [] : (res.data.orderList || []).map((order: any) => ({
      ...order,
      goodsMap: res.data.goodsMap[order.id],
      logisticsMap: res.data.logisticsMap[order.id],
    })),
    status,
  })
}
