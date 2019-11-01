import { ComponentClass } from 'react'

import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View } from '@tarojs/components'
import { Reputation } from '@/redux/reducers/goods'
import { ReputationCard } from './_components'

import './index.scss'

type PageStateProps = {
  reputations: { [key: string]: Reputation[] }
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Reputations {
  props: IProps
}

@connect(
  ({ goods }) => ({
    reputations: goods.reputations,
  }),
)

class Reputations extends Component {
  productId: string = ''

  config = {
    navigationBarTitleText: '全部评价',
  }

  componentWillMount() {
    // 获取页面商品id
    let { id } = this.$router.params
    this.productId = id
  }

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


export default Reputations as ComponentClass<PageOwnProps, PageState>
