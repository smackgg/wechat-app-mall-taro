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
})
