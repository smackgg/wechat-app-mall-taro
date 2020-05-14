import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Form, Text, Button } from '@tarojs/components'
import PropTypes from 'prop-types'
import { Price } from '@/components'
import { dateFormat, cError } from '@/utils'
import { getCoupon } from '@/services/user'
// import { addWxFormId } from '@/services/wechat'
import classNames from 'classnames'
import { AtMessage } from 'taro-ui'
import './index.scss'


type Coupon = {
  needScore: number,
  id: string,
  name: string,
  moneyMin: number,
  moneyMax: number,
  dateEnd: string,
  dateEndDays: string,
  dateEndType: number,
  moneyHreshold: number,
  money: number,
  status: number,
  statusStr: string,
}

type Props = {
  list: Coupon[],
  isGetCoupon?: boolean, // 是否是领取优惠券
  isUseCoupon?: boolean, // 是否是使用优惠券
  selectedCoupon?: Coupon, // 已经选中的优惠券
  onSelectCoupon?: (coupon: Coupon) => void,
}

export default class CouponList extends Component<Props> {
  static propTypes = {
    list: PropTypes.array,
    isGetCoupon: PropTypes.bool, // 是否是领取优惠券
    isUseCoupon: PropTypes.bool, // 是否是使用优惠券
    selectedCoupon: PropTypes.object, // 已经选中的优惠券
    onSelectCoupon: PropTypes.func,
  }

  static defaultProps = {
    list: [],
    isGetCoupon: false,
    isUseCoupon: false,
  }

  // 领取优惠券
  onGetCoupon = async (coupon: Coupon, e: TaroBaseEventOrig, confirm: boolean) => {
    const { needScore, id } = coupon

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

    const [error] =  await cError(getCoupon({ id }))
    // const { atMessage } = this.props

    if (!error) {
      Taro.atMessage({
        message: '领取成功~',
        type: 'success',
      })
      return
    }

    if (error.code === 20001 || error.code === 20002) {
      Taro.atMessage({
        message: '领取失败, 来晚了呀~',
        type: 'error',
      })
      return
    }
    if (error.code === 20003) {
      Taro.atMessage({
        message: '您已经领过了，别贪心哦~',
        type: 'error',
      })
      return
    }
    if (error.code === 30001) {
      Taro.atMessage({
        message: '您的积分不足',
        type: 'error',
      })
      return
    }
    if (error.code === 20004) {
      Taro.atMessage({
        message: '领取失败, 优惠券已过期~',
        type: 'error',
      })
      return
    }
    Taro.atMessage({
      message: '领取失败, ' + error.msg,
      type: 'error',
    })
  }

  render () {
    const { list, isGetCoupon = false, isUseCoupon, selectedCoupon, onSelectCoupon } = this.props

    return <View className="component__couponList">
      <AtMessage />
      {
        list.length === 0 && <View className="no-data">没有优惠券</View>
      }
      {
        list.map(item => {
          let { id, name, moneyMin, moneyMax, dateEnd, dateEndDays, dateEndType, moneyHreshold, needScore, money, status, statusStr } = item
          if (money) {
            moneyMin = moneyMax = money
          }

          // 会员核销券
          const isVipHeXiao = name === '会员核销券'

          return <View key={id} className={classNames('coupon', { disabled: status !== 0})}>
            <View className="title-wrapper">
              <View className="title">
                {isUseCoupon && selectedCoupon && selectedCoupon.id === id ? <Text className="selected">[使用中]</Text> : ''}
                {status !== 0 && <Text className="selected">[{statusStr}]</Text>}
                {name}
              </View>
              {isGetCoupon && <View className="button-wrapper">
                {needScore > 0 && <Text className="score-info">{needScore}积分兑换</Text>}
                <Form reportSubmit onSubmit={this.onGetCoupon.bind(this, item)}>
                  <Button
                    form-type="submit"
                    className="button"
                    // type="secondary"
                    hoverClass="none"
                  >{needScore > 0 ? '立即兑换' : '立即领取'}</Button>
                </Form>
              </View>}
              {isUseCoupon && selectedCoupon && selectedCoupon.id !== id && <View className="button-wrapper">
                <Button
                  form-type="submit"
                  className="button"
                  // type="secondary"
                  hoverClass="none"
                  onClick={onSelectCoupon ? onSelectCoupon.bind(this, item) : (() => {})}
                >立即使用</Button>
              </View>}
            </View>
            <View className="content">
              {
                !isVipHeXiao && (moneyMin === moneyMax
                  ? <View className="price-wrapper">
                    <Price price={moneyMin} className="coupon-price" />
                  </View>
                  : <View className="price-wrapper">
                    <Price price={moneyMin} className="coupon-price" />
                    <Text>-</Text>
                    <Price price={moneyMax} className="coupon-price" />
                  </View>)
              }
              <View className="coupon-info">
                <View className="hreshold">
                  {isVipHeXiao ? '会员核销券，请在店内消费时向店员展示使用' : `满${moneyHreshold}元可用`}
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
