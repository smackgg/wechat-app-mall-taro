import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Button, Image } from '@tarojs/components'
import PropTypes from 'prop-types'
import { Price, ProductList } from '@/components'
import pay from '@/utils/pay'

import './index.scss'

type Props = {
  list: any[]
  statusName: string
  refreshData: () => void
}

export default class CouponList extends Component<Props, any> {
  static propTypes = {
    list: PropTypes.array,
    statusName: PropTypes.string,
    refreshData: PropTypes.func,
  }

  static defaultProps = {
    list: [],
    isGetCoupon: false,
    statusName: '',
  }

  // 去订单详情
  goToOrderDetail = id => {
    Taro.navigateTo({
      url: `/pages2/order-detail/index?id=${id}`,
    })
  }

  // 跳转 url
  goPage = url => Taro.navigateTo({ url })

  // 去支付
  onPay = async (order, e) => {
    e.stopPropagation()

    const { score, amountReal, id } = order

    await pay({
      score,
      money: amountReal,
      orderId: id,
      type: 'order',
    })
    this.props.refreshData()
  }

  render () {
    const { list } = this.props

    return <View className="order-list__orderlist">
      {
        list.length === 0 && <View className="no-data">没有相关订单</View>
      }
      {
        list.map(item => {
          const {
            id,
            orderNumber,
            goodsMap,
            amountReal,
            score,
            goodsNumber,
            status,
            statusStr,
            hasRefund,
          } = item

          return <View key={id} className="order" onClick={this.goToOrderDetail.bind(this, id)}>
            <View className="title-wrapper">
              <View className="order-number">订单号: <Text selectable>{orderNumber}</Text></View>
              <View className="order-status">
                {hasRefund && <Text className="refund">(已退款)</Text>}
                <Text>{statusStr}</Text>
                <Image
                  className="arrow-right"
                  src="/assets/icon/arrow-right.png"
                  mode="widthFix"
                />
              </View>
            </View>

            {/* 商品列表 */}
            <ProductList list={goodsMap} />

            {/* 价格信息 */}
            <View className="total-wrapper">
              <View className="amount-real">
                <View className="product-count">共{goodsNumber}个商品</View>
                <Text>实付:</Text><Price className="real-price" price={amountReal} score={score} />
              </View>
              {
                status === 0 && <View className="button-wrapper">
                  <Button
                    form-type="submit"
                    className="button"
                    hoverClass="none"
                    size="mini"
                    onClick={this.onPay.bind(this, item)}
                  >立即支付</Button>
                </View>
              }
              {
                status === 3 && <View className="button-wrapper">
                  <Button
                    form-type="submit"
                    className="button"
                    hoverClass="none"
                    size="mini"
                    onClick={e => {
                      e.stopPropagation()
                      this.goPage(`/pages/a-package-1/reputation/index?id=${id}`)
                    }}
                  >去评价</Button>
                </View>
              }
            </View>
          </View>
        })
      }
    </View>
  }
}
