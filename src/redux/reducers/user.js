import {
  GET_USER_DETAIL_SUCCESS,
  GET_LEVEL_LIST_SUCCESS,
} from '../actions/user'

const INITIAL_STATE = {
  userDetail: {},
  levelList: [],
  userLevel: null,
}

export default function user(state = INITIAL_STATE, action) {
  switch (action.type) {
    case GET_USER_DETAIL_SUCCESS:
      return {
        ...state,
        userDetail: action.data,
      }
    case GET_LEVEL_LIST_SUCCESS:
      return {
        ...state,
        levelList: action.data,
        userLevel: action.data.filter(item => item.id === state.userDetail.levelId)[0],
      }
    default:
      return state
  }
}
