import React, { Component } from 'react'
import Taro, { Current } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from 'react-redux'

import { getOrderList } from '@/redux/actions/order'
import { AtTabs, AtTabsPane, AtMessage } from 'taro-ui'
import { OrderState } from '@/redux/reducers/order'
import List from './_components/OrderList'
import './index.scss'

type PageProps = {
  orderList: OrderState['orderList']
  getOrderList: typeof getOrderList
}

type PageState = {
  tabIndex: number
}

@connect(
  ({
    order: {
      orderList,
    },
  }) => ({
    orderList,
  }),
  dispatch => ({
    getOrderList: data => dispatch(getOrderList(data)),
  }),
)

export default class OrderList extends Component<PageProps, PageState> {
  state = {
    tabIndex: 0,
  }

  componentWillMount() {
    const { status } = Current.router?.params || {}
    let tabIndex = 0
    this.tabs.forEach((tab, index) => {
      if (tab.status === +status) {
        tabIndex = index
      }
    })
    this.setState({
      tabIndex,
    })
  }

  componentDidShow() {
    this.init()
  }

  init = async () => {
    Taro.showLoading({
      title: '加载中',
    })

    await this.getOrderList(this.state.tabIndex)
    Taro.hideLoading()
  }

  setStateP = data => new Promise(resolve => this.setState(data, resolve))

  tabs = [
    {
      title: '全部订单',
      status: 'all',
    },
    {
      title: '待支付',
      status: 0,
    },
    {
      title: '待发货',
      status: 1,
    },
    {
      title: '待收货',
      status: 2,
    },
    {
      title: '待评价',
      status: 3,
    },
    {
      title: '已完成',
      status: 4,
    },
    {
      title: '已关闭',
      status: -1,
    },
  ]

  // 拉取订单列表
  getOrderList = tabIndex => {
    const postData: Parameters<typeof getOrderList>[0] = {
      status: 'all'
    }
    const status = this.tabs[tabIndex].status
    if (status !== 'all') {
      postData.status = status
    }
    return this.props.getOrderList(postData)
  }

  // 跳转 url
  goPage = url => {
    Taro.navigateTo({
      url,
    })
  }

  // 切换 nav tab
  onTabChange = tabIndex => {
    this.getOrderList(tabIndex)
    this.setState({
      tabIndex,
    })
  }

  render () {
    const { orderList } = this.props
    const { tabIndex } = this.state
    return (
      <View className="container">
        <AtMessage />
        <AtTabs scroll current={tabIndex} tabList={this.tabs} onClick={this.onTabChange} >
          {
            this.tabs.map((tab, index) => <AtTabsPane key={`at${index}`} current={tabIndex} index={index} >
              <View>
                <List list={orderList[tab.status]} statusName={tab.title} refreshData={this.init} />
              </View>
            </AtTabsPane>)
          }
        </AtTabs >
      </View>
    )
  }
}
