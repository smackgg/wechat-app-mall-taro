import React, { Component } from 'react'
import { View } from '@tarojs/components'
import { connect } from 'react-redux'
import { getLevelList, getLevelDetail } from '@/redux/actions/user'
import { UserState } from '@/redux/reducers/user'

import './potences.scss'

type PageProps = {
  user: UserState
  getLevelList: typeof getLevelList
  getLevelDetail: typeof getLevelDetail
}

type PageState = {
}

@connect(({ user }) => ({
  user,
}), (dispatch: any) => ({
  getLevelList: () => dispatch(getLevelList()),
  getLevelDetail: (data: { id: string })  => dispatch(getLevelDetail(data)),
}))
export default class Potences extends Component<PageProps, PageState> {
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
      <View className="vip-center__potences">
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