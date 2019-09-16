/**
 * 添加购物车
 *
 * @param {?String} type // order 支付订单 recharge 充值 paybill 优惠买单
 * @param {?Number} score // 积分
 * @param {Number} money // 金额
 * @param {orderId} money // 订单 id
 * @param {?Object} data //  扩展 数据
 */
import Taro from '@tarojs/taro'

import { wxpay, addWxFormId } from '@/services/wechat'

import { store } from '@/redux/store'
import { getUserAmount } from '@/redux/actions/user'
import { cError } from '@/utils'
import { orderPay, billPay } from '@/services/order'

export default function pay({
  score = 0,
  money,
  orderId,
  type = 'order',
  data = {},
}: {
  score?: number,
  money: number,
  orderId: string,
  type?: string,
  data?: any,
}): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // 先拉取用户余额
    const [error, userAmount] = await cError(store.dispatch(getUserAmount()))
    if (error) {
      Taro.showModal({
        title: '提示',
        content: '支付失败，请稍候重试~',
        showCancel: false,
      })
      return reject()
    }

    const { score: userScore, balance } = userAmount

    // 订单支付
    if (type === 'order') {
      if (userScore < score) {
        Taro.showToast({
          title: '您的积分不足，无法支付',
          icon: 'none',
        })
        return reject()
      }

      const moneyReal = (money * 100 - balance * 100) / 100 // 浮点数bug
      let msg = '订单金额: ' + money + ' 元'
      if (balance > 0) {
        msg += '，可用余额为 ' + balance + ' 元'
        if (moneyReal > 0) {
          msg += '，仍需微信支付 ' + moneyReal + ' 元'
        }
      }

      // 消费中含有积分
      if (score > 0) {
        // 只有积分没有现金的情况
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
          if (!res.confirm) {
            return reject()
          }

          // 直接支付订单 余额
          if (orderId && moneyReal <= 0) {
            const [err] = await cError(orderPay({ orderId }))
            if (err) {
              Taro.showModal({
                title: '支付失败',
                content: err.msg,
                showCancel: false,
              })
              return reject()
            }
            // 提示支付成功
            Taro.showToast({
              title: '支付成功',
            })
          } else {
            const [err] = await cError(wxPay({
              type,
              money: moneyReal,
              orderId,
            }))
            if (err) {
              return reject(err)
            }
          }
          resolve()
        },
      })
    }

    // 在线充值
    if (type === 'recharge') {
      wxPay({ type, money })
        .then(() => resolve)
        .catch((e: Error) => reject(e))
    }

    // 在线买单
    if (type === 'paybill') {
      const { billDiscountsRule } = data
      let msg = '您本次消费 ' + money + ' 元'
      let needPayAmount: number | string = +money
      // 有买单优惠
      if (billDiscountsRule) {
        needPayAmount -= billDiscountsRule.discounts
        msg += `，优惠 ${billDiscountsRule.discounts} 元，优惠后金额 ${needPayAmount} 元`
      }
      // 有余额
      if (+balance > 0) {
        msg += '，当前账户可用余额 ' + balance + ' 元'
      }

      const moneyReal = +((needPayAmount - balance).toFixed(2))// 需要额外微信支付的金额

      // 需要微信支付
      if (moneyReal > 0) {
        msg += '，仍需微信支付 ' + moneyReal + ' 元'
      }
      Taro.showModal({
        title: '请确认消费金额',
        content: msg,
        confirmText: '确认支付',
        cancelText: '取消支付',
        success: async res => {
          if (!res.confirm) {
            return reject()
          }

          // 直接支付 余额
          if (moneyReal <= 0) {
            const [err] = await cError(billPay({ money }))
            if (err) {
              Taro.showModal({
                title: '买单失败！',
                content: err.msg,
                showCancel: false,
              })
              return reject()
            }
            // 提示支付成功
            Taro.showToast({
              title: '买单成功！',
            })
          } else {
            // 微信支付
            const [err] = await cError(wxPay({
              type,
              money: moneyReal,
              orderId,
            }))
            if (err) {
              return reject(err)
            }
          }
          resolve()
        },
      })
    }

  })
}

export function wxPay({
  type,
  money,
  orderId,
}: {
  type: string,
  money: number,
  orderId?: string,
}): Promise<any> {
  return new Promise((resolve, reject) => {
    let remark = '在线充值'
    let nextAction

    // 订单
    if (type === 'order') {
      remark = '支付订单 ：' + orderId
      nextAction = {
        type: 0,
        id: orderId,
      }
    }

    // 优惠买单
    if (type === 'paybill') {
      remark = '优惠买单 ：' + money,
      nextAction = {
        type: 4,
        uid: Taro.getStorageSync('uid'),
        money,
      }
    }

    return wxpay({
      money,
      remark,
      payName: remark,
      nextAction: nextAction && JSON.stringify(nextAction),
    }).then((res: requestResult) => {
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
          let msg = err.errMsg
          if (msg.includes('fail cancel')) {
            msg = '支付取消'
          }

          Taro.showToast({
            title: '支付失败:' + msg,
            icon: 'none',
            duration: 2000,
          })
          reject(msg)
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
    }).catch((error: requestError) => {
      const { code, msg } = error
      Taro.showModal({
        title: '出错了',
        content: code + ':' + msg,
        showCancel: false,
      })
      reject(msg)
    })
  })
}
