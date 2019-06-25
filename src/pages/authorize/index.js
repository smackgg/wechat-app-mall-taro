import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { checkToken, login, register } from '@/services/user'
import { AtButton } from 'taro-ui'
import './index.scss'


@connect(({ global }) => ({ global }))

class Auth extends Component {

  config = {
    navigationBarTitleText: '授权',
  }

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

  login = async () => {
    const token = Taro.getStorageSync('token')
    if (token) {
      // 校验 token 是否有效
      const res = await checkToken(this.token)
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

        Taro.setStorageSync('token', res.data.token)
        Taro.setStorageSync('uid', res.data.uid)
        // 跳转回原来的页面
        Taro.navigateBack()
      },
    })
  }

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
          应用需要授权获得以下权限
        </View>
        <View className="title">微信授权页面</View>
        <View className="profile">授权并同意使用微信账号登录当前小程序</View>
        <AtButton type="primary" openType="getUserInfo" onGetUserInfo={this.bindGetUserInfo}>授权登录</AtButton>
      </View>
    )
  }
}

export default Auth
