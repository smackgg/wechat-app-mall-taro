import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getDefaultAddress } from '@/redux/actions/user'
import { AtButton, AtModal, AtModalHeader, AtModalContent, AtModalAction, AtIcon, AtTextarea } from 'taro-ui'
import { cError, theme } from '@/utils'
import { PriceInfo, ProductList, Address } from './_components'
import addressIcon from '@/assets/icon/address.png'
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
    peisongType: 'kd', // 配送方式 kd,zq 分别表示快递/到店自取
  }
  state = {
    productList: [],
    needLogistics: false, // 是否需要物流
    productsAmount: -1, // 商品总金额
    shippingAmount: -1, // 运费
    couponAmount: -1, // 优惠券
    score: -1, // 积分
  }

  componentWillMount () {
    this.goodsJsonStr = ''

    // 设置导航条眼色
    Taro.setNavigationBarColor({
      backgroundColor: theme['$color-brand'],
      frontColor: '#ffffff',
    })
  }

  componentDidShow () {
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
    this.props.getDefaultAddress()

    // 处理数据初始化
    this.initData(productList)
  }

  initData = productList => {
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
      result.goodsJsonStr += (result.goodsJsonStr ? ',' : '') + JSON.stringify({
        goodsId,
        number,
        propertyChildIds,
        logisticsType: 0,
        inviter_id: inviterId,
      })
      return result
    }, {
      needLogistics: false,
      productsAmount: 0,
      goodsJsonStr: '',
    })

    this.goodsJsonStr = goodsJsonStr
    this.setState({
      needLogistics,
      productsAmount,
    })
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
    } = this.state
    console.log(productList)
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
        // price: shippingAmount,
        price: productsAmount,
        symbol: '+￥',
      },
      {
        key: 'couponAmount',
        title: '优惠券',
        // price: couponAmount,
        price: productsAmount,
        symbol: '-￥',
      },
      {
        key: 'score',
        title: '消耗积分',
        // price: score,
        price: productsAmount,
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
          value={this.state.value}
          onChange={this.handleChange}
          maxLength={200}
          placeholder="买家留言"
        />

        {/* 价格信息 */}
        <PriceInfo
          list={priceList}
        />

        {/* 底部Bar */}
        <View className="">

        </View>
      </View>
    )
  }
}
