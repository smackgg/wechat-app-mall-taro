import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getOrderDetail } from '@/redux/actions/order'
import { getUserAmount } from '@/redux/actions/user'
import { AtTextarea, AtButton } from 'taro-ui'
import { cError, theme } from '@/utils'
import wxPay from '@/utils/wxPay'
import { orderPay } from '@/services/order'
import { ProductList, Address } from '../checkout/_components'
import './index.scss'

@connect(({
  order: {
    orders,
  },
  user: {
    userAmount,
  },
}) => ({
  orders,
  userAmount,
}), dispatch => ({
  getOrderDetail: data => dispatch(getOrderDetail(data)),
  getUserAmount: () => dispatch(getUserAmount()),
}))

export default class OrderDetail extends Component {
  config = {
    navigationBarTitleText: '订单详情',
  }
  state = {
    productList: [],
    orderInfo: {},
  }

  componentWillMount () {
    // 设置导航条眼色
    Taro.setNavigationBarColor({
      backgroundColor: theme['$color-brand'],
      frontColor: '#ffffff',
    })
  }

  // setState promise 封装
  setStateP = data => new Promise(resolve => {
    this.setState(data, resolve)
  })

  componentDidShow () {
    this.init()
  }

  // 初始化函数
  init = async () => {
    this.orderId = this.$router.params.id

    // 拉取订单详情
    const [error] = await cError(this.props.getOrderDetail({
      orderId: this.orderId,
    }))

    // 订单详情拉取失败
    if (error) {
      console.log(error)
    }

    const {
      goods,
      orderInfo,
    } = this.props.orders[this.orderId]
    this.setState({
      productList: goods.map(product => ({
        ...product,
        price: product.amount / product.number,
        name: product.goodsName,
      })),
      orderInfo,
    })
    console.log(this.props.orders)
  }

  // 去支付
  onPay = async () => {
    const {
      amountReal,
      id,
      score,
    } = this.state.orderInfo
    await this.props.getUserAmount()
    console.log(this.props.userAmount)
    const { score: userScore, balance } = this.props.userAmount
    if (userScore < score) {
      Taro.showToast({
        title: '您的积分不足，无法支付',
        icon: 'none',
      })
      return
    }

    let msg = '订单金额: ' + amountReal + ' 元'
    if (balance > 0) {
      msg += '，可用余额为 ' + balance + ' 元'
      if (amountReal - balance > 0) {
        msg += '，仍需微信支付 ' + (amountReal - balance) + ' 元'
      }
    }
    if (score > 0) {
      msg += '，并扣除 ' + score + ' 积分'
    }

    Taro.showModal({
      title: '请确认支付',
      content: msg,
      confirmText: '确认支付',
      cancelText: '取消支付',
      success: (res) => {
        if (res.confirm) {
          this.wxPay(id, amountReal - balance)
        }
      },
    })
  }

  // 调起微信支付
  wxPay = async (orderId, money) => {
    if (money <= 0) {
      // 直接使用余额支付
      await orderPay({ orderId })
      this.init()
    } else {
      wxPay({
        type: 'order',
        money,
        orderId,
        redirectUrl: '/pages/order-list/index',
      })
    }
  }

  render () {
    const {
      productList = [],
      orderInfo: {
        statusStr,
      },
    } = this.state
    return (
      <View className="container">
        <View className="order-status">订单状态：{statusStr}</View>
        {/* 地址 */}
        <Address />

        {/*  商品卡 */}
        <ProductList productList={productList} />

        {/* 价格信息 */}


        {/* 底部Bar */}
        <View>
          <AtButton
            formType="submit"
            full
            type="primary"
            onClick={this.onPay}
          >去支付</AtButton>
        </View>
      </View>
    )
  }
}
