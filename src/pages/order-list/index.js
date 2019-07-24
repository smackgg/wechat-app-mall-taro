import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getOrderList } from '@/redux/actions/order'
import { AtTabs, AtTabsPane, AtMessage } from 'taro-ui'
// import { AtButton } from 'taro-ui'
import { theme, priceToFloat } from '@/utils'
import classNames from 'classnames'
import './index.scss'
import List from './_components/OrderList'

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
    // getUserAmount: () => dispatch(getUserAmount()),
  }),
)

export default class OrderList extends Component {

  config = {
    navigationBarTitleText: '订单列表',
  }

  state = {
    tabIndex: 0,
  }

  componentDidShow() {
    this.init()
  }

  init = () => {
    const { status = 0 } = this.$router.params
    const tabIndex = status === -1 ? 5 : Number(status)
    this.setState({
      tabIndex,
    })
    this.getOrderList(tabIndex)
  }

  setStateP = data => new Promise(resolve => this.setState(data, resolve))

  tabs = [
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
    this.props.getOrderList({
      status: this.tabs[tabIndex].status,
    })
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
    console.log(orderList)
    return (
      <View className="container">
        <AtMessage />
        <AtTabs scroll current={tabIndex} tabList={this.tabs} onClick={this.onTabChange} >
          {
            this.tabs.map((tab, index) => <AtTabsPane key={index} current={tabIndex} index={index} >
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

