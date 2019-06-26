import { GET_USER_DETAIL_SUCCESS } from '../actions/user'

const INITIAL_STATE = {
  userDetail: {},
}

export default function user(state = INITIAL_STATE, action) {
  switch (action.type) {
    case GET_USER_DETAIL_SUCCESS:
      return {
        ...state,
        userDetail: action.data,
      }
    default:
      return state
  }
}
