import Taro, { Component } from '@tarojs/taro'
import { View, Form, Text, Button, Image } from '@tarojs/components'
import PropTypes from 'prop-types'
import { Price } from '@/components'
import classNames from 'classnames'
import { dateFormat, cError } from '@/utils'
import { getCoupon } from '@/services/user'
import pay from '@/utils/pay'
import { addWxFormId } from '@/services/wechat'
import './index.scss'


export default class CouponList extends Component {
  static propTypes = {
    list: PropTypes.array,
    status: PropTypes.number,
    atMessage: PropTypes.func,
    statusName: PropTypes.string,
    refreshData: PropTypes.func,
  }

  static defaultProps = {
    list: [],
    isGetCoupon: false,
    statusName: '',
  }

  // 领取优惠券
  onGetCoupon = async (coupon, e, confirm) => {
    const { needScore, id } = coupon
    addWxFormId({
      type: 'form',
      formId: e.detail.formId,
    })

    // 消耗积分需要二次确认
    if (needScore && !confirm) {
      Taro.showModal({
        title: '提示',
        content: `确定要消耗${needScore}积分兑换该优惠券么？`,
        success: res => {
          if (res.confirm) {
            this.onGetCoupon(coupon, e, true)
          }
        },
      })
      return
    }

    const [error, res] =  await cError(getCoupon({
      id,
    }))
    const { atMessage } = this.props

    if (!error) {
      atMessage({
        message: '领取成功~',
        type: 'success',
      })
      return
    }

    if (error.code == 20001 || error.code == 20002) {
      atMessage({
        message: '领取失败, 来晚了呀~',
        type: 'error',
      })
      return
    }
    if (error.code == 20003) {
      atMessage({
        message: '您已经领过了，别贪心哦~',
        type: 'error',
      })
      return
    }
    if (error.code == 30001) {
      atMessage({
        message: '您的积分不足',
        type: 'error',
      })
      return
    }
    if (error.code == 20004) {
      atMessage({
        message: '领取失败, 优惠券已过期~',
        type: 'error',
      })
      return
    }
    atMessage({
      message: '领取失败, ' + error.msg,
      type: 'error',
    })
  }

  // 去支付
  onPay = async (order, e) => {
    addWxFormId({
      type: 'form',
      formId: e.detail.formId,
    })

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
    const { list, statusName } = this.props

    return <View className="container">
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
          } = item

          return <View key={id} className="order">
            <View className="title-wrapper">
              <View className="order-number">订单号: <Text selectable>{orderNumber}</Text></View>
              <View className="order-status">{statusName}</View>
            </View>
            <View className="products-wrapper">
              {
                goodsMap.map(good => <View className="product" key={good.id}>
                  <Image className="product-image" src={good.pic} mode="aspectFill"></Image>
                  <View className="product-info">
                    <Text className="name">{good.goodsName}</Text>
                    <Text className="property">规格:{good.property}</Text>
                    <Price className="product-price" price={good.amount} score={good.score} />
                  </View>
                  <View className="count">x{good.number}</View>
                </View>)
              }
            </View>
            <View className="total-wrapper">
              <View className="amount-real">
                <View className="product-count">共{goodsNumber}个商品</View>
                <Text>实付:</Text><Price className="real-price" price={amountReal} score={score} />
              </View>
              {
                status === 0 && <View className="button-wrapper">
                  <Form onSubmit={this.onPay.bind(this, item)}>
                    <Button
                      form-type="submit"
                      className="button"
                      type="secondary"
                      hoverClass="none"
                      size="mini"
                    >立即支付</Button>
                  </Form>
                </View>
              }
            </View>
          </View>
        })
      }
    </View>
  }
}
