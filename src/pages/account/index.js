import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd } from '@/redux/actions/counter'
import { AtButton } from 'taro-ui'

import './index.scss'


@connect(
  ({ global }) => ({ global }),
  dispatch => ({
    add () {
      dispatch(add())
    },
    dec () {
      dispatch(minus())
    },
    asyncAdd () {
      dispatch(asyncAdd())
    },
  }),
)

class Account extends Component {

  config = {
    navigationBarTitleText: '个人中心',
  }

  render () {
    return (
      <View className="container">
        <View className="title">微信授权页面</View>
        <View className="profile">授权并同意使用微信账号登录当前小程序</View>
        <AtButton type="primary" openType="getUserInfo" onGetUserInfo={this.bindGetUserInfo}>授权登录</AtButton>
      </View>
    )
  }
}

export default Account
