/*
  微信开发相关
*/
import request from '@/utils/request'

// 存储小程序模板消息的formid数据
export const addWxFormId = data => request({
  url: '/template-msg/wxa/formId',
  data: {
    type: 'form',
    ...data,
  },
}).catch(error => console.error(error))

// 模板消息
export const sendTempleMsg = data => request({
  url: '/template-msg/put',
  method: 'post',
  data,
}).catch(error => console.error(error))

// 微信支付
export const wxpay = data => request({
  url: '/pay/wx/wxapp',
  method: 'post',
  data,
})

// 获取微信小程序码
export const wxaQrcode = data => request({
  url: '/qrcode/wxa/unlimit',
  method: 'post',
  data,
})
