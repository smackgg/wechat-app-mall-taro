import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getOrderDetail } from '@/redux/actions/order'

import { cError} from '@/utils'
import classNames from 'classnames'
import './index.scss'


@connect(
  ({
    order: {
      orders,
    },
  }) => ({
    orders,
  }),
  dispatch => ({
    getOrderDetail: data => dispatch(getOrderDetail(data)),
  }),
)

export default class Reputation extends Component {
  config = {
    navigationBarTitleText: '订单评价',
  }

  state = {
    navIndex: 0,
  }

  async componentDidShow() {
    this.orderId = this.$router.params.id
    if (!this.props.orders[this.orderId]) {
      this.init()
    }
  }

  // 初始化函数
  init = async () => {
    // 拉取订单详情
    const [error] = await cError(this.props.getOrderDetail({
      orderId: this.orderId,
    }))

    // 订单详情拉取失败
    if (error) {
      console.log(error)
    }
  }


  render () {
    return (
      <View className="container">
        1
      </View>
    )
  }
}

