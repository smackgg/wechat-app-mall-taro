import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View } from '@tarojs/components'
import { ReputationCard } from './_components'

import './index.scss'

@connect(
  ({ goods }) => ({
    reputations: goods.reputations,
  }),
)

export default class Reputations extends Component {

  config = {
    navigationBarTitleText: '全部评价',
  }

  componentWillMount() {
    // 获取页面商品id
    let { id } = this.$router.params
    this.productId = id
  }

  render() {
    let { reputations } = this.props

    reputations = reputations[this.productId] || []
    const reputationLength = reputations.length

    return <View className="container">
      {/* 评价列表 */}
      {
        (reputations && reputations.length > 0) && <View className="reputations">
          <View className="title-line">商品评价({reputationLength}条)</View>
          {
            reputations.map(reputation => <ReputationCard showAllRemark key={reputation.id} reputation={reputation} />)
          }
        </View>
      }
    </View>
  }
}

