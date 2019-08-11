import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { AtIcon, AtActionSheet, AtActionSheetItem } from 'taro-ui'

import { getBanners } from '@/redux/actions/config'

import './index.scss'


const BANNER_KEY = 'entry'
@connect(({ user, config }) => ({
  user,
  banners: config.banners[BANNER_KEY] || [],
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
    this.props.getBanners(BANNER_KEY)
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

  centerList = [
    {
      title: '我的会员',
      image: '/assets/icon/vip_my.jpg',
      onClick: () => this.goPage('/pages/vip-center/my'),
    },
    {
      title: '我的礼券',
      image: '/assets/icon/vip_coupons.jpg',
      onClick: () => this.goPage('/pages/coupons/index'),
    },
    {
      title: '我的权益',
      image: '/assets/icon/vip_potence.jpg',
      onClick: () => this.goPage('/pages/vip-center/potence'),
    },
    {
      title: '我的信息',
      image: '/assets/icon/vip_my.jpg',
      onClick: () => this.goPage('/pages/account/extinfo'),
    },
    {
      title: '最近活动',
      image: '/assets/icon/vip_notice.jpg',
      onClick: () => this.goPage('/pages/vip-center/activity'),
    },
    {
      title: '专属顾问',
      image: '/assets/icon/vip_contact.jpg',
      onClick: () => this.onToggleActionSheet(),
    },
  ]

  render () {
    const { banners, concatPhoneNumber } = this.props
    const { userDetail: { nick } } = this.props.user
    const { showActionSheet } = this.state
    return (
      <View className="container">
        {/* 会员中心头部 */}
        <View className="header">
          {banners[2] && <Image
            className="image"
            src={banners[2].picUrl}
            mode="aspectFill"
          />}
          <View className="nick-name">
            <View className="nick">{nick}</View>
            <View>欢迎来到会员中心</View>
          </View>
        </View>

        {/* 模块 list */}
        <View className="center-list">
          {
            this.centerList.map(item => {
              const { title, onClick, image } = item
              return <View key={title} onClick={onClick} className="item">
                <Image
                  className="icon"
                  src={image}
                  mode="aspectFill"
                />
                <View>{title}</View>
              </View>
            })
          }
        </View>

        {/* 分享弹窗 */}
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

