import React, { Component } from 'react'
import Taro, { showToast, Current } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { connect } from 'react-redux'

import { getOrderDetail } from '@/redux/actions/order'
import { ProductList, BottomBar } from '@/components'
import { AtRate, AtTextarea } from 'taro-ui'
import { cError } from '@/utils'

import { orderReputation } from '@/services/order'
import { OrderState } from '@/redux/reducers/order'

import './index.scss'


type PageProps = {
  orders: OrderState['orders']
  getOrderDetail: typeof getOrderDetail
}
type PageState = {
  data: Parameters<typeof orderReputation>[0]['reputations']
  productList?: any
}
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

export default class Reputation extends Component<PageProps, PageState> {
  state: PageState = {
    data: [],
    productList: undefined
  }

  componentDidShow() {
    this.init()
  }

  orderId = ''

  // 初始化函数
  init = async () => {
    this.orderId = Current.router?.params.id || ''

    // 拉取订单详情
    const [error] = await cError(this.props.getOrderDetail({
      id: this.orderId,
    }))

    // 订单详情拉取失败
    if (error) {
      console.log(error)
      return
    }

    const {
      goods,
    } = this.props.orders[this.orderId]

    this.setState({
      productList: goods.map(product => ({
        ...product,
        amount: product.amount / product.number,
        name: product.goodsName,
      })),
      data: goods.map(product => ({
        reputation: 0,
        id: product.id,
      })),
    })
  }

  // 修改评分
  handleRateChange = (index, value) => {
    let { data } = this.state
    data[index].reputation = value
    this.setState({
      data,
    })
  }

  // 留言更改
  handleRemarkChange = (index, e) => {
    let { data } = this.state
    data[index].remark = e.target.value
    this.setState({
      data,
    })
  }

  // 提交
  handleSubmit = async () => {
    const { data } = this.state

    // 处理数据
    const postJson = {
      token: Taro.getStorageSync('token') || '',
      orderId: this.orderId,
      reputations: data.map(item => {
        const { reputation, remark, id } = item
        return {
          id,
          remark: remark || '默认好评',
          reputation: reputation > 0 ? reputation - 1 : 2,
        }
      }),
    }

    // 请求
    const [error] = await cError(orderReputation(postJson))

    if (error) {
      Taro.showModal({
        title: '错误',
        content: `评价失败：${error.msg}, 请稍候重试`,
        showCancel: false,
      })
      return
    }
    showToast({
      title: '提交成功~',
      icon: 'none',
      mask: true,
      complete: () => {
        // 跳转回之前的页面
        Taro.navigateBack()
      },
    })
  }

  // 提交按钮
  onButtonClick = () => {
    Taro.showModal({
      title: '是否确认提交？',
      content: '未填写的评价默认为好评~',
      success: res => {
        if (res.confirm) {
          this.handleSubmit()
        }
      },
    })
  }

  rates = ['', '差评', '中评', '好评']

  render () {
    const { productList = [], data } = this.state
    if (productList.length === 0) {
      return null
    }

    return (
      <View className="container">
        <View className="list">
          {
            productList.map((product, index) => {
              const { reputation, remark } = data[index]
              return <View key={product.id} className="item">
                <ProductList list={[product]}></ProductList>
                <View className="rate">
                  <AtRate size={30} max={3} value={reputation} onChange={this.handleRateChange.bind(this, index)} />
                  <Text className="rate__text">{this.rates[reputation]}</Text>
                </View>
                {/* 留言 */}
                <AtTextarea
                  className="remark"
                  value={remark}
                  onChange={this.handleRemarkChange.bind(this, index)}
                  maxLength={200}
                  placeholder="感觉怎么样？跟大家分享一下吧~"
                />
              </View>
            })
          }
        </View>
        {/* 预订按钮 */}
        <BottomBar>
          <Button
            className="submit-button"
            type="primary"
            onClick={this.onButtonClick}
          >提交</Button>
        </BottomBar>
      </View>
    )
  }
}
