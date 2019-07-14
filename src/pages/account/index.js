import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getLevelList } from '@/redux/actions/user'
import { AtButton, AtAvatar } from 'taro-ui'
import { theme } from '@/utils'

import './index.scss'


@connect(
  ({ global, user }) => ({
    global,
    user,
  }),
  dispatch => ({
    getLevelList: () => dispatch(getLevelList()),
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
    this.props.getLevelList()
  }

  render () {
    const {
      userDetail: { avatarUrl, nick, mobile },
      userLevel,
      levelList,
    } = this.props.user
    return (
      <View className="container">
        <View className="userinfo" style={{ background: theme['$color-brand'] }}>
          <View className="avatar">
            <AtAvatar circle size="small" image={avatarUrl}></AtAvatar>
            <View className="nickname">{nick}</View>
            {userLevel && <View>『{userLevel.name}』</View>}
          </View>
          <View>{mobile}</View>
        </View>
      </View>
    )
  }
}

export default Account
