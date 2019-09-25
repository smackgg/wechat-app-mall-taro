import { combineReducers } from 'redux'
import global from './global'
import config from './config'
import user from './user'
import goods from './goods'
import order from './order'

export default combineReducers({
  global,
  config,
  user,
  goods,
  order,
})
