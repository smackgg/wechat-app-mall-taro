import Taro, { Component } from '@tarojs/taro'
import { View, Image, Checkbox, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { checkToken, login, register } from '@/services/user'
import { theme } from '@/utils'
import wechatSafe from '@/assets/icon/wechat-safe.png'
import { AtButton } from 'taro-ui'
import './index.scss'

@connect(({ global }) => ({ global }))

class Auth extends Component {

  config = {
    navigationBarTitleText: '授权',
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: 'white',
    navigationBarTextStyle: 'white',
  }

  componentWillMount() {
    Taro.setNavigationBarColor({
      backgroundColor: theme['$color-brand'],
      frontColor: '#ffffff',
    })
  }

  // 用户点击授权
  bindGetUserInfo = e => {
    if (!e.detail.userInfo) {
      return
    }

    const { isConnected } = this.props.global

    if (isConnected) {
      Taro.setStorageSync('userInfo', e.detail.userInfo)
      this.login()
    } else {
      Taro.showToast({
        title: '当前无网络',
        icon: 'none',
      })
    }
  }

  // 登录处理
  login = async () => {
    const tokenStorage = Taro.getStorageSync('token')
    if (tokenStorage) {
      // 校验 token 是否有效
      const res = await checkToken(tokenStorage)
      if (res.code != 0) {
        Taro.removeStorageSync('token')
        this.login()
        return
      }
      // 跳转回原来的页面
      Taro.navigateBack()
      return
    }

    Taro.login({
      success: async res => {
        // 登录接口
        const result = await login({ code: res.code })
        // 去注册
        if (result.code == 10000) {
          this.registerUser()
          return
        }

        // 登录错误
        if (result.code != 0) {
          Taro.hideLoading()
          Taro.showModal({
            title: '提示',
            content: '无法登录，请重试',
            showCancel: false,
          })
          return
        }
        const { token, uid } = result.data
        Taro.setStorageSync('token', token)
        Taro.setStorageSync('uid', uid)
        // 跳转回原来的页面
        Taro.navigateBack()
      },
    })
  }

  // 用户注册
  registerUser = () => {
    Taro.login({
      success: res => {
        // 微信登录接口返回的 code 参数，下面注册接口需要用到
        const { code } = res
        Taro.getUserInfo({
          success: async result => {
            const { iv, encryptedData } = result
            // 推荐人
            const referrer = Taro.getStorageSync('referrer') || ''
            // 注册
            await register({
              code,
              encryptedData,
              iv,
              referrer,
            })

            Taro.hideLoading()
            this.login()
          },
        })
      },
    })
  }

  render () {
    return (
      <View className="container">
        <View className="top">
          <Image className="safe-icon" src={wechatSafe} mode="widthFix" />
          <View>应用需要授权获得以下权限</View>
        </View>
        <Checkbox checked disabled className="checkbox"><Text className="checkbox-info">获得你的公开信息（昵称、头像等）</Text></Checkbox>
        <AtButton className="button" type="primary" openType="getUserInfo" onGetUserInfo={this.bindGetUserInfo}>允许授权</AtButton>
      </View>
    )
  }
}

export default Auth
