import { vipLevel, systemConfig } from '@/services/config'

export const GET_VIP_LEVEL_SUCCESS = 'config/GET_VIP_LEVEL_SUCCESS'
export const GET_SYSTEM_CONFIG_SUCCESS = 'config/GET_SYSTEM_CONFIG_SUCCESS'

export const getVipLevel = () => async dispatch => {
  const res = await vipLevel()
  dispatch({
    type: GET_VIP_LEVEL_SUCCESS,
    data: res.data.data,
  })
}

export const getSystemConfig = () => async dispatch => {
  const res = await systemConfig()
  dispatch({
    type: GET_SYSTEM_CONFIG_SUCCESS,
    data: res.data.data,
  })
}
