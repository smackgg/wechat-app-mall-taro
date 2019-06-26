import { combineReducers } from 'redux'
import counter from './counter'
import global from './global'
import config from './config'
import user from './user'

export default combineReducers({
  counter,
  global,
  config,
  user,
})
