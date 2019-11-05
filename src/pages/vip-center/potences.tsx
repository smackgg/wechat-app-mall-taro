import { ComponentClass } from 'react'
import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { getLevelList, getLevelDetail } from '@/redux/actions/user'
import { INITIAL_STATE as USER_TYPE } from '@/redux/reducers/user'

import './potences.scss'

type PageStateProps = {
  user: USER_TYPE
}

type PageDispatchProps = {
  getUserDetail: () => Promise<void>
  getLevelList: () => Promise<void>
  getUserAmount: () => Promise<void>
  getOrderStatistics: () => Promise<void>
  getLevelDetail: (data: { id: string }) => Promise<void>
}

type PageOwnProps = {}

type PageState = {
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Potences {
  props: IProps
}

@connect(({ user }) => ({
  user,
}), (dispatch: any) => ({
  getLevelList: () => dispatch(getLevelList()),
  getLevelDetail: (data: { id: string })  => dispatch(getLevelDetail(data)),
}))
class Potences extends Component {
  config = {
    navigationBarTitleText: '会员权益',
  }

  async componentDidShow() {
    // 获取vip等级列表
    await this.props.getLevelList()
    const { levelList } = this.props.user
    levelList.forEach((level: any) => {
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
          levelList.map((level: any) => {
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
                  potences.map((potence: string, index: number) => <View key={index} className="potence">{potence}</View>)
                }</View>
              }
            </View>
          })
        }
      </View>
    )
  }
}

export default Potences as ComponentClass<PageOwnProps, PageState>

