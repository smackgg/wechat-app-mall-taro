import Taro, { Component } from '@tarojs/taro'
import { View, Image, Checkbox, Text, Button, Form } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { checkToken, login, register, bindMobile } from '@/services/user'
import { theme, requireBindMobile, cError } from '@/utils'
import { getUserDetail } from '@/redux/actions/user'

import wechatSafeIcon from '@/assets/icon/wechat-safe.png'
import successIcon from '@/assets/icon/success.png'
import { addWxFormId } from '@/services/wechat'

import { AtButton, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import './index.scss'

@connect(({ global, user }) => ({
  global,
  mobile: user.userDetail.mobile,
}), dispatch => ({
  getUserDetail: () => dispatch(getUserDetail()),
}))

export default class Auth extends Component {

  state = {
    showTelAuthModal: false,
  }

  config = {
    navigationBarTitleText: '授权',
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: 'white',
    navigationBarTextStyle: 'white',
  }

  componentWillMount() {
    Taro.removeStorageSync('token')
    Taro.setNavigationBarColor({
      backgroundColor: theme['$color-brand2'],
      frontColor: '#ffffff',
    })
  }

  // 用户点击授权
  getUserInfo = e => {
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

  // 授权手机号
  getPhoneNumber = async e => {
    // 用户手动拒绝
    if (e.detail.errMsg === 'getPhoneNumber:fail user deny') {
      this.closeModal()
      return
    }

    const res = await bindMobile({
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv,
    })

    if (res.code == 0) {
      this.setState({
        showTelAuthModal: false,
      })
      Taro.showToast({
        title: '绑定成功',
        icon: 'success',
      })
    } else {
      Taro.showModal({
        title: '提示',
        content: '绑定失败',
        showCancel: false,
      })
    }

    this.handleLoginSuccess()
  }


  // 登录处理
  login = async () => {
    const tokenStorage = Taro.getStorageSync('token')
    if (tokenStorage) {
      // 校验 token 是否有效
      const res = await checkToken()
      console.warn(res, 'resres')
      if (res.code != 0) {
        Taro.removeStorageSync('token')
        this.login()
        return
      }

      this.handleLoginSuccess()
      return
    }

    Taro.login({
      success: async res => {
        // 登录接口
        const [error, result] = await cError(login({ code: res.code }))

        // 去注册
        if (error && error.code == 10000) {
          this.registerUser()
          return
        }

        // 登录错误
        if (error || result.code !== 0) {
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

        this.handleLoginSuccess()
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

  // 处理授权登录成功后逻辑
  handleLoginSuccess = async () => {
    await this.props.getUserDetail()
    // 是否需要强制手机号
    if (requireBindMobile && !this.props.mobile) {
      this.setState({
        showTelAuthModal: true,
      })
    } else {

      // 跳转回原来的页面
      Taro.navigateBack({
        fail: () => Taro.switchTab({
          url: '/pages/index/index',
        }),
      })
    }
  }

  // 关闭弹窗
  closeModal = () => {
    this.setState({
      showTelAuthModal: false,
    })
  }

  // 表单提交
  onFormSubmit = e => {
    addWxFormId({
      type: 'form',
      formId: e.detail.formId,
    })
  }

  render () {
    const { showTelAuthModal } = this.state
    return (
      <View className="container">
        <Form reportSubmit onSubmit={this.onFormSubmit}>
          <View className="top">
            <Image className="safe-icon" src={wechatSafeIcon} mode="widthFix" />
            <View>应用需要授权获得以下权限</View>
          </View>
          <Checkbox checked disabled className="checkbox"><Text className="checkbox-info">获得你的公开信息（昵称、头像等）</Text></Checkbox>
          <Button formType="submit" className="button" type="primary" openType="getUserInfo" onGetUserInfo={this.getUserInfo}>允许授权</Button>
          <AtModal isOpened={showTelAuthModal}>
            <AtModalHeader>微信授权</AtModalHeader>
            <AtModalContent>
              <View className="modal-content">
                <Image className="success-icon" src={successIcon} mode="widthFix" />
                <View >微信授权成功</View>
                <View className="modal-info">授权绑定你的手机号码</View>
              </View>
            </AtModalContent>
            <AtModalAction> <Button formType="submit" onClick={this.closeModal}>取消</Button> <Button formType="submit" openType="getPhoneNumber" onGetPhoneNumber={this.getPhoneNumber}>允许</Button> </AtModalAction>
          </AtModal>
        </Form>
      </View>
    )
  }
}
