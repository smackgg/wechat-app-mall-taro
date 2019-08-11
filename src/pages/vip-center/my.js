import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { AtIcon, AtActionSheet, AtActionSheetItem } from 'taro-ui'

import { getBanners } from '@/redux/actions/config'

import './index.scss'

@connect(({ user, config }) => ({
  user,
  concatPhoneNumber: config.systemConfig.concat_phone_number,
}), dispatch => ({
  getBanners: type => dispatch(getBanners(type)),
}))

export default class VipCenter extends Component {
  config = {
    navigationBarTitleText: '会员中心',
  }

  state = {
    showActionSheet: false,
  }

  componentDidShow() {
  }


  // 跳转 url
  goPage = (url, tabBar = false) => {
    if (!tabBar) {
      Taro.navigateTo({
        url,
      })
      return
    }

    Taro.switchTab({
      url,
    })
  }

  // 切换 action sheet
  onToggleActionSheet = () => {
    this.setState({
      showActionSheet: !this.state.showActionSheet,
    })
  }

  // 图片信息
  bannerInfo = [
    {
      title: '官方小程序商城',
      onClick: () => this.goPage('/pages/index/index', true),
    },
    {
      title: '会员中心',
      onClick: () => this.goPage('/pages/index/index'),
    },
    {
      title: '专属顾问',
      onClick: () => this.onToggleActionSheet(),
    },
  ]

  // 打电话
  makePhoneCall = () => {
    Taro.makePhoneCall({
      phoneNumber: this.props.concatPhoneNumber,
    })
  }

  render() {
    return (
      <View className="container">

      </View>
    )
  }
}

