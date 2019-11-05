import { ComponentClass } from 'react'

import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getUserCashLog, getUserAmount, getUserScoreLog } from '@/redux/actions/user'
import { AtTabs, AtTabsPane } from 'taro-ui'
import { CashScoreLog, UserAmount } from '@/redux/reducers/user'

import { priceToFloat } from '@/utils'
import './index.scss'

type PageStateProps = {
  userAmount: UserAmount
  cashLog: CashScoreLog
  scoreLog: CashScoreLog
}

type PageDispatchProps = {
  getUserCashLog: () => void
  getUserAmount: () => void
  getUserScoreLog: () => void
}

type PageOwnProps = {}

type PageState = {
  tabIndex: number
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Asset {
  props: IProps
}

@connect(
  ({
    user: {
      userAmount,
      cashLog,
      scoreLog,
    },
  }) => ({
    userAmount,
    cashLog,
    scoreLog,
  }),
  (dispatch: any) => ({
    getUserCashLog: () => dispatch(getUserCashLog()),
    getUserAmount: () => dispatch(getUserAmount()),
    getUserScoreLog: () => dispatch(getUserScoreLog()),
  }),
)

class Asset extends Component {

  config: Config = {
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
    // 获取用户资产
    this.props.getUserAmount()
    this.props.getUserCashLog()
    this.props.getUserScoreLog()
  }

  // 跳转 url
  goPage = (url: string) => Taro.navigateTo({
    url,
  })

  // 切换 nav tab
  onTabChange = (tabIndex: number) => this.setState({
    tabIndex,
  })

  tabs: {
    title: string
    hidden: boolean
    key: 'cashLog' | 'scoreLog'
    noPrice?: boolean
  }[] = [
    {
      title: '资金明细',
      hidden: false,
      key: 'cashLog',
    },
    {
      title: '积分明细',
      hidden: true,
      key: 'scoreLog',
      noPrice: true,
    },
    // {
    //   title: '押金记录',
    //   hidden: true,
    // },
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
      tabIndex,
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
              <View className="button" onClick={this.goPage.bind(this, '/pages/recharge/index')}>
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
                <View className="score-shop-button" onClick={this.goPage.bind(this, '/pages/score-shop/index')}>
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
          <AtTabs current={tabIndex} tabList={this.tabs} onClick={this.onTabChange} >
            {
              this.tabs.map((tab, index) => {
                const { key } = tab
                const list: CashScoreLog = this.props[key] || []

                return <AtTabsPane key={index} current={tabIndex} index={index} >
                    <View>
                      {list.length === 0 && <View className="no-data">
                        暂无数据
                      </View>}
                      {
                        list.map(item => {
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
                            <View className={`price ${behavior === 0 ? 'color-warn' : ''}`}>{behavior === 0 ? '+' : '-'}{tab.noPrice ? '' : '￥'}{amount}</View>
                          </View>
                        })
                      }
                    </View>
                  </AtTabsPane>
                })
            }
          </AtTabs >
        </View>
      </View>
    )
  }
}


export default Asset as ComponentClass<PageOwnProps, PageState>
