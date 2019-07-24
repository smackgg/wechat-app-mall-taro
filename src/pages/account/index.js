import Taro, { Component } from '@tarojs/taro'
import { View, Image, Swiper, SwiperItem, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getLevelList, getUserAmount } from '@/redux/actions/user'
import {
  getOrderStatistics,
} from '@/redux/actions/order'
// import { AtButton } from 'taro-ui'
import { theme, priceToFloat } from '@/utils'
import classNames from 'classnames'
import { AtIcon } from 'taro-ui'

import './index.scss'

const SWIPER_ITEM_MARGIN = '45rpx'

@connect(
  ({
    user,
  }) => ({
    user,
  }),
  dispatch => ({
    getLevelList: () => dispatch(getLevelList()),
    getUserAmount: () => dispatch(getUserAmount()),
    getOrderStatistics: () => dispatch(getOrderStatistics()),
  }),
)

export default class Account extends Component {

  config = {
    navigationBarTitleText: '个人中心',
  }

  state = {
    swiperIndex: 0,
  }

  orderStatus = [
    {
      icon: '/assets/icon/payment.jpg',
      name: '待支付',
      status: 0,
    },
    {
      icon: '/assets/icon/shipped.jpg',
      name: '待发货',
      status: 1,
    },
    {
      icon: '/assets/icon/receive.jpg',
      name: '待收货',
      status: 2,
    },
    {
      icon: '/assets/icon/comment.jpg',
      name: '待评价',
      status: 3,
    },
    {
      icon: '/assets/icon/aftersale.jpg',
      name: '退货/售后',
      status: 99,
    },
  ]

  componentWillMount() {
    Taro.setNavigationBarColor({
      backgroundColor: theme['$color-brand'],
      frontColor: '#ffffff',
    })
  }

  componentDidShow() {
    // 获取用户资产
    this.props.getUserAmount()
    // 获取订单统计
    this.props.getOrderStatistics()
    // 获取vip等级列表
    this.props.getLevelList()
  }

  getUserAmount = async () => {
  }

  // 会员卡轮播图变化
  onSwiperChange = e => {
    this.setState({
      swiperIndex: e.detail.current,
    })
  }

  // 跳转 url
  goPage = (url, e) => {
    e.stopPropagation()
    Taro.navigateTo({
      url,
    })
  }

  render () {
    const { swiperIndex } = this.state
    const {
      userDetail: { avatarUrl, nick, mobile },
      userLevel: {
        lv = 1,
        name,
      },
      levelList,
      userAmount: {
        balance,
        freeze,
        score,
      },
    } = this.props.user

    return (
      <View className="container">
        {/* 用户信息 */}
        <View className="userinfo" style={{ backgroundColor: theme['$color-brand'] }}>
          <Image className="userinfo-bg" src="/assets/img/account_bg.png"></Image>
          <View className="content">
            <Image className="avatar" src={avatarUrl}></Image>
            <View className="info">
              <View className="nickname">{nick}</View>
              <View className="vip-info">
                <Image className="vip-icon" src={`/assets/icon/vip${lv}_icon.png`}></Image>
                <View className={`vip-name vip${lv}`}>{name}</View>
                <View className={`vip-level vip${lv}`}>Lv.{lv}</View>
              </View>
            </View>
          </View>
          {/* 会员卡轮播组件 */}
          <Swiper
            className="swiper-wrapper"
            indicatorDots={false}
            previousMargin={SWIPER_ITEM_MARGIN}
            nextMargin={SWIPER_ITEM_MARGIN}
            onChange={this.onSwiperChange}
            current={lv - 1}
          >
            {levelList.map((level, index) => <SwiperItem className="swiper-item" key={level.id}>
              <View className={classNames('item-content', `vip${level.lv}`)}>
                <Image
                  className={classNames('image', {
                    active: swiperIndex === index,
                  })}
                  src={`/assets/img/vip${level.lv}_bg.png`}
                  mode="aspectFill"
                />
                <View className="vip-names">
                  <Text className="vip-name">{level.name}</Text>
                  <Text className="vip-level">LV.{level.lv}</Text>
                </View>
              </View>
            </SwiperItem>)}
          </Swiper>

          <View>{mobile}</View>
        </View>

        {/* 我的订单 */}
        <View className="orders-wrapper" onClick={this.goPage.bind(this, '/pages/order-list/index')}>
          <View className="title title-line">
            <Text>我的订单</Text>
            <Image
              className="arrow-right"
              src="/assets/icon/arrow-right.png"
              mode="aspectFill"
            />
          </View>
          <View className="order-status">
            {
              this.orderStatus.map(item => <View key={item.status} className="item" onClick={this.goPage.bind(this, `/pages/order-list/index?status=${item.status}`)}>
                <Image
                  className={classNames('image', {
                    active: false,
                  })}
                  src={item.icon}
                  mode="aspectFill"
                />
                <Text>{item.name}</Text>
              </View>)
            }
          </View>
        </View>

        {/* 我的钱包 */}
        <View className="amount-wrapper" onClick={this.goPage.bind(this, '/pages/asset/index')}>
          <View className="title title-line">
            <Text>我的钱包</Text>
            <Image
              className="arrow-right"
              src="/assets/icon/arrow-right.png"
              mode="aspectFill"
            />
          </View>
          <View className="list">
            <View className="item">
              <Text className="text-color-red price">{priceToFloat(balance)}</Text>
              <Text>余额(元)</Text>
            </View>
            <View className="item">
              <Text className="price">{priceToFloat(freeze)}</Text>
              <Text>冻结(元)</Text>
            </View>
            <View className="item">
              <Text className="price">{score}</Text>
              <Text>积分</Text>
            </View>
          </View>
        </View>

        {/* 其它 */}

        <View className="other-wrapper">
            {
              [{
                title: '收货地址',
                url: '/pages/select-address/index',
              }, {
                title: '关于我们',
                url: '',
              }].map((item, index) => <View key={index} className="item" onClick={this.goPage.bind(this, item.url)}>
                <Text>{item.title}</Text>
                <Image
                  className="arrow-right"
                  src="/assets/icon/arrow-right.png"
                  mode="aspectFill"
                />
              </View>)
            }
        </View>
      </View>
    )
  }
}
