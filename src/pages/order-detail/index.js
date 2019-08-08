import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Form } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getOrderDetail } from '@/redux/actions/order'
import { getUserAmount } from '@/redux/actions/user'
import { addWxFormId, sendTempleMsg } from '@/services/wechat'

import { cError } from '@/utils'
import pay from '@/utils/pay'
import { orderClose, orderDelivery } from '@/services/order'
import { ProductList, Address, PriceInfo, BottomBar } from '@/components'

import './index.scss'

@connect(({
  order: {
    orders,
  },
  user: {
    userAmount,
  },
}) => ({
  orders,
  userAmount,
}), dispatch => ({
  getOrderDetail: data => dispatch(getOrderDetail(data)),
  getUserAmount: () => dispatch(getUserAmount()),
}))

export default class OrderDetail extends Component {
  config = {
    navigationBarTitleText: '订单详情',
  }
  state = {
    productList: [],
    orderInfo: {},
    productsAmount: -1,
  }

  // setState promise 封装
  setStateP = data => new Promise(resolve => {
    this.setState(data, resolve)
  })

  componentDidShow () {
    this.init()
  }

  // 初始化函数
  init = async () => {
    this.orderId = this.$router.params.id

    // 拉取订单详情
    const [error] = await cError(this.props.getOrderDetail({
      orderId: this.orderId,
    }))

    // 订单详情拉取失败
    if (error) {
      console.log(error)
    }

    const {
      goods,
      orderInfo,
      logistics,
      orderInfo: {
        amountReal,
        amount,
        amountLogistics,
      },
    } = this.props.orders[this.orderId]

    const productsAmount = goods.reduce((price, product) => {
      price += product.amount
      return price
    }, 0)

    this.setState({
      productList: goods.map(product => ({
        ...product,
        amount: product.amount / product.number,
        name: product.goodsName,
      })),
      productsAmount,
      orderInfo,
      logistics,
      couponAmount: (amount * 100 + amountLogistics * 100 - amountReal * 100) / 100,
    })
  }

  // 表单提交
  onSubmit = e => {
    addWxFormId({
      type: 'form',
      formId: e.detail.formId,
    })
  }

  // 去支付
  onPay = async () => {

    const { score, amountReal, id } = this.state.orderInfo

    await pay({
      score,
      money: amountReal,
      orderId: id,
      type: 'order',
    })
    this.init()
  }

  // 取消订单
  onOrderClose = () => {
    const { id } = this.state.orderInfo

    Taro.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: async res => {
        if (res.confirm) {
          const [error] = await cError(orderClose({
            orderId: id,
          }))
          console.log(error)
          if (!error) {
            Taro.showToast({
              title: '取消成功',
              icon: 'none',
            })
            this.init()
            return
          }
          Taro.showModal({
            title: '订单取消失败',
            content: error.msg,
            showCancel: false,
          })
        }
      },
    })
  }

  //

  onConfirm = () => {
    const { id, orderNumber } = this.state.orderInfo

    Taro.showModal({
      title: '提示',
      content: '确认您已收到商品？',
      success: async res => {
        if (res.confirm) {
          const [error] = await cError(orderDelivery({
            orderId: id,
          }))
          console.log(error)
          if (error) {
            Taro.showModal({
              title: '确认收货失败',
              content: error.msg,
              showCancel: false,
            })
            return
          }
          this.init()
          const color = '#173177'
          sendTempleMsg({
            module: 'immediately',
            postJsonString: JSON.stringify({
              keyword1: {
                value: '确认收货',
                color,
              },
              keyword2: { value: orderNumber, color },
              keyword3: {
                value: '您已确认收货，期待您的再次光临！点击进行评价~',
                color,
              },
            }),
            template_id: 'o-kpENsK0_ocB8xm-FhGtO2fhwCkSDxpjhmdcfHkSuE',
            type: 0,
            url: '/pages/order-detail/index?id=' + id,
          })
        }
      },
    })
  }

  render () {
    const {
      productList = [],
      orderInfo: {
        statusStr,
        score,
        remark,
        orderNumber,
        dateAdd,
        status,
        hasRefund,
        amountReal,
        amountLogistics,
      },
      productsAmount,
      couponAmount,
      otherDiscounts,
      logistics,
    } = this.state

    return (
      <View className="container">
        <View className="order-status">订单状态：{statusStr}<Text className="refund">{hasRefund ? '(已退款)': ''}</Text></View>
        {/* 地址 */}
        {logistics && <View className="address"><Address address={logistics} needLogistics type={1} /></View>}

        {/*  商品卡 */}
        <View className="product-list">
          <ProductList list={productList} />
        </View>

        {/* 订单信息 */}
        <View className="order-info">
          {remark && <View className="content"><Text>用户备注：</Text><Text className="value" selectable>{remark}</Text></View>}
          <View className="content"><Text>订单编号：</Text><Text className="value" selectable>{orderNumber}</Text></View>
          <View className="content"><Text>下单时间：</Text><Text className="value"selectable>{dateAdd}</Text></View>
        </View>

        {/* 价格信息 */}
        <View className="price-info">
          <PriceInfo
            productsAmount={productsAmount}
            couponAmount={couponAmount}
            otherDiscounts={otherDiscounts}
            realAmount={amountReal}
            shippingAmount={amountLogistics}
            score={score}
          />
        </View>

        {/* 底部Bar */}
        <BottomBar>
          <Form reportSubmit onSubmit={this.onSubmit}>
            <View className="button-wrapper">
              <Button
                form-type="submit"
                className="button-secondary"
                hoverClass="none"
                size="mini"
                type="secondary"
                openType="contact"
              >咨询客服</Button>
              {
                status === 0 && <Button
                  form-type="submit"
                  className="button-secondary"
                  hoverClass="none"
                  size="mini"
                  type="secondary"
                  onClick={this.onOrderClose}
                >取消订单</Button>
              }
              {
                status === 0 && <Button
                  form-type="submit"
                  className="button"
                  hoverClass="none"
                  size="mini"
                  onClick={this.onPay}
                >立即支付</Button>
              }
              {
                status === 2 && <Button
                  form-type="submit"
                  className="button"
                  hoverClass="none"
                  size="mini"
                  onClick={this.onConfirm}
                >确认收货</Button>
              }
            </View>
          </Form>
        </BottomBar>
      </View>
    )
  }
}
