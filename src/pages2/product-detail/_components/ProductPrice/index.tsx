import React, { Component } from 'react'

import Taro from '@tarojs/taro'
import PropTypes from 'prop-types'
import { View, Text, Button } from '@tarojs/components'
import { Price } from '@/components'
import { AtIcon, AtActionSheet, AtActionSheetItem } from 'taro-ui'
import { Product } from '@/redux/reducers/goods'

import './index.scss'

type Props = {
  basicInfo?: Product
  logistics: any
  productId?: string
  isReserve: boolean
}

type State = {
  showActionSheet: boolean
}

export default class ProductPrice extends Component<Props, State> {

  static propTypes = {
    basicInfo: PropTypes.object,
    logistics: PropTypes.any,
    productId: PropTypes.string,
    isReserve: PropTypes.bool.isRequired
  }

  static defaultProps = {
    basicInfo: undefined,
    logistics: null,
    productId: undefined,
    isReserve: false,
  }

  state = {
    showActionSheet: false,
  }

  // 跳转 url
  goPage = (url: string, tabBar = false) => {
    if (!tabBar) {
      Taro.navigateTo({ url })
      return
    }

    Taro.switchTab({ url })
  }

  // 分享弹窗
  onToggleActionSheet = (toggle: boolean) => {
    this.setState({
      showActionSheet: toggle,
    })
  }

  render() {
    if (!this.props.basicInfo) {
      return null
    }

    const {
      basicInfo: {
        name,
        characteristic,
        originalPrice,
        minPrice,
        numberOrders,
        minScore,
      },
      logistics,
      productId,
      isReserve,
    } = this.props

    const { showActionSheet } = this.state
    return <View>
      <View className="product-detail__product-info">
        <View className="base">
          <View className="info">
            <Text className="name">{name}</Text>
            <Text className="characteristic">{characteristic}</Text>
          </View>
          <View className="share" onClick={this.onToggleActionSheet.bind(this, true)}>
            <AtIcon value="share-2" size="24" color="#5d5d5d"></AtIcon>
            <View>分享</View>
          </View>
        </View>
        <View className="other">
          <View className="price-wrapper">
            <Price price={minPrice} score={minScore}></Price>
            {originalPrice !== minPrice && <Text className="original-price">￥{originalPrice}</Text>}
            {isReserve && <Text className="reserve-tip">[订金/每小时]</Text>}
          </View>
          {logistics && <Text className="name">邮费：{logistics.isFree ? '包邮' : '￥' + logistics.details[0].firstAmount}</Text>}
          <Text>已售：{numberOrders}</Text>
        </View>
      </View>
      {/* 分享弹窗 */}
      <AtActionSheet cancelText="取消" isOpened={showActionSheet} onClose={this.onToggleActionSheet.bind(this, false)}>
        <AtActionSheetItem>
          <Button openType="share" className="share-button">直接分享</Button>
        </AtActionSheetItem>
        <AtActionSheetItem onClick={this.goPage.bind(this, `/pages2/product-detail/share?id=${productId}`, false)}>
          生成海报
        </AtActionSheetItem>
      </AtActionSheet>
    </View>
  }
}

