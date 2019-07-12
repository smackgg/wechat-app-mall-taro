import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd } from '@/redux/actions/counter'
import { AtButton, AtAvatar } from 'taro-ui'
import { theme } from '@/utils'

import './index.scss'


@connect(
  ({ global, user }) => ({ global, userDetail: user.userDetail }),
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

  componentWillMount() {
    Taro.setNavigationBarColor({
      backgroundColor: theme['$color-brand'],
      frontColor: '#ffffff',
    })
  }

  render () {
    console.log(this.props.userDetail, 'userDetail')
    const { userDetail: { avatarUrl, nick, mobile } } = this.props
    return (
      <View className="container">
        <View className="userinfo" style={{ background: theme['$color-brand'] }}>
          <View className="avatar">
            <AtAvatar circle size="small" image={avatarUrl}></AtAvatar>
            <View className="nickname">{nick}</View>
          </View>
          <View>{mobile}</View>
        </View>
      </View>
    )
  }
}

export default Account
