import Taro, { Component } from '@tarojs/taro'
import { View, Form, Text, Button } from '@tarojs/components'
import PropTypes from 'prop-types'
import { Price } from '@/components'
import { dateFormat, cError } from '@/utils'
import { getCoupon } from '@/services/user'
import { addWxFormId } from '@/services/wechat'
import './index.scss'


export default class CouponList extends Component {
  static propTypes = {
    list: PropTypes.array,
    isGetCoupon: PropTypes.bool, // 是否是领取优惠券
    atMessage: PropTypes.func,
  }

  static defaultProps = {
    list: [],
    isGetCoupon: false,
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

    const [error, res] =  await cError(getCoupon({ id }))
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
  render () {
    const { list, isGetCoupon = false } = this.props

    return <View className="container">
      {
        list.length === 0 && <View className="no-data">没有优惠券</View>
      }
      {
        list.map(item => {
          let { id, name, moneyMin, moneyMax, dateEnd, dateEndDays, dateEndType, moneyHreshold, needScore, money } = item
          if (money) {
            moneyMin = moneyMax = money
          }
          return <View key={id} className="coupon">
            <View className="title-wrapper">
              <View className="title">{name}</View>
              {isGetCoupon && <View className="button-wrapper">
                {needScore > 0 && <Text className="score-info">{needScore}积分兑换</Text>}
                <Form onSubmit={this.onGetCoupon.bind(this, item)}>
                  <Button
                    form-type="submit"
                    className="button"
                    type="secondary"
                    hoverClass="none"
                  >{needScore > 0 ? '立即兑换' : '立即领取'}</Button>
                </Form>
              </View>}
            </View>
            <View className="content">
              {moneyMin === moneyMax
                ? <View className="price-wrapper">
                    <Price price={moneyMin} className="coupon-price" />
                  </View>
                : <View className="price-wrapper">
                    <Price price={moneyMin} className="coupon-price" />
                    <Text>-</Text>
                    <Price price={moneyMax} className="coupon-price" />
                  </View>}
                <View className="coupon-info">
                  <View className="hreshold">
                    满{moneyHreshold}元可用
                  </View>
                  <View className="date">
                    {(!isGetCoupon || dateEndType === 0) ? `有效期：${dateFormat(dateEnd, 'yyyy/MM/dd')}` : ''}
                    {(isGetCoupon && dateEndType === 1) ? `有效期：领取 ${dateEndDays} 天内有效` : ''}
                  </View>
                </View>
            </View>
          </View>
        })
      }
    </View>
  }
}
