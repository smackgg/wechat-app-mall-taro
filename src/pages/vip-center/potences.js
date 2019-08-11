import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { getLevelList, getLevelDetail } from '@/redux/actions/user'
import classNames from 'classnames'

import './potences.scss'

const SWIPER_ITEM_MARGIN = '45rpx'
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

  state = {
    swiperIndex: 0,
    loading: true,
  }

  async componentDidShow() {
    // 获取vip等级列表
    await this.props.getLevelList()
    const { levelList } = this.props.user
    // this.props.getLevelDetail(levelId)
    console.log(levelList)
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
              <View className="upgrade-amount">(累计消费满{upgradeAmount}元)</View>
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

