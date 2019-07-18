import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getDefaultAddress } from '@/redux/actions/user'
import { createOrder } from '@/services/order'
import { AtTextarea } from 'taro-ui'
import { cError, theme } from '@/utils'
import { PriceInfo, ProductList, Address, BottomBar } from './_components'
import './index.scss'

@connect(({
  user: {
    defaultAddress,
  },
}) => ({
  defaultAddress,
}), dispatch => ({
  getDefaultAddress: type => dispatch(getDefaultAddress(type)),
}))

export default class Checkout extends Component {
  config = {
    navigationBarTitleText: '订单确认',
  }
  state = {
    peisongType: 'kd', // 配送方式 kd,zq 分别表示快递/到店自取
    productList: [],
    needLogistics: false, // 是否需要物流
    productsAmount: -1, // 商品总金额
    shippingAmount: -1, // 运费
    couponAmount: -1, // 优惠券
    totalAmount: -1, // 总价格
    score: -1, // 积分
    remark: '', // 留言
  }

  componentWillMount () {
    this.goodsJsonStr = ''

    // 设置导航条眼色
    Taro.setNavigationBarColor({
      backgroundColor: theme['$color-brand'],
      frontColor: '#ffffff',
    })
  }

  // setState promise 封装
  setStateP = data => new Promise(resolve => {
    this.setState(data, resolve)
  })

  async componentDidShow () {
    let productList = []
    // 立即购买进入结算页
    if (this.$router.params.orderType === 'buyNow') {
      var buyNowInfo = Taro.getStorageSync('buyNowInfo')

      if (buyNowInfo && buyNowInfo.shopList) {
        productList = buyNowInfo.shopList
      }
    } else {
      //购物车下单
      const shopCartInfo = Taro.getStorageSync('shopCartInfo')
      if (shopCartInfo && shopCartInfo.shopList) {
        productList = shopCartInfo.shopList.filter(entity => entity.active)
      }
    }

    this.setState({
      productList,
    })

    // 拉取默认地址
    await this.props.getDefaultAddress()

    // 处理数据初始化
    await this.initData(productList)

    this.placeOrder()
  }

  initData = async productList => {
    // 邀请信息
    let inviterId = Taro.getStorageSync('referrer') || 0

    const {
      needLogistics,
      productsAmount,
      goodsJsonStr,
    } = productList.reduce((result, product) => {
      const { logistics, price, number, goodsId, propertyChildIds } = product
      // 是否需要物流
      if (logistics) {
        result.needLogistics = true
      }
      // 计算商品价格
      result.productsAmount += price * number
      // 拼接结算需要数据
      result.goodsJsonStr.push({
        goodsId,
        number,
        propertyChildIds,
        logisticsType: 0,
        inviter_id: inviterId,
      })
      // result.goodsJsonStr += (result.goodsJsonStr ? ',' : '') + JSON.stringify({
      //   goodsId,
      //   number,
      //   propertyChildIds,
      //   logisticsType: 0,
      //   inviter_id: inviterId,
      // })
      return result
    }, {
      needLogistics: false,
      productsAmount: 0,
      goodsJsonStr: [],
    })

    this.goodsJsonStr = JSON.stringify(goodsJsonStr)
    await this.setStateP({
      needLogistics,
      productsAmount,
    })
  }

  // 留言更改
  handleRemarkChange = e => {
    this.setState({
      remark: e.detail.value,
    })
  }

  // 下单
  placeOrder = async e => {
    const { remark, peisongType, needLogistics } = this.state
    const { defaultAddress } = this.props
    let postData = {
      goodsJsonStr: this.goodsJsonStr,
      remark: remark,
      peisongType: peisongType,
      calculate: !e, // 计算价格
    }

    // 快递物流
    if (needLogistics && peisongType === 'kd') {
      // 没有收货地址
      if (!defaultAddress) {
        Taro.hideLoading()
        Taro.showModal({
          title: '错误',
          content: '请先设置您的收货地址！',
          showCancel: false,
        })
        return
      }
      const { provinceId, cityId, districtId, address, linkMan, mobile, code } = defaultAddress
      postData = {
        ...postData,
        provinceId,
        cityId,
        address,
        linkMan,
        mobile,
        code,
      }

      if (districtId) {
        postData.districtId = districtId
      }
    }

    const [error, result] = await cError(createOrder(postData))

    if (error) {
      Taro.showModal({
        title: '下单错误',
        content: error.msg,
        showCancel: false,
      })
      return
    }

    const {
      amountLogistics,
      amountTotle,
      goodsNumber,
      isNeedLogistics,
      score,
    } = result.data
    // shippingAmount
    // couponAmount
    this.setState({
      totalAmount: amountTotle + amountLogistics,
      shippingAmount: amountLogistics,
      score,
      needLogistics: isNeedLogistics,
      // couponAmount:
    })
    console.log(result)
  }

  render () {
    const { defaultAddress } = this.props
    const {
      productList,
      needLogistics,
      productsAmount,
      shippingAmount,
      couponAmount,
      score,
      totalAmount,
      remark,
    } = this.state

    const priceList = [
      {
        key: 'productsAmount',
        title: '商品金额',
        price: productsAmount,
        symbol: '￥',
      },
      {
        key: 'shippingAmount',
        title: '运费',
        price: shippingAmount,
        symbol: '+￥',
      },
      {
        key: 'couponAmount',
        title: '优惠券',
        price: couponAmount,
        symbol: '-￥',
      },
      {
        key: 'score',
        title: '消耗积分',
        price: score,
        symbol: '-',
      },
    ]
    return (
      <View className="container">
        {/* 地址 */}
        <Address needLogistics={needLogistics} defaultAddress={defaultAddress} />

        {/*  商品卡 */}
        <ProductList productList={productList} />

        {/* 留言 */}
        <AtTextarea
          className="remark"
          value={remark}
          onChange={this.handleRemarkChange}
          maxLength={200}
          placeholder="买家留言"
        />

        {/* 价格信息 */}
        <PriceInfo
          list={priceList}
        />

        {/* 底部Bar */}
        <BottomBar totalAmount={totalAmount} placeOrder={this.placeOrder} />
      </View>
    )
  }
}
