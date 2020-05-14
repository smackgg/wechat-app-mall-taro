import React, { Component } from 'react'

import { Current } from '@tarojs/taro'
import { connect } from 'react-redux'
import { View } from '@tarojs/components'
import { ProductsState } from '@/redux/reducers/goods'
import { ReputationCard } from './_components'

import './index.scss'

type PageProps = {
  reputations: ProductsState['reputations']
}

@connect(
  ({ goods }) => ({
    reputations: goods.reputations,
  }),
)

export default class Reputations extends Component<PageProps, {}> {
  componentWillMount() {
    // 获取页面商品id
    let { id } = Current.router?.params || {}
    this.productId = id
  }
  productId = ''

  render() {
    const reputations = this.props.reputations[this.productId] || []
    const reputationLength = reputations.length

    return <View className="container">
      {/* 评价列表 */}
      {
        (reputations && reputations.length > 0) && <View className="reputations">
          <View className="title-line">商品评价({reputationLength}条)</View>
          {
            reputations.map((reputation, index) => <ReputationCard showAllRemark key={index} reputation={reputation} />)
          }
        </View>
      }
    </View>
  }
}

