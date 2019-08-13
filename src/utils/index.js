import Taro from '@tarojs/taro'

export { default as dateFormat } from './dateFormat'

export * from '../shopConfig.js'

// 重写 toast 的 complete 方法
export const showToast = options => {
  const { complete, duration = 1500 } = options

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

// valueEqual from https://www.npmjs.com/package/value-equal
const valueOf = obj => obj.valueOf ? obj.valueOf() : Object.prototype.valueOf.call(obj)
export const valueEqual = (a, b) => {
  // Test for strict equality first.
  if (a === b) return true

  // Otherwise, if either of them == null they are not equal.
  if (a == null || b == null) return false

  if (Array.isArray(a)) {
    return (
      Array.isArray(b) &&
      a.length === b.length &&
      a.every(function (item, index) {
        return valueEqual(item, b[index])
      })
    )
  }

  if (typeof a === 'object' || typeof b === 'object') {
    var aValue = valueOf(a)
    var bValue = valueOf(b)

    if (aValue !== a || bValue !== b) return valueEqual(aValue, bValue)

    return Object.keys(Object.assign({}, a, b)).every(function (key) {
      return valueEqual(a[key], b[key])
    })
  }

  return false
}
