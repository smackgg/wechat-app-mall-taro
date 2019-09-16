import { ADD, MINUS } from '../actions/counter'

interface CounterState {
    num: number
}

const INITIAL_STATE: CounterState = {
    num: 0,
}

export default function counter(state: CounterState = INITIAL_STATE, action) {
    switch (action.type) {
    case ADD:
        return {
            ...state,
            num: state.num + 1,
        }
    case MINUS:
        return {
            ...state,
            num: state.num - 1,
        }
    default:
        return state
    }
}
