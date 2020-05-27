import React, { Component } from 'react'

import Taro from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { connect } from 'react-redux'

import { ProductList, MyCheckbox, Price } from '@/components'
import { updateCart } from '@/redux/actions/user'
import { setCartBadge } from '@/utils'
import { Product } from '@/redux/reducers/goods'
import { UserState } from '@/redux/reducers/user'
import { routes } from '@/utils/router'

import './index.scss'

type PageProps = {
  shopCartInfo: UserState['shopCartInfo']
  updateCart: typeof updateCart
}

type PageState = {
  editing: boolean,
  totalAmount: number,
  totalScore: number,
  productList: Product[],
  selectAll: boolean,
}

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

export default class ShopCart extends Component<PageProps, PageState> {

  state = {
    editing: false,
    totalAmount: -1,
    totalScore: -1,
    productList: [],
    selectAll: false,
  }

  componentWillMount() {
    setCartBadge()
  }

  componentWillReceiveProps(nextProps: PageProps) {
    this.handleData(nextProps.shopCartInfo)
  }

  async componentDidShow() {
    this.handleData(this.props.shopCartInfo)
  }

  handleData = (shopCartInfo: UserState['shopCartInfo']) => {
    if (!shopCartInfo) {
      return
    }

    const { shopList = [] } = shopCartInfo
    const nextState = shopList.reduce((pre: {
      totalAmount: number,
      totalScore: number,
      selectAll: boolean,
    }, item: any) => {
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

    if (shopList.length === 0) {
      nextState.selectAll = false
    }

    this.setState({
      ...nextState,
      productList: shopList,
    })
  }

  // 更新选中状态
  onListChange = (productInfo: any) => {
    this.props.updateCart({
      products: [productInfo],
    })
  }

  // 全选
  toggleSelectAll = () => {
    const { productList, editing, selectAll } = this.state
    if (productList.length === 0) {
      return
    }
    // 非编辑模式
    if (!editing) {
      this.props.updateCart({
        products: productList.map((product: any) => ({
          ...product,
          active: !selectAll,
        })),
      })
    }
  }

  // 用户点击提交
  onSubmit = () => {
    const { editing, productList } = this.state
    if (!productList || productList.length === 0) {
      Taro.showToast({
        title: '购物车为空~',
        icon: 'none',
        duration: 2000,
      })
      return
    }
    // 非编辑模式
    if (!editing) {
      // 跳转到结算页
      Taro.navigateTo({
        url: routes.chekcout + '?orderType=cart',
      })
    }
  }

  render () {
    const { productList, selectAll, totalAmount, totalScore } = this.state
    return (
      <View className="container shop-cart">
        {productList.length === 0 && <View className="no-data">购物车为空</View>}
        {productList.length > 0 && <ProductList list={productList} edit onChange={this.onListChange}></ProductList>}
        {/* 底部Bar */}
        <View className="bottom-bar-wrapper">
          <View className="bottom-bar">
            <View className="checkbox-wrapper" onClick={this.toggleSelectAll}>
              <MyCheckbox checked={selectAll}></MyCheckbox>
              <View className="check-all-text">全选</View>
            </View>
            {productList.length !== 0 && <Text className="price">合计：</Text>}
            <Price price={totalAmount} score={totalScore}></Price>
            <Button
              form-type="submit"
              className="button"
              hoverClass="none"
              size="mini"
              // type="secondary"
              onClick={this.onSubmit}
            >去结算</Button>
          </View>
        </View>
      </View>
    )
  }
}
