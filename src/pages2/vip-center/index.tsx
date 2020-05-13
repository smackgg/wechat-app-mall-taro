import React, { Component } from 'react'

import Taro from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'
import { connect } from 'react-redux'
import { AtActionSheet, AtActionSheetItem } from 'taro-ui'

import { getBanners } from '@/redux/actions/config'
// icons
import myIcon from './res/vip_my.jpg'
import couponsIcon from './res/vip_coupons.jpg'
import potenceIcon from './res/vip_potence.jpg'
// import noticeIcon from './res/vip_notice.jpg'
import contactIcon from './res/vip_contact.jpg'

import './index.scss'

type PageProps = {
  user: any
  banners: any[]
  concatPhoneNumber: string
  getBanners: typeof getBanners
}

type PageState = {
  showActionSheet: boolean
}

const BANNER_KEY = 'entry'
@connect(({ user, config }) => ({
  user,
  banners: config.banners[BANNER_KEY] || [],
  concatPhoneNumber: config.systemConfig.concat_phone_number,
}), (dispatch: any) => ({
  getBanners: (data: { type: string }) => dispatch(getBanners(data)),
}))

export default class VipCenter extends Component<PageProps, PageState> {
  state = {
    showActionSheet: false,
  }

  componentDidShow() {
    this.props.getBanners({
      type: BANNER_KEY,
    })
  }

  // 跳转 url
  goPage = (url: string, tabBar = false) => {
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
      image: myIcon,
      onClick: () => this.goPage('/pages2/vip-center/my'),
    },
    {
      title: '我的礼券',
      image: couponsIcon,
      onClick: () => this.goPage('/pages2/coupons/index'),
    },
    {
      title: '会员权益',
      image: potenceIcon,
      onClick: () => this.goPage('/pages2/vip-center/potences'),
    },
    {
      title: '我的信息',
      image: myIcon,
      onClick: () => this.goPage('/pages/account/extinfo'),
    },
    // {
    //   title: '最近活动',
    //   image: noticeIcon,
    //   onClick: () => this.goPage('/pages/vip-center/activity'),
    // },
    {
      title: '专属顾问',
      image: contactIcon,
      onClick: () => this.onToggleActionSheet(),
    },
  ]

  render () {
    const { banners, concatPhoneNumber } = this.props
    const { userDetail: { nick } } = this.props.user
    const { showActionSheet } = this.state
    return (
      <View className="vip-center__container">
        {/* 会员中心头部 */}
        <View className="header">
          {banners[1] && <Image
            className="image"
            src={banners[1].picUrl}
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
