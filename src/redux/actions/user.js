import { userDetail, levelList, addressList } from '@/services/user'

export const GET_USER_DETAIL_SUCCESS = 'config/GET_USER_DETAIL_SUCCESS'
export const GET_LEVEL_LIST_SUCCESS = 'config/GET_LEVEL_LIST_SUCCESS'
export const GET_ADDRESS_LIST_SUCCESS = 'config/GET_ADDRESS_LIST_SUCCESS'

export const getUserDetail = () => async dispatch => {
  const res = await userDetail()
  dispatch({
    type: GET_USER_DETAIL_SUCCESS,
    data: res.data.base,
  })
  return res.data.base
}

export const getLevelList = () => async dispatch => {
  const res = await levelList()
  dispatch({
    type: GET_LEVEL_LIST_SUCCESS,
    data: res.data.result,
  })
  return res.data
}

export const getAddressList = () => async dispatch => {
  const res = await addressList()
  dispatch({
    type: GET_ADDRESS_LIST_SUCCESS,
    data: res.data,
  })
  return res.data
}
