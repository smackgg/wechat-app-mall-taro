/**
 * type: order 支付订单 recharge 充值 paybill 优惠买单
 * data: 扩展数据对象，用于保存参数
 */
import Taro from '@tarojs/taro'

import { wxpay, addWxFormId } from '@/services/wechat'

import { store } from '@/redux/store'
import { getUserAmount } from '@/redux/actions/user'
import { cError } from '@/utils'
import { orderPay } from '@/services/order'

export default function pay({
  score,
  money,
  orderId,
  type = 'order',
}) {
  return new Promise(async (resolve, reject) => {
    const [error, userAmount] = await cError(store.dispatch(getUserAmount()))
    if (error) {
      Taro.showModal({
        title: '提示',
        content: '支付失败，请稍候重试~',
        showCancel: false,
      })
      return
    }

    console.log(userAmount, 'userAmount')
    const { score: userScore, balance } = userAmount

    if (userScore < score) {
      Taro.showToast({
        title: '您的积分不足，无法支付',
        icon: 'none',
      })
      return
    }

    const moneyReal = (money * 100 - balance * 100) / 100 // 浮点数bug

    let msg = '订单金额: ' + money + ' 元'
    if (balance > 0) {
      msg += '，可用余额为 ' + balance + ' 元'
      if (moneyReal > 0) {
        msg += '，仍需微信支付 ' + moneyReal + ' 元'
      }
    }

    if (score > 0) {
      // 只有积分的情况
      if (money === 0) {
        msg = '订单金额:' + score + ' 积分'
      } else {
        msg += '，并扣除 ' + score + ' 积分'
      }
    }

    Taro.showModal({
      title: '请确认支付',
      content: msg,
      confirmText: '确认支付',
      cancelText: '取消支付',
      success: async res => {
        if (res.confirm) {
          // 直接支付订单
          if (orderId && moneyReal <= 0) {
            const [err] = await cError(orderPay({ orderId }))
            if (err) {
              Taro.showModal({
                title: '支付失败',
                content: err.msg,
                showCancel: false,
              })
              return
            }
            // 提示支付成功
            Taro.showToast({
              title: '支付成功',
            })
          } else {
            await wxPay({
              type,
              money,
              orderId,
            })
          }
          resolve()
        }
      },
    })
  })
}

export function wxPay({
  type,
  money,
  orderId,
  data,
}) {
  return new Promise((resolve, reject) => {
    let remark = '在线充值'
    let nextAction = {}

    // 订单
    if (type === 'order') {
      remark = "支付订单 ：" + orderId
      nextAction = {
        type: 0,
        id: orderId,
      }
    }

    // 优惠买单
    if (type === 'paybill') {
      remark = "优惠买单 ：" + data.money,
        nextAction = {
          type: 4,
          uid: Taro.getStorageSync('uid'),
          money: data.money,
        }
    }

    return wxpay({
      money,
      remark,
      payName: remark,
      nextAction: JSON.stringify(nextAction),
    }).then(res => {
      const {
        timeStamp,
        nonceStr,
        prepayId,
        sign,
      } = res.data
      // 发起支付
      Taro.requestPayment({
        timeStamp,
        nonceStr,
        package: `prepay_id=${prepayId}`,
        signType: 'MD5',
        paySign: sign,
        fail: err => {
          // console.log(err)
          Taro.showToast({
            title: '支付失败:' + err.errMsg,
          })
        },
        success: () => {
          // 保存 formid
          addWxFormId({
            type: 'pay',
            formId: prepayId,
          })
          // 提示支付成功
          Taro.showToast({
            title: '支付成功',
          })
          resolve()
        },
      })
    }).catch(error => {
      const { code, msg } = error
      Taro.showModal({
        title: '出错了',
        content: code + ':' + msg,
        showCancel: false,
      })
    })
  })
}
