/*
  微信开发相关
*/
import request from '@/utils/request'

// 存储小程序模板消息的formid数据
export const addWxFormId = (data: { type: string, formId: string }) => request({
  url: '/template-msg/wxa/formId',
  data: {
    type: 'form',
    ...data,
  },
}).catch(error => console.error(error))


type SendTempleMsgParams = {
  module: string,
  business_id: string,
  trigger: number,
  postJsonString: string,
  template_id: string,
  type: string,
  url: string,
}
// 模板消息
export const sendTempleMsg = (data: SendTempleMsgParams) => request({
  url: '/template-msg/put',
  method: 'POST',
  data,
}).catch(error => console.error(error))

// 微信支付
export const wxpay = (data: {
  money: number,
  remark: string,
  payName: string,
  nextAction: string | undefined
}) => request({
  url: '/pay/wx/wxapp',
  method: 'POST',
  data,
})

// 获取微信小程序码
export const wxaQrcode = (data: {
  scene: string,
  page: string,
  is_hyaline: boolean,
  expireHours: number,
}) => request({
  url: '/qrcode/wxa/unlimit',
  method: 'POST',
  data,
})
