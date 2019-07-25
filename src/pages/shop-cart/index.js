import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getOrderDetail } from '@/redux/actions/order'
import { ProductList } from '@/components'
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

export default class ShopCart extends Component {
  config = {
    navigationBarTitleText: '购物车',
  }

  state = {
    editing: false,
    totalAmount: -1,
    totalScore: -1,
    productList: [],
    selectAll: false,
  }

  async componentDidShow() {
    const shopCartInfo = Taro.getStorageSync('shopCartInfo')
    // this.shopList = shopCartInfo.shopList
    this.handleData(shopCartInfo)
  }

  handleData = (shopCartInfo = {}) => {

    const { shopList = [] } = shopCartInfo
    const nextState = shopList.reduce((pre, item) => {
      const { price, score, number } = item
      if (item.active) {
        // 价格和积分总和
        pre.total += (price * 100 * number) / 100
        pre.totalScore += score * number
      } else {
        // 是否全选
        pre.selectAll = false
      }
      return pre
    }, {
      totalAmount: 0,
      totalScore: 0,
      selectAll: true,
    })
    this.setState({
      ...nextState,
      productList: shopList,
    })
  }

  onCheckboxChange = (product, value) => {
    console.log(product, value)
  }

  render () {
    const { productList } = this.state
    return (
      <View className="container">
        {productList.length === 0 && <View className="no-data">购物车为空</View>}
        <ProductList list={productList} edit onCheckboxChange={this.onCheckboxChange}></ProductList>
      </View>
    )
  }
}

