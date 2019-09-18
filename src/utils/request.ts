import Taro, { RequestParams } from '@tarojs/taro'

import { subDomain, getCurrentPageUrl } from '@/utils'

const API_BASE_URL = 'https://api.it120.cc'

export default (option: RequestParams): Promise<any> => new Promise((resolve, reject) => {
  const { url, needSubDomain = true, interceptTokenError = true, data = {} } = option
  let reqUrl = API_BASE_URL + (needSubDomain ? '/' + subDomain : '') + url

  // 删减没有数据的参数
  const requestData = Object.keys(data).reduce((pre: { [key: string]: any }, key) => {
    if (data[key] !== undefined) {
      pre[key] = data[key]
    }
    return pre
  }, {})

  // 请求携带 token
  const token = Taro.getStorageSync('token')
  if (token) {
    reqUrl += `${/\?/.test(url) ? '&' : '?'}token=${token}`
  }

  Taro.request({
    ...option,
    data: requestData,
    url: reqUrl,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    success: res => {
      // token 失效
      if (res && res.statusCode === 200 && res.data.code === 2000 && interceptTokenError) {
        Taro.redirectTo({
          url: `/pages/authorize/index?from=${encodeURIComponent(getCurrentPageUrl())}`,
        })
        return
      }
      if (res && res.statusCode === 200 && res.data.code === 0) {
        resolve(res.data)
        return
      }
      reject(res && res.data)
    },
    fail: error => reject(error),
  })
})
