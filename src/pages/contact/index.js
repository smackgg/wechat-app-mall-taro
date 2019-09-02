import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { AtButton, AtActionSheet, AtActionSheetItem } from 'taro-ui'

import './index.scss'


const BANNER_KEY = 'entry'
@connect(({ config }) => ({
  concatPhoneNumber: config.systemConfig.concat_phone_number,
}))

export default class VipCenter extends Component {
  config = {
    navigationBarTitleText: '咨询客服',
  }

  state = {
    showActionSheet: false,
  }

  componentDidShow() {
    this.props.getBanners(BANNER_KEY)
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
    const { concatPhoneNumber } = this.props
    const { showActionSheet } = this.state

    return (
      <View className="container">
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

