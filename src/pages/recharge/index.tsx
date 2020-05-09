import { ComponentClass } from 'react'

import Taro, { Component, Config } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { getRechargeSendRules, getPayBillDiscounts } from '@/redux/actions/user'
import { AtInput, AtForm, AtButton } from 'taro-ui'
import { addWxFormId } from '@/services/wechat'
import pay from '@/utils/pay'

import './index.scss'


type PageStateProps = {
  rechargeSendRules: {
    confine: number
    loop: boolean
    send: number
  }[]
  rechargeAmountMin: number
  billDiscountsRules: {
    confine: number
    loop: boolean
    send: number
  }[]
}

type PageDispatchProps = {
  getRechargeSendRules: () => Promise<void>
  getPayBillDiscounts: () => Promise<void>
}

type PageOwnProps = {}

type PageState = {
  editing: boolean,
  totalAmount: number,
  totalScore: number,
  productList: Product[],
  selectAll: boolean,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Recharge {
  props: IProps
}


@connect(
  ({
    user: {
      rechargeSendRules,
      billDiscountsRules,
    },
    config: {
      rechargeAmountMin,
    },
  }) => ({
    rechargeSendRules,
    rechargeAmountMin,
    billDiscountsRules,
  }),
  (dispatch: any) => ({
    getRechargeSendRules: () => dispatch(getRechargeSendRules()),
    getPayBillDiscounts: () => dispatch(getPayBillDiscounts()),
  }),
)

export default class Recharge extends Component {
  type: number

  config: Config = {
    navigationBarTitleText: '',
  }

  state = {
    number: '',
  }
  componentWillMount() {
    const { type = '0' } = this.$router.params
    this.type = +type

    // 设置页面标题
    Taro.setNavigationBarTitle({
      title: this.type === 0 ? '充值余额' : '在线买单',
    })
  }

  componentDidShow() {
    // wx.startRecord({
    //   success(res) {
    //     console.log(res.tempFilePath)
    //     const tempFilePath = res.tempFilePath
    //   }
    // })
    // setTimeout(function () {
    //   wx.stopRecord() // 结束录音
    // }, 10000)
    // type=0: 充值 tupe=1: 买单
    if (this.type === 0) {
      this.props.getRechargeSendRules()
    } else {
      this.props.getPayBillDiscounts()
    }
  }

  handleChange = value => {
    this.setState({
      number: +value,
    })
  }

  // 表单提交
  onFormSubmit = e => {
    addWxFormId({
      type: 'form',
      formId: e.detail.formId,
    })
  }

  // 快速充值按钮
  onButtonClick = rule => {
    this.type === 0
      ? this.handlePay(rule.confine)
      : this.handlePaybill(rule.consume)
  }

  // 充值按钮
  onSubmit = () => {
    this.type === 0
      ? this.handlePay(+this.state.number)
      : this.handlePaybill(+this.state.number)
  }

  // 支付
  handlePay = async money => {
    const rechargeAmountMin = +this.props.rechargeAmountMin

    if (!money || money < 0) {
      Taro.showModal({
        title: '错误',
        content: '请填写正确的充值金额',
        showCancel: false,
      })
      return
    }
    if (money < rechargeAmountMin) {
      Taro.showModal({
        title: '错误',
        content: '单次充值金额至少' + rechargeAmountMin + '元',
        showCancel: false,
      })
      return
    }

    await pay({
      type: 'recharge',
      money,
    })

    Taro.redirectTo({
      url: '/pages/asset/index',
    })
  }

  // 在线买单支付
  handlePaybill = async money => {
    const rechargeAmountMin = +this.props.rechargeAmountMin

    const billDiscountsRule = this.props.billDiscountsRules
      .sort((a, b) => b.consume - a.consume)
      .find(item => money >= item.consume)

    if (!money || money < 0) {
      Taro.showModal({
        title: '错误',
        content: '请填写正确的消费金额',
        showCancel: false,
      })
      return
    }

    if (money < rechargeAmountMin) {
      Taro.showModal({
        title: '错误',
        content: '单次消费金额至少' + rechargeAmountMin + '元',
        showCancel: false,
      })
      return
    }

    await pay({
      type: 'paybill',
      money,
      data: {
        billDiscountsRule,
      },
    })

    Taro.redirectTo({
      url: '/pages/asset/index',
    })
  }

  render () {
    const { number } = this.state
    const { rechargeSendRules, billDiscountsRules } = this.props
    const rechargeAmountMin = +this.props.rechargeAmountMin

    return (
      <View className="container">
        <AtForm reportSubmit onSubmit={this.onFormSubmit} className="container">
          <View className="input-wrapper">
            <AtInput
              name="value"
              title={`${this.type === 0 ? '充值' : '消费'}金额`}
              type="digit"
              placeholder={this.type === 0 ? '填写充值金额' : '请询问店内服务员后输入'}
              value={number}
              onChange={this.handleChange}
            />
          </View>
          {rechargeAmountMin > 0 && <View className="tip">*最小金额 {rechargeAmountMin} 元</View>}

          {/* 在线充值 */}
          {
            this.type === 0 && rechargeSendRules.length > 0 && <View className="button-wrapper">
              {
                rechargeSendRules.map((rule, index) => <AtButton
                  key={index}
                  className="secondary button"
                  formType="submit"
                  onClick={this.onButtonClick.bind(this, rule)}
                >
                  <View className="button-line">充 {rule.confine} 元</View>
                  <View className="button-line">送 {rule.send} 元</View>
                </AtButton>)
              }
            </View>
          }

          {/* 在线买单 */}
          {
            this.type === 1 && billDiscountsRules.length > 0 && <View className="button-wrapper">
              {
                billDiscountsRules.map((rule, index) => <AtButton
                  key={index}
                  className="secondary button"
                  formType="submit"
                  onClick={this.onButtonClick.bind(this, rule)}
                >
                  <View className="button-line">消费满 {rule.consume} 元</View>
                  <View className="button-line">立减 {rule.discounts} 元</View>
                </AtButton>)
              }
            </View>
          }

          <AtButton
            className="recharge-button"
            formType="submit"
            type="primary"
            onClick={this.onSubmit}
          >
            <View className="button-line">{this.type === 0 ? '充值' : '确认支付'}</View>
          </AtButton>

          {
            this.type === 0 && rechargeSendRules.length > 0 && <View className="recharge-info-wrapper">
              <View className="title">充值赠送规则：</View>
              {
                rechargeSendRules.map((rule, index) => <View key={index} className="info-item">
                  <View className="info-title">单笔充值{rule.loop ? '每' : ''}满 {rule.confine} 元，送 {rule.send} 元</View>
                  <View className="info-desp">
                    单笔充值每满 { rule.confine } 元，即可获得奖励。
                    {
                      rule.loop && <View>充的多送的多，上不封顶。</View>
                    }
                  </View>
                </View>)
              }
            </View>
          }
        </AtForm>
      </View>
    )
  }
}
