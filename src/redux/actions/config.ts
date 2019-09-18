import { vipLevel, systemConfig, SystemConfigParams, banners, province, nextRegion } from '@/services/config'
import { Dispatch } from 'redux'

export const GET_VIP_LEVEL_SUCCESS = 'config/GET_VIP_LEVEL_SUCCESS'
export const GET_SYSTEM_CONFIG_SUCCESS = 'config/GET_SYSTEM_CONFIG_SUCCESS'
export const GET_BANNERS_SUCCESS = 'config/GET_BANNERS_SUCCESS'
export const GET_PROVINCE_SUCCESS = 'config/GET_PROVINCE_SUCCESS'

// vip 等级
export const getVipLevel = () => async (dispatch: Dispatch) => {
  const res = await vipLevel()
  dispatch({
    type: GET_VIP_LEVEL_SUCCESS,
    data: res.data,
  })
}

// 系统参数
export const getSystemConfig = (data: SystemConfigParams) => async (dispatch: Dispatch) => {
  const res = await systemConfig(data)
  dispatch({
    type: GET_SYSTEM_CONFIG_SUCCESS,
    data: res.data,
  })
}

// banner
export const getBanners = type => async (dispatch: Dispatch) => {
  const res = await banners(type)

  dispatch({
    type: GET_BANNERS_SUCCESS,
    data: res.data,
    key: type,
  })
}

// province
export const getProvince = () => async (dispatch: Dispatch) => {
  const res = await province()

  dispatch({
    type: GET_PROVINCE_SUCCESS,
    data: res.data,
    key: 'provinces',
  })
}

// nextRegion
export const getNextRegion = ({ key, pid }) => async (dispatch: Dispatch) => {
  const res = await nextRegion({ pid })

  dispatch({
    type: GET_PROVINCE_SUCCESS,
    data: res.data,
    key,
  })
}
