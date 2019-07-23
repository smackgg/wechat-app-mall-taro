import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getCoupons, getGetableCoupons } from '@/redux/actions/user'

import { AtTabs, AtTabsPane, AtMessage } from 'taro-ui'
import CouponList from './_components/CouponList'

import './index.scss'


@connect(
  ({
    user: {
      coupons,
      getableCoupons,
    },
  }) => ({
    coupons: coupons.filter(coupon => coupon.status === 0),
    getableCoupons,
    invalidCoupons: coupons.filter(coupon => coupon.status !== 0),
  }),
  dispatch => ({
    getCoupons: () => dispatch(getCoupons()),
    getGetableCoupons: data => dispatch(getGetableCoupons(data)),
  }),
)

export default class Coupons extends Component {

  config = {
    navigationBarTitleText: '我的钱包',
  }

  state = {
    tabIndex: 0,
  }

  // componentWillMount() {
  //   Taro.setNavigationBarColor({
  //     backgroundColor: theme['$color-brand'],
  //     frontColor: '#ffffff',
  //   })
  // }

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
  onTabChange = tabIndex => {
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

  render () {
    const { getableCoupons, coupons, invalidCoupons } = this.props
    const { tabIndex } = this.state

    return (
      <View className="container">
        <AtMessage />
        <AtTabs current={tabIndex} tabList={this.tabs} onClick={this.onTabChange} >
          <AtTabsPane current={tabIndex} index={0} >
            <View>
              <CouponList list={getableCoupons} isGetCoupon atMessage={Taro.atMessage} />
            </View>
          </AtTabsPane>
          <AtTabsPane current={tabIndex} index={1}>
            <View>
              <CouponList list={coupons} atMessage={Taro.atMessage} />
            </View>
          </AtTabsPane>
          <AtTabsPane current={tabIndex} index={2}>
            <View>
              <CouponList list={invalidCoupons} atMessage={Taro.atMessage} />
            </View>
          </AtTabsPane>
        </AtTabs >
      </View>
    )
  }
}

