import Taro, { Component } from '@tarojs/taro'
import { View, Form, Text, Button } from '@tarojs/components'
import PropTypes from 'prop-types'
import { Price } from '@/components'
import classNames from 'classnames'
import { dateFormat, cError } from '@/utils'
import { getCoupon } from '@/services/user'
import { addWxFormId } from '@/services/wechat'
import './index.scss'


export default class CouponList extends Component {
  static propTypes = {
    list: PropTypes.array,
    isGetCoupon: PropTypes.bool, // 是否是领取优惠券
  }

  static defaultProps = {
    list: [],
    isGetCoupon: false,
  }

  // 领取优惠券
  onGetCoupon = async (coupon, e) => {
    addWxFormId({
      type: 'form',
      formId: e.detail.formId,
    })

    const [error, res] =  await cError(getCoupon({
      id: coupon.id,
    }))

    // console.log(error, res)
    if (!error) {
      Taro.showToast({
        title: '领取成功，赶紧去下单吧~',
        icon: 'success',
        duration: 2000,
      })
      return
    }

    if (error.code == 20001 || error.code == 20002) {
      Taro.showModal({
        title: '领取失败',
        content: '来晚了~',
        showCancel: false,
      })
      return
    }
    if (error.code == 20003) {
      Taro.showModal({
        title: '领取失败',
        content: '你已经领过了，别贪心哦~',
        showCancel: false,
      })
      return
    }
    if (error.code == 30001) {
      Taro.showModal({
        title: '领取失败',
        content: '您的积分不足',
        showCancel: false,
      })
      return
    }
    if (error.code == 20004) {
      Taro.showModal({
        title: '领取失败',
        content: '已过期~',
        showCancel: false,
      })
      return
    }

    Taro.showModal({
      title: '领取失败',
      content: error.msg,
      showCancel: false,
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
          let { id, name, moneyMin, moneyMax, dateAdd, moneyHreshold, needScore, money } = item
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
                    有效期：{dateFormat(dateAdd, 'yyyy/MM/dd')}
                  </View>
                </View>
            </View>
          </View>
        })
      }
    </View>
  }
}
