import Taro from '@tarojs/taro'

/**
 * 添加购物车
 *
 * @param {String} type // "cart": 加入正常购物车；"buynow": 加入立即购买购物车
 * @param {Object} productInfo // 商品信息
 */
export const addCart = ({ type = 'cart', productInfo }) => {
  const { number, goodsId, propertyChildIds } = productInfo
  // 购物车数据
  let shopCartInfo = Taro.getStorageSync('shopCartInfo')

  if (!shopCartInfo) {
    shopCartInfo = { shopNum: 0, shopList: [] }
  }

  const { shopList } = shopCartInfo

  if (type === 'cart') {
    // 购物车逻辑
    let hasSameGoods = -1
    if (shopCartInfo) {
      // 如果历史购物车中有该商品，就直接更新数量和信息
      shopCartInfo.shopList = shopList.map(item => {
        if (item.goodsId === goodsId && item.propertyChildIds === propertyChildIds) {
          hasSameGoods = 1
          item.active = true
          return {
            ...item,
            ...productInfo,
            active: true,
            number: item.number + (+number),
          }
        }
        return item
      })
      shopCartInfo.shopNum += (+number)
    }

    // 购物车中没有该商品
    if (hasSameGoods < 0) {
      shopCartInfo.shopList.unshift(productInfo)
    }

    // 写入本地存储
    Taro.setStorage({
      key: 'shopCartInfo',
      data: shopCartInfo,
    })

    return shopCartInfo
  } else if (type === 'buynow') {
    // 立即购买逻辑
    shopCartInfo.shopList = [productInfo]
    shopCartInfo.number = +number
    // 写入本地存储
    Taro.setStorage({
      key: 'buyNowInfo',
      data: shopCartInfo,
    })
    return shopCartInfo
  } else {
    console.error('暂无此操作')
    return {}
  }
}


/**
 * 更新购物车
 *
 * @param {String} type // "update": 更新购物车；"delete": 删除购物车
 * @param {Object} productInfo // 商品信息
 * @param {Array} productLit // 批量更新
 */
export const updateCart = ({ type = 'update', products = [] }) => {
  // 购物车数据
  let shopCartInfo = Taro.getStorageSync('shopCartInfo') || {}

  if (!shopCartInfo) {
    return
  }


  // 如果历史购物车中有该商品，就直接更新数量和信息
  const { shopNum, shopList } = shopCartInfo.shopList.reduce((result, item) => {
    let updated = false

    products.forEach(product => {
      const { goodsId, propertyChildIds } = product
      if (item.goodsId === goodsId && item.propertyChildIds === propertyChildIds) {
        updated = true
        if (type !== 'delete') {
          result.shopNum += product.number
          result.shopList.push({
            ...item,
            ...product,
          })
        }
      }
    })

    if (!updated) {
      result.shopList.push(item)
    }

    if (!updated) {
      result.shopNum += item.number
    }


    return result
  }, {
    shopNum: 0,
    shopList: [],
  })

  shopCartInfo = {
    shopList,
    shopNum,
  }

  // 写入本地存储
  Taro.setStorage({
    key: 'shopCartInfo',
    data: shopCartInfo,
  })

  return shopCartInfo
}
