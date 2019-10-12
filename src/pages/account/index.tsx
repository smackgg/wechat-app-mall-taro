import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Image, Swiper, SwiperItem, Text, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getLevelList, getUserAmount, getUserDetail } from '@/redux/actions/user'
import {
  getOrderStatistics,
} from '@/redux/actions/order'
import { INITIAL_STATE as USER_TYPE } from '@/redux/reducers/user'
import { ORDER_STATISTICS } from '@/redux/reducers/order'

import { priceToFloat, setCartBadge } from '@/utils'
import classNames from 'classnames'

import './index.scss'

const SWIPER_ITEM_MARGIN = '45rpx'
type PageStateProps = {
  user: USER_TYPE
  orderStatistics: ORDER_STATISTICS
}

type PageDispatchProps = {
  getUserDetail: () => void
  getLevelList: () => void
  getUserAmount: () => void
  getOrderStatistics: () => void
}

type PageOwnProps = {}

type PageState = {
  swiperIndex: number
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Account {
  props: IProps
}

type OrderStatus = {
  icon: string
  name: string,
  status: number,
  key: keyof ORDER_STATISTICS,
}[]

@connect(
  ({
    user,
    order: {
      orderStatistics,
    },
  }) => ({
    user,
    orderStatistics,
  }),
  (dispatch: any) => ({
    getUserDetail: () => dispatch(getUserDetail()),
    getLevelList: () => dispatch(getLevelList()),
    getUserAmount: () => dispatch(getUserAmount()),
    getOrderStatistics: () => dispatch(getOrderStatistics()),
  }),
)

class Account extends Component {

  config: Config = {
    navigationBarTitleText: '个人中心',
    navigationBarBackgroundColor: '#181923',
    navigationBarTextStyle: 'white',
  }

  state = {
    swiperIndex: 0,
  }

  orderStatus: OrderStatus = [
    {
      icon: '/assets/icon/payment.jpg',
      name: '待支付',
      status: 0,
      key: 'count_id_no_pay',
    },
    {
      icon: '/assets/icon/shipped.jpg',
      name: '待发货',
      status: 1,
      key: 'count_id_no_transfer',
    },
    {
      icon: '/assets/icon/receive.jpg',
      name: '待收货',
      status: 2,
      key: 'count_id_no_confirm',
    },
    {
      icon: '/assets/icon/comment.jpg',
      name: '待评价',
      status: 3,
      key: 'count_id_no_reputation',
    },
    // {
    //   icon: '/assets/icon/aftersale.jpg',
    //   name: '退货/售后',
    //   status: 99,
    // },
  ]

  componentWillMount() {
    setCartBadge()
  }

  componentDidShow() {
    // 获取用户详情
    this.props.getUserDetail()
    // 获取用户资产
    this.props.getUserAmount()
    // 获取订单统计
    this.props.getOrderStatistics()
    // 获取vip等级列表
    this.props.getLevelList()
  }

  // 会员卡轮播图变化
  onSwiperChange = (e: TaroBaseEventOrig) => {
    this.setState({
      swiperIndex: e.detail.current,
    })
  }

  // 跳转 url
  goPage = (url: string, e: TaroBaseEventOrig) => {
    if (!url) {
      return
    }
    e.stopPropagation()
    Taro.navigateTo({
      url,
    })
  }

  render () {
    const { swiperIndex } = this.state
    const {
      userDetail: { avatarUrl, nick },
      userLevel: {
        lv = 0,
        name,
      },
      levelList,
      userAmount: {
        balance,
        freeze,
        score,
        totleConsumed,
      },
    } = this.props.user
    const { orderStatistics } = this.props

    // 用户滑动到的等级
    const swiperLv = levelList[swiperIndex] || {}

    return (
      <View className="container">
        {/* 用户信息 */}
        <View className="userinfo" style={{ backgroundColor: '#181923' }}>
          <Image className="userinfo-bg" src="/assets/img/account_bg.png"></Image>
          <View className="content">
            <Image className="avatar" src={avatarUrl}></Image>
            <View className="info">
              <View className="nickname">{nick}</View>
              {lv !== 0 && <View className="vip-info">
                <Image className="vip-icon" src={`/assets/icon/vip${lv}_icon.png`}></Image>
                <View className={`vip-name vip${lv}`}>{name}</View>
                <View className={`vip-level vip${lv}`}>Lv.{lv}</View>
              </View>}
            </View>
          </View>
          {/* 会员卡轮播组件 */}
          <Swiper
            className="swiper-wrapper"
            indicatorDots={false}
            previousMargin={SWIPER_ITEM_MARGIN}
            nextMargin={SWIPER_ITEM_MARGIN}
            onChange={this.onSwiperChange}
            current={(lv - 1) < 0 ? 0 : (lv - 1)}
          >
            {levelList.map((level, index) => {
              const { id } = level
              // 会员等级小于当前卡会员等级一级以上
              let progressWidth = '0'
              if (lv >= level.lv) {
                // 会员等级大于当前卡的等级
                progressWidth = '100%'
              } else if (level.lv - lv === 1) {
                // 会员等级小于当前卡会员等级一级以内
                progressWidth = `${(level.upgradeAmount - totleConsumed) / level.upgradeAmount * 100}%`
              }

              return <SwiperItem className="swiper-item" key={id}>
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
                  <View className="price-info">
                    <View className="user-consumed">
                      累计充值{level.upgradeAmount}可升级为该会员
                      {/* 当前消费
                      <Text className="price">{totleConsumed}</Text>
                      元 */}
                    </View>
                    {/* 已经是当前会员 */}
                    {
                      (lv === level.lv) && <View className="level-consumed">
                        您已经成为本店{level.name}
                    </View>
                    }
                    {/* {
                      (lv < level.lv && totleConsumed < level.upgradeAmount) && <View className="level-consumed">
                        距离{level.name}还差
                      <Text className="price">{level.upgradeAmount - totleConsumed}</Text>
                        元
                    </View>
                    } */}
                  </View>
                  <View className="vip-progress">
                    <View className="bg"></View>
                    <View className="current" style={{ width: progressWidth }}></View>
                    <View className="vip-level-steps">
                      <View className={classNames({
                          'step-gray': level.lv - 1 > lv,
                        })}
                      >
                        <Text className="step">Lv.{level.lv - 1}</Text>
                        {level.lv - 1 === lv && <Text>(当前等级)</Text>}
                      </View>
                      <View className={classNames({
                        'step-gray': level.lv > lv,
                      })}
                      >
                        <Text className="step">Lv.{level.lv}</Text>
                        {level.lv === lv && <Text>(当前等级)</Text>}
                      </View>
                    </View>
                  </View>
                </View>
              </SwiperItem>
            })}
          </Swiper>

          <View className="vip-interests">
            <View className="interest" onClick={this.goPage.bind(this, '/pages/score-shop/index')}>
              <Image
                className="interest-image"
                src={`/assets/icon/vip${swiperLv.lv || 1}_score.png`}
                mode="aspectFill"
              />
              <Text>积分兑换</Text>
            </View>
            <View className="interest" onClick={this.goPage.bind(this, '/pages/coupons/index')}>
              <Image
                className="interest-image"
                src={`/assets/icon/vip${swiperLv.lv || 1}_coupon.png`}
                mode="aspectFill"
              />
              <Text>领券中心</Text>
            </View>
            <View className="interest" onClick={this.goPage.bind(this, '/pages/vip-center/index')}>
              <Image
                className="interest-image"
                src={`/assets/icon/vip${swiperLv.lv || 1}_more.png`}
                mode="aspectFill"
              />
              <Text>查看权益</Text>
            </View>
            {/* <View className={classNames('interest', {
              disabled: swiperLv.lv > lv || swiperLv.rebate === 10,
            })}
            >
              <Image
                className="interest-image"
                src={`/assets/icon/vip${swiperLv.lv || 1}_discount.png`}
                mode="aspectFill"
              />
              <Text>{(swiperLv.rebate && swiperLv.rebate < 10) ? `${swiperLv.rebate}折优惠` : '暂无优惠'}</Text>
            </View> */}
          </View>
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
                {orderStatistics[item.key] && orderStatistics[item.key] > 0 && <View className="dot">
                  {orderStatistics[item.key] > 99 ? '99+' : orderStatistics[item.key]}
                </View>}
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
                title: '在线买单',
                url: '/pages/recharge/index?type=1',
              }, {
                title: '收货地址',
                url: '/pages/select-address/index?type=1',
              }, {
                title: '店铺位置、导航',
                url: '/pages/location/index',
              }, {
                title: '店内 Wi-Fi',
                url: '/pages/wifi/index',
              }, {
                title: '联系客服',
                url: '',
                contact: true,
              }].map((item, index) => <Button
                key={index}
                className="item"
                onClick={this.goPage.bind(this, item.url)}
                openType={item.contact ? 'contact' : undefined}
              >
                <Text>{item.title}</Text>
                <Image
                  className="arrow-right"
                  src="/assets/icon/arrow-right.png"
                  mode="aspectFill"
                />
              </Button>)
            }
        </View>
      </View>
    )
  }
}

export default Account as ComponentClass<PageOwnProps, PageState>