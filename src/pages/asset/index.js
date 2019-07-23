import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getUserCashLog, getUserAmount } from '@/redux/actions/user'

// import { AtButton } from 'taro-ui'
import { theme, priceToFloat } from '@/utils'
import classNames from 'classnames'
import './index.scss'


@connect(
  ({
    user: {
      userAmount,
      cashLog,
    },
  }) => ({
    userAmount,
    cashLog,
  }),
  dispatch => ({
    getUserCashLog: () => dispatch(getUserCashLog()),
    getUserAmount: () => dispatch(getUserAmount()),
  }),
)

export default class Asset extends Component {

  config = {
    navigationBarTitleText: '我的钱包',
  }

  state = {
    navIndex: 0,
  }

  componentWillMount() {
    Taro.setNavigationBarColor({
      backgroundColor: theme['$color-brand'],
      frontColor: '#ffffff',
    })
  }

  async componentDidShow() {
    // 获取用户资产
    this.props.getUserAmount()
    this.props.getUserCashLog()
  }

  // 跳转 url
  goPage = url => {
    Taro.navigateTo({
      url,
    })
  }

  // 切换 nav tab
  onChangeNav = (navIndex, hidden) => {
    if (hidden) {
      return
    }
    this.setState({
      navIndex,
    })
  }

  tabs = [
    {
      title: '资金明细',
      hidden: false,
    },
    {
      title: '提现记录',
      hidden: true,
    },
    {
      title: '押金记录',
      hidden: true,
    },
  ]

  render () {
    const {
      userAmount: {
        balance,
        freeze,
        score,
        totleConsumed,
      },
      cashLog,
    } = this.props

    const {
      navIndex,
    } = this.state

    return (
      <View className="container">
        <View className="user-amount">
          <View className="content">
            <View className="left">
              <View className="price-info">
                <Text>余额(元)</Text>
                <Text className="price">{priceToFloat(balance)}</Text>
              </View>
              <View className="button">
                充值
              </View>
              <View className="price-info">
                <Text>累计消费(元)</Text>
                <Text className="price2">{priceToFloat(totleConsumed)}</Text>
              </View>
            </View>
            <View className="right">
              <View className="price-info">
                <Text>冻结(元)</Text>
                <Text className="price">{priceToFloat(freeze)}</Text>
              </View>
              <View className="button hidden">
                提现
              </View>
              <View className="score-wraper">
                <View className="price-info">
                  <Text>积分</Text>
                  <Text className="price2">{score}</Text>
                </View>
                <View className="score-shop-button">
                  马上兑换 &gt;
                </View>
              </View>
            </View>
          </View>
        </View>
        {
          !cashLog || cashLog.length < 0 && <View>暂无明细</View>
        }
        <View className="cash-log">
          <View className="nav">
            {
              this.tabs.map((item, index) => <View
                key={index}
                className={classNames('nav-item', {
                  active: navIndex === index,
                  hidden: item.hidden,
                })}
                onClick={this.onChangeNav.bind(this, index, item.hidden)}
              >{item.title}</View>)
            }
          </View>
          {
            cashLog.map(item => {
              const {
                id,
                amount,
                dateAdd,
                typeStr,
                behavior,
              } = item
              return <View key={id} className="log">
                <View className="log-info">
                  <View className="name">{typeStr}</View>
                  <View className="date">{dateAdd}</View>
                </View>
                <View className={`price ${behavior === 0 ? 'color-warn' : ''}`}>{behavior === 0 ? '+' : '-'}￥{amount}</View>
              </View>
            })
          }
        </View>
      </View>
    )
  }
}

