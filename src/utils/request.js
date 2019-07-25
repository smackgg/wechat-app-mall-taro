import Taro from '@tarojs/taro'
import { subDomain } from '@/utils'

const API_BASE_URL = 'https://api.it120.cc'

export default option => new Promise((resolve, reject) => {
  const { url, needSubDomain = true } = option
  let reqUrl = API_BASE_URL + (needSubDomain ? '/' + subDomain : '') + url

  // 请求携带 token
  const token = Taro.getStorageSync('token')
  if (token) {
    reqUrl += `${/\?/.test(url) ? '&' : '?'}token=${token}`
  }

  Taro.request({
    ...option,
    url: reqUrl,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    success: res => {
      // token 失效
      if (res && res.statusCode === 200 && res.data.code === 2000) {
        Taro.navigateTo({
          url: '/pages/authorize/index',
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
