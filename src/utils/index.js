import Taro from '@tarojs/taro'

export { default as dateFormat } from './dateFormat'

export * from '../shopConfig.js'

// 重写 toast 的 complete 方法
export const showToast = options => {
  const { complete, duration } = options

  delete options.complete

  Taro.showToast(options)
  setTimeout(complete, duration)
}

// catch promise error
export const cError = async fn => {
  try {
    const result = await fn
    return [null, result]
  } catch (error) {
    return [error, error]
  }
}

// 价格处理
export const priceToFloat = (price = 0) => {
  const float = price.toFixed(2)
  return isNaN(float) ? '' : float
}


// 设置购物车小红点
export const setCartBadge = () => {
  const { shopNum } = Taro.getStorageSync('shopCartInfo') || {}
  if (shopNum && shopNum > 0) {
    Taro.setTabBarBadge({
      index: 2,
      text: String(shopNum),
    })
  } else {
    Taro.removeTabBarBadge({
      index: 2,
    })
  }
}
