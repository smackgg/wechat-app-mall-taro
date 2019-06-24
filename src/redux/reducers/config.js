import { GET_VIP_LEVEL_SUCCESS } from '../actions/config'

const INITIAL_STATE = {
  vipLevel: 0,
}

export default function counter(state = INITIAL_STATE, action) {
  switch (action.type) {
    case GET_VIP_LEVEL_SUCCESS:
      return {
        ...state,
        vipLevel: action.data,
      }
    default:
      return state
  }
}
