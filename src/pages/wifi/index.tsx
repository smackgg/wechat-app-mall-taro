import React, { Component } from 'react'

import Taro from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { connect } from 'react-redux'
import { AtButton } from 'taro-ui'

import './index.scss'


type PageStateProps = {
  concatPhoneNumber: string,
  wifiSsid: string,
  wifiPassword: string,
  mallName: string,
  mallAvatar: string,
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(({ config: { systemConfig: { concat_phone_number, wifi_password, wifi_ssid, mall_name, mall_avatar } } }) => ({
  concatPhoneNumber: concat_phone_number,
  wifiSsid: wifi_ssid,
  wifiPassword: wifi_password,
  mallName: mall_name,
  mallAvatar: mall_avatar,
}))

export default class WiFi extends Component<IProps, PageState> {
  startPromise: Promise<any>

  startWifiSuccess = false

  componentDidShow() {
    this.startPromise = this.startWifi()
  }


  startWifi = () => new Promise(resolve => {
    Taro.startWifi({
      success: () => {
        this.startWifiSuccess = true
        resolve()
      },
      fail: (e: any) => this.showError(e.errMsg),
    })
  })

  showError = (msg: string) => {
    Taro.showModal({
      title: '错误',
      content: `请重试或复制 wifi 密码到系统设置页面进行连接。错误信息->${msg}`,
      showCancel: false,
    })
  }
  // 用户点击立即连接
  onClick = async () => {
    if (!this.startWifiSuccess) {
      await this.startWifi()
    }

    const { wifiSsid, wifiPassword } = this.props
    Taro.showLoading({
      title: '加载中',
    })
    Taro.connectWifi({
      SSID: wifiSsid,
      password: wifiPassword,
      success: () => {
        Taro.hideLoading()
        Taro.showToast({
          title: '连接成功',
          icon: 'success',
          duration: 2000,
        })
      },
      fail: (err: any) => {
        // console.log('connectWifi fail', err)
        Taro.hideLoading()
        this.showError(err.errMsg)
      },
      complete: (err: any) => {
        console.log('complete', err)
      },
    })
  }

  setClipboard = (wifiPassword: string) => {
    Taro.setClipboardData({
      data: wifiPassword,
      success: () => {
        Taro.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000,
        })
      },
    })
  }

  goApp = () => {
    Taro.navigateTo({
      url: '/pages/entry/index',
    })
  }

  render() {
    const {
      wifiSsid,
      mallName,
      mallAvatar,
      wifiPassword,
    } = this.props

    return (
      <View className="container">
        <Image className="avatar" src={mallAvatar} mode="aspectFill"></Image>
        <View className="mall-name">{mallName}</View>
        <View className="wifi-ssid">为您提供 Wi-Fi：<Text selectable>{wifiSsid}</Text></View>
        <View className="wifi-ssid">密码：<Text selectable>{wifiPassword}</Text> <Text className="clipboard" onClick={this.setClipboard.bind(this, wifiPassword)}>复制密码</Text></View>
        <View className="tip">*当无法自动连接时，请直接复制密码进行连接</View>
        <AtButton
          className="at-button"
          type="primary"
          onClick={this.onClick}
        >立即连接</AtButton>
        <View className="go-app" onClick={this.goApp}>点击进入{mallName}小程序</View>
      </View>
    )
  }
}

