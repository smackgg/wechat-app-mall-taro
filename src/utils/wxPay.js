/**
 * type: order 支付订单 recharge 充值 paybill 优惠买单
 * data: 扩展数据对象，用于保存参数
 */
import Taro from '@tarojs/taro'

import { wxpay, addWxFormId } from '@/services/wechat'

export default function pay({
  type,
  money,
  orderId,
  redirectUrl,
  data,
}) {
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

  wxpay({
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
        Taro.redirectTo({
          url: redirectUrl,
        })
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
}
