import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, Text } from '@tarojs/components'
import { priceToFloat } from '@/utils'
import './index.scss'


type PageOwnProps = {
  price?: number,
  className?: string,
  score?: number,
}

export default class Price extends Component<PageOwnProps> {
  static propTypes = {
    price: PropTypes.number,
    score: PropTypes.number,
    className: PropTypes.string,
  }

  static defaultProps = {
    className: '',
  }

  // static externalClasses = ['price', 'small-text']
  static options = {
    addGlobalClass: true,
  }


  render() {
    const { price = -1, score = -1, className } = this.props

    if (price === -1 && score === -1) {
      return ''
    }

    // 只展示价格
    if (price >= 0 && score <= 0) {
      return <View className={`price ${className}`}>
        <View><Text className="small-text">￥</Text>{priceToFloat(price)}</View>
      </View>
    }

    // 只展示积分
    if (price <= 0 && score > 0) {
      return <View className={`price ${className}`}>
        <View>{score}<Text className="small-text"> 积分</Text></View>
      </View>
    }

    // 积分和价格同时展示
    if (price > 0 && score > 0) {
      return <View className={`price ${className}`}>
        <View><Text className="small-text">￥</Text>{priceToFloat(price)} + {score}<Text className="small-text"> 积分</Text></View>
      </View>
    }
  }
}
