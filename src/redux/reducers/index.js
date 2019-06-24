import { combineReducers } from 'redux'
import counter from './counter'
import global from './global'
import config from './config'

export default combineReducers({
  counter,
  global,
  config,
})
