import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getDefaultAddress } from '@/redux/actions/user'
import { createOrder } from '@/services/order'
import { AtTextarea } from 'taro-ui'
import { cError, theme } from '@/utils'
import { addWxFormId, sendTempleMsg } from '@/services/wechat'
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
    if (e) {
      addWxFormId({
        type: 'form',
        formId: e.detail.formId,
      })
    }

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

    // 查询价格信息
    if (!e) {
      const {
        amountLogistics,
        amountTotle,
        isNeedLogistics,
        score,
      } = result.data
      this.setState({
        totalAmount: amountTotle + amountLogistics,
        shippingAmount: amountLogistics,
        score,
        needLogistics: isNeedLogistics,
      })
      return
    }

    const {
      id,
      dateAdd,
      orderNumber,
      amountReal,
    } = result.data

    // 配置模板消息
    const color = '#173177'
    // 订单取消模板消息
    sendTempleMsg({
      module: 'order',
      business_id: id,
      trigger: -1,
      postJsonString: JSON.stringify({
        keyword1: {
          value: dateAdd,
          color,
        },
        keyword2: {
          value: `${amountReal}元`,
          color,
        },
        keyword3: {
          value: orderNumber,
          color,
        },
        keyword4: {
          value: '订单已关闭',
          color,
        },
        keyword5: {
          value: '您可以重新下单，请在30分钟内完成支付',
          color,
        },
      }),
      template_id: 'CnzS9AtwGj3Zo9rsRGxYvkdflUyz5lsRwNf6c7NgcrA',
      type: 0,
      url: 'pages/index/index',
    })

    // 发货通知模板消息
    sendTempleMsg({
      module: 'order',
      business_id: id,
      trigger: 2,
      postJsonString: JSON.stringify({
        keyword1: {
          value: '已发货',
          color,
        },
        keyword2: {
          value: orderNumber,
          color,
        },
        keyword4: {
          value: dateAdd,
          color,
        },
      }),
      template_id: 'CnzS9AtwGj3Zo9rsRGxYvkdflUyz5lsRwNf6c7NgcrA',
      type: 0,
      url: `pages/order-detail/index?id=${id}`,
    })

    // 下单成功，跳转到订单详情
    Taro.redirectTo({
      url: `/pages/order-detail/index?id=${id}`,
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
