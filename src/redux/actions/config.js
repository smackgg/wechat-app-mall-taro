import { vipLevel } from '@/services/config'

export const GET_VIP_LEVEL_SUCCESS = 'config/GET_VIP_LEVEL_SUCCESS'

export const getVipLevel = () => async dispatch => {
  const res = await vipLevel()
  dispatch({
    type: GET_VIP_LEVEL_SUCCESS,
    data: res.data.data,
  })
}
