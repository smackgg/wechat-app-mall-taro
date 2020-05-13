import React, { Component } from 'react'

import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from 'react-redux'
import { getCoupons, getGetableCoupons } from '@/redux/actions/user'

import { AtTabs, AtTabsPane } from 'taro-ui'
import { CouponList } from '@/components'
import { UserState } from '@/redux/reducers/user'

import './index.scss'

type PageProps = {
  coupons: UserState['coupons']
  getableCoupons: UserState['getableCoupons']
  invalidCoupons: UserState['coupons']
  getCoupons: typeof getCoupons
  getGetableCoupons: typeof getGetableCoupons
}

type PageState = {
  tabIndex: number
}

@connect(
  ({
    user: {
      coupons,
      getableCoupons,
    },
  }) => ({
    coupons: coupons.filter(coupon => coupon.status === 0),
    getableCoupons: getableCoupons.filter(coupon => coupon.name !== '会员核销券'),
    invalidCoupons: coupons.filter(coupon => coupon.status !== 0),
  }),
  dispatch => ({
    getCoupons: () => dispatch(getCoupons()),
    getGetableCoupons: () => dispatch(getGetableCoupons()),
  }),
)

export default class Coupons extends Component<PageProps, PageState> {
  state = {
    tabIndex: 0,
  }

  async componentDidShow() {
    // 获取用户优惠券
    this.props.getCoupons()

    // 获取用户可领优惠券
    this.props.getGetableCoupons()
  }

  // 跳转 url
  goPage = url => {
    Taro.navigateTo({
      url,
    })
  }

  // 切换 nav tab
  onTabChange = (tabIndex: number) => {
    this.setState({
      tabIndex,
    })
  }

  tabs = [
    {
      title: '可领券',
    },
    {
      title: '未使用',
    },
    {
      title: '已失效',
    },
  ]

  render() {
    const { getableCoupons, coupons, invalidCoupons } = this.props
    const { tabIndex } = this.state

    return (
      <View className="container">
        <AtTabs current={tabIndex} tabList={this.tabs} onClick={this.onTabChange} >
          <AtTabsPane current={tabIndex} index={0} >
            <View>
              <CouponList list={getableCoupons} isGetCoupon />
            </View>
          </AtTabsPane>
          <AtTabsPane current={tabIndex} index={1}>
            <View>
              <CouponList list={coupons} />
            </View>
          </AtTabsPane>
          <AtTabsPane current={tabIndex} index={2}>
            <View>
              <CouponList list={invalidCoupons} />
            </View>
          </AtTabsPane>
        </AtTabs >
      </View>
    )
  }
}

