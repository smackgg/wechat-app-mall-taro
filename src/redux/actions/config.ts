import { vipLevel, systemConfig, banners, province, nextRegion, notice } from '@/services/config'
import { Dispatch } from 'redux'

export const GET_VIP_LEVEL_SUCCESS = 'config/GET_VIP_LEVEL_SUCCESS'
export const GET_SYSTEM_CONFIG_SUCCESS = 'config/GET_SYSTEM_CONFIG_SUCCESS'
export const GET_BANNERS_SUCCESS = 'config/GET_BANNERS_SUCCESS'
export const GET_PROVINCE_SUCCESS = 'config/GET_PROVINCE_SUCCESS'
export const GET_NOTICE_SUCCESS = 'config/GET_NOTICE_SUCCESS'

export const UPDATE_TIMER_FLAGS = 'config/UPDATE_TIMER_FLAGS'

// vip 等级
export const getVipLevel = () => async (dispatch: Dispatch) => {
  const res = await vipLevel()
  dispatch({
    type: GET_VIP_LEVEL_SUCCESS,
    data: res.data,
  })
}

// 系统参数
export const getSystemConfig = (data: Parameters<typeof systemConfig>[0]) => async (dispatch: Dispatch) => {
  const res = await systemConfig(data)
  dispatch({
    type: GET_SYSTEM_CONFIG_SUCCESS,
    data: res.data,
  })
}

// banner
export const getBanners = (data: Parameters<typeof banners>[0]) => async (dispatch: Dispatch) => {
  const res = await banners(data)

  dispatch({
    type: GET_BANNERS_SUCCESS,
    data: res.data,
    key: data.type,
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
export const getNextRegion = (data: ({ key: string } & Parameters<typeof nextRegion>[0])) => async (dispatch: Dispatch) => {
  const res = await nextRegion({ pid: data.pid })

  dispatch({
    type: GET_PROVINCE_SUCCESS,
    data: res.data,
    key: data.key,
  })
}

export const getNotice = (...args: Parameters<typeof notice>) => async dispatch => {
  const res = await notice(...args)

  dispatch({
    type: GET_NOTICE_SUCCESS,
    data: res.data,
  })
}

export const updateTimerFlags = (data: {[key: string]: any}) => ({
  type: UPDATE_TIMER_FLAGS,
  data,
})
