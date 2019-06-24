import Taro from '@tarojs/taro'
import { subDomain } from '@/utils'

const API_BASE_URL = 'https://api.it120.cc'

export default option => new Promise((resolve, reject) => {
  const { url, needSubDomain = true } = option
  const token = Taro.getStorageSync('app_token')

  let reqUrl = API_BASE_URL + (needSubDomain ? '/' + subDomain : '') + url

  if (token) {
    reqUrl += `${/?/.test(url) ? '&' : '?'}token=${token}`
  }
  Taro.request({
    ...option,
    url: reqUrl,
    header: {
      'content-type': 'application/json',
    },
    success(res) {
      if (res && res.statusCode === 200) {
        resolve(res)
        return
      }
      reject(res && res.data)
    },
    fail(error) {
      reject(error)
    },
  })
})
