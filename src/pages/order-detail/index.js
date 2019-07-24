import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Form } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getOrderDetail } from '@/redux/actions/order'
import { getUserAmount } from '@/redux/actions/user'
import { addWxFormId } from '@/services/wechat'

import { cError, theme } from '@/utils'
import pay from '@/utils/pay'
import { orderClose } from '@/services/order'
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
  }

  componentWillMount () {
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
    } = this.props.orders[this.orderId]
    this.setState({
      productList: goods.map(product => ({
        ...product,
        price: product.amount / product.number,
        name: product.goodsName,
      })),
      orderInfo,
      logistics,
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

  render () {
    const {
      productList = [],
      orderInfo: {
        statusStr,
        amountReal,
        score,
        amountLogistics,
        remark,
        orderNumber,
        dateAdd,
        status,
      },
      logistics,
    } = this.state

    return (
      <View className="container">
        <View className="order-status">订单状态：{statusStr}</View>
        {/* 地址 */}
        {logistics && <Address address={logistics} needLogistics type={1} />}

        {/*  商品卡 */}
        <View className="product-list">
          <ProductList list={productList} />
        </View>

        {/* 订单信息 */}
        <View className="order-info">
          {remark && <View className="content"><Text>用户备注：</Text><Text className="value" selectable>{remark}{remark}{remark}{remark}</Text></View>}
          <View className="content"><Text>订单编号：</Text><Text className="value" selectable>{orderNumber}</Text></View>
          <View className="content"><Text>下单时间：</Text><Text className="value"selectable>{dateAdd}</Text></View>
        </View>

        {/* 价格信息 */}
        <View className="price-info">
          <PriceInfo
            realAmount={amountReal}
            score={score}
            shippingAmount={amountLogistics}
          />
        </View>

        {/* 底部Bar */}
        <BottomBar>
          <Form onSubmit={this.onSubmit}>
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
            </View>
          </Form>
        </BottomBar>
      </View>
    )
  }
}
