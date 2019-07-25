import Taro, { Component } from '@tarojs/taro'
import { View, Form, Button, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { ProductList, BottomBar, MyCheckbox, Price } from '@/components'
import { updateCart } from '@/redux/actions/user'
import { addWxFormId } from '@/services/wechat'
import './index.scss'


@connect(
  ({
    user: {
      shopCartInfo,
    },
  }) => ({
    shopCartInfo,
  }),
  dispatch => ({
    updateCart: data => dispatch(updateCart(data)),
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
    this.handleData(this.props.shopCartInfo)
  }

  componentWillReceiveProps(nextProps) {
    this.handleData(nextProps.shopCartInfo)
  }

  handleData = (shopCartInfo) => {
    if (!shopCartInfo) {
      return
    }

    const { shopList = [] } = shopCartInfo
    const nextState = shopList.reduce((pre, item) => {
      const { price, score, number } = item
      if (item.active) {
        // 价格和积分总和
        pre.totalAmount += (price * 100 * number) / 100
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

  // 更新选中状态
  onListChange = productInfo => {
    this.props.updateCart({
      products: [productInfo],
    })
  }

  // 表单提交
  onFromSubmit = e => {
    addWxFormId({
      type: 'form',
      formId: e.detail.formId,
    })
  }

  // 全选
  toggleSelectAll = () => {
    const { productList, editing, selectAll } = this.state

    // 非编辑模式
    if (!editing) {
      this.props.updateCart({
        products: productList.map(product => ({
          ...product,
          active: !selectAll,
        })),
      })
    }
  }

  // 用户点击提交
  onSubmit = () => {
    const { editing } = this.state
    // 非编辑模式
    if (!editing) {
      // 跳转到结算页
      Taro.navigateTo({
        url: '/pages/checkout/index?orderType=cart',
      })
    }
  }

  render () {
    const { productList, selectAll, totalAmount, totalScore } = this.state
    return (
      <View className="container shop-cart">
        {productList.length === 0 && <View className="no-data">购物车为空</View>}
        <ProductList list={productList} edit onChange={this.onListChange}></ProductList>
        {/* 底部Bar */}
        <BottomBar>
          <Form onSubmit={this.onFromSubmit}>
            <View className="bottom-bar">
              <View className="checkbox-wrapper" onClick={this.toggleSelectAll}>
                <MyCheckbox checked={selectAll}></MyCheckbox>
                <View className="check-all-text">全选</View>
              </View>
              <Text className="price">合计：</Text>
              <Price price={totalAmount} score={totalScore}></Price>
              <Button
                form-type="submit"
                className="button"
                hoverClass="none"
                size="mini"
                type="secondary"
                onClick={this.onSubmit}
              >去结算</Button>
            </View>
          </Form>
        </BottomBar>
      </View>
    )
  }
}

