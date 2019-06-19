export const ADD = 'counter/ADD'
export const MINUS = 'counter/MINUS'


export const add = () => {
  return {
    type: ADD
  };
}

export const minus = () => {
  return {
    type: MINUS
  }
}

// 异步的action
export function asyncAdd () {
  return dispatch => {
    setTimeout(() => {
      dispatch(add())
    }, 2000)
  }
}
