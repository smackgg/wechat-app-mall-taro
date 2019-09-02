import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { getLevelList, getLevelDetail } from '@/redux/actions/user'

import './potences.scss'

@connect(({ user }) => ({
  user,
}), dispatch => ({
  getLevelList: () => dispatch(getLevelList()),
  getLevelDetail: id => dispatch(getLevelDetail(id)),
}))
export default class Potences extends Component {
  config = {
    navigationBarTitleText: '会员权益',
  }

  async componentDidShow() {
    // 获取vip等级列表
    await this.props.getLevelList()
    const { levelList } = this.props.user
    levelList.forEach(level => {
      this.props.getLevelDetail(level.id)
    })
  }

  render() {
    const {
      levelList,
    } = this.props.user

    return (
      <View className="container">
        {
          levelList.map(level => {
            const { id, name, potences = [], upgradeAmount } = level
            const len = potences.length
            return <View key={id} className="level-item">
              <View className="name">{name}</View>
              <View className="upgrade-amount">(累计充值满{upgradeAmount}元)</View>
              {
                len === 0 && <View className="potence">暂无权益</View>
              }
              {
                len > 0 && <View className="potences">{
                  potences.map((potence, index) => <View key={index} className="potence">{potence}</View>)
                }</View>
              }
            </View>
          })
        }
      </View>
    )
  }
}

