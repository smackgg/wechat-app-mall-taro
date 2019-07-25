import Taro, { Component } from '@tarojs/taro'
import { View, Text, Form, Button, Image } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getDefaultAddress, getCoupons, updateCart } from '@/redux/actions/user'
import { createOrder } from '@/services/order'
import { AtTextarea, AtDrawer } from 'taro-ui'
import { cError } from '@/utils'
import { addWxFormId, sendTempleMsg } from '@/services/wechat'
import { PriceInfo, ProductList, Address, BottomBar, Price, CouponList } from '@/components'
import classNames from 'classnames'

import './index.scss'

@connect(({
  user: {
    defaultAddress,
    coupons,
  },
}) => ({
  defaultAddress,
  coupons: coupons.filter(coupon => coupon.status === 0),
}), dispatch => ({
  getDefaultAddress: type => dispatch(getDefaultAddress(type)),
  getCoupons: data => dispatch(getCoupons(data)),
  updateCart: data => dispatch(updateCart(data)),
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
    otherDiscounts: -1, // 其它减免 会员折扣等
    score: -1, // 积分
    remark: '', // 留言
    selectedCoupon: null,
    showDrawer: false,
  }

  componentWillMount () {
    this.goodsJsonStr = ''
  }

  // setState promise 封装
  setStateP = data => new Promise(resolve => {
    this.setState(data, resolve)
  })

  async componentDidShow () {
    let productList = []
    this.orderType = this.$router.params.orderType || 'cart'
    // 立即购买进入结算页
    if (this.orderType === 'buyNow') {
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

    // 拉取优惠券 getCoupons
    this.props.getCoupons({
      status: 0,
    })

    // 处理数据初始化
    await this.initData(productList)

    // 拉取默认地址
    await this.props.getDefaultAddress()

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

    const { remark, peisongType, needLogistics, selectedCoupon, productsAmount, productList } = this.state
    const { defaultAddress } = this.props
    let postData = {
      goodsJsonStr: this.goodsJsonStr,
      remark,
      peisongType,
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

    if (selectedCoupon) {
      postData.couponId = selectedCoupon.id
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

      // 会员折扣
      const otherDiscounts = productsAmount - amountTotle > 0 ? productsAmount - amountTotle : -1

      this.setState({
        totalAmount: amountTotle + amountLogistics,
        shippingAmount: amountLogistics,
        score,
        needLogistics: isNeedLogistics,
        otherDiscounts,
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

    if (this.orderType === 'buyNow') {
      Taro.removeStorageSync('buyNowInfo')
    } else {
      this.props.updateCart({
        type: 'delete',
        products: productList,
      })
    }

    // 下单成功，跳转到订单详情
    Taro.redirectTo({
      url: `/pages/order-detail/index?id=${id}`,
    })
  }

  // 展示优惠券列表
  showCoupons = noCoupon => {
    if (noCoupon) {
      return
    }
    this.setState({
      showDrawer: true,
    })
  }

  // 用户选择优惠券
  onSelectCoupon = coupon => {
    const { totalAmount } = this.state
    this.setState({
      selectedCoupon: coupon,
      showDrawer: false,
      couponAmount: totalAmount >= coupon.money ? coupon.money : totalAmount,
    })
  }

  // 关闭右边栏
  onCloseDrawer = () => {
    this.setState({
      showDrawer: false,
    })
  }

  render () {
    const { defaultAddress, coupons } = this.props
    const {
      productList,
      needLogistics,
      productsAmount,
      shippingAmount,
      couponAmount,
      score,
      totalAmount,
      remark,
      showDrawer,
      selectedCoupon,
      otherDiscounts,
    } = this.state

    const noCoupon = coupons.length === 0

    const realAmount = selectedCoupon ? totalAmount - couponAmount : totalAmount

    return (
      <View className="container">
        {/* 地址 */}
        <Address needLogistics={needLogistics} address={defaultAddress} />

        {/*  商品卡 */}
        <View className="product-list">
          <ProductList list={productList} />
        </View>

        {/* 留言 */}
        <AtTextarea
          className="remark"
          value={remark}
          onChange={this.handleRemarkChange}
          maxLength={200}
          placeholder="买家留言"
        />

        <View className="coupons-wrapper" onClick={this.showCoupons.bind(this, noCoupon)}>
          <Text>优惠券</Text>
          <View className="right">
            <Text className={classNames({
              gray: noCoupon,
              red: !noCoupon && !selectedCoupon,
              selected: selectedCoupon,
            })}>
              {noCoupon
                ? '暂无优惠券'
                : (selectedCoupon
                  ? `${selectedCoupon.name}： ${selectedCoupon.money}元优惠券`
                  : `${coupons.length} 张优惠券可用`)}
            </Text>
            {
              !noCoupon && <Image
                className="arrow-right"
                src="/assets/icon/arrow-right.png"
                mode="widthFix"
              />
            }
          </View>
        </View>

        {/* 价格信息 */}
        <View className="price-info">
          <PriceInfo
            productsAmount={productsAmount}
            shippingAmount={shippingAmount}
            couponAmount={couponAmount}
            score={score}
            realAmount={realAmount}
            otherDiscounts={otherDiscounts}
          />
        </View>

        {/* 底部Bar */}
        <BottomBar>
          <Form onSubmit={this.placeOrder}>
            <View className="bottom-bar">
              <Text className="price">实付：</Text>
              <Price price={realAmount} score={score} />
              <Button
                form-type="submit"
                className="button"
                hoverClass="none"
                size="mini"
                type="secondary"
              >去结算</Button>
            </View>
          </Form>
        </BottomBar>

        {/* 优惠券侧弹窗 */}
        <AtDrawer
          show={showDrawer}
          width="90vw"
          mask
          right
          onClose={this.onCloseDrawer}
        >
          <View className="coupon-list-wrapper">
            <CouponList
              list={coupons}
              isUseCoupon
              selectedCoupon={selectedCoupon}
              onSelectCoupon={this.onSelectCoupon}
            ></CouponList>
          </View>
        </AtDrawer>
      </View>
    )
  }
}
