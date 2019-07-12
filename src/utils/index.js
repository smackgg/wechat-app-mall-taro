import Taro from '@tarojs/taro'

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
