import React, { Component } from 'react'

import Taro from '@tarojs/taro'
import { View, Text, Button, Image } from '@tarojs/components'
import { connect } from 'react-redux'
import { AtButton, AtActionSheet, AtActionSheetItem } from 'taro-ui'

import './index.scss'

type PageStateProps = {
  concatPhoneNumber: string
  wifiSsid: string
  wifiPassword: string
  mallName: string
  mallAvatar: string
}

type PageOwnProps = {}

type PageState = {
}

type IProps = PageStateProps & PageOwnProps

@connect(({ config: { systemConfig: { concat_phone_number, wifi_password, wifi_ssid, mall_name, mall_avatar } } }) => ({
  concatPhoneNumber: concat_phone_number,
  wifiSsid: wifi_ssid,
  wifiPassword: wifi_password,
  mallName: mall_name,
  mallAvatar: mall_avatar,
}))

export default class Contact extends Component<IProps, PageState> {
  state = {
    showActionSheet: false,
  }

  // 切换 action sheet
  onToggleActionSheet = () => {
    this.setState({
      showActionSheet: !this.state.showActionSheet,
    })
  }

  // 打电话
  makePhoneCall = () => {
    Taro.makePhoneCall({
      phoneNumber: this.props.concatPhoneNumber,
    })
  }

  render() {
    const { concatPhoneNumber, mallAvatar, mallName } = this.props
    const { showActionSheet } = this.state

    return (
      <View className="container">
        <Image className="avatar" src={mallAvatar} mode="aspectFill"></Image>
        <View className="mall-name">{mallName}</View>
        <AtButton
          className="at-button"
          type="primary"
          onClick={this.onToggleActionSheet}
        >点击咨询客服</AtButton>
        <AtActionSheet cancelText="取消" isOpened={showActionSheet} onClose={this.onToggleActionSheet}>
          <AtActionSheetItem>
            <Button className="button" onClick={this.makePhoneCall}>拨打电话：<Text className="phone-number">{concatPhoneNumber}</Text></Button>
          </AtActionSheetItem>
          <AtActionSheetItem>
            <Button
              className="button"
              hoverClass="none"
              size="mini"
              openType="contact"
            >咨询客服</Button>
          </AtActionSheetItem>
        </AtActionSheet>
      </View>
    )
  }
}

