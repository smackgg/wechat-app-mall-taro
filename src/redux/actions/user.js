import { userDetail } from '@/services/user'

export const GET_USER_DETAIL_SUCCESS = 'config/GET_USER_DETAIL_SUCCESS'

export const getUserDetail = () => async dispatch => {
  const res = await userDetail()
  dispatch({
    type: GET_USER_DETAIL_SUCCESS,
    data: res.data.base,
  })
}
