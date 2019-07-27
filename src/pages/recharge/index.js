import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { getRechargeSendRules } from '@/redux/actions/user'
import { AtInput, AtForm, AtButton } from 'taro-ui'
import { addWxFormId } from '@/services/wechat'
import pay from '@/utils/pay'

import './index.scss'


@connect(
  ({
    user: {
      rechargeSendRules,
    },
    config: {
      rechargeAmountMin,
    },
  }) => ({
    rechargeSendRules,
    rechargeAmountMin,
  }),
  dispatch => ({
    getRechargeSendRules: () => dispatch(getRechargeSendRules()),
  }),
)

export default class Recharge extends Component {

  config = {
    navigationBarTitleText: '充值余额',
  }

  state = {
    number: '',
  }

  // componentWillMount() {
  //   Taro.setNavigationBarColor({
  //     backgroundColor: theme['$color-brand'],
  //     frontColor: '#ffffff',
  //   })
  // }

  componentDidShow() {
    this.props.getRechargeSendRules()
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
    this.handlePay(rule.confine)
  }

  // 充值按钮
  onSubmit = () => {
    this.handlePay(+this.state.number)
  }

  handlePay = money => {
    const rechargeAmountMin = +this.props.rechargeAmountMin

    if (!money || money < 0) {
      Taro.showModal({
        title: '错误',
        content: '请填写正确的充值金额',
        showCancel: false,
      })
      return
    }
    if (money < rechargeAmountMin * 1) {
      Taro.showModal({
        title: '错误',
        content: '单次充值金额至少' + rechargeAmountMin + '元',
        showCancel: false,
      })
      return
    }
    pay({
      type: 'recharge',
      money,
    })
  }

  render () {
    const { number } = this.state
    const { rechargeSendRules } = this.props
    const rechargeAmountMin = +this.props.rechargeAmountMin

    return (
      <View className="container">
        <AtForm reportSubmit onSubmit={this.onSubmit} className="container">
          <View className="input-wrapper">
            <AtInput
              name="value"
              title="充值金额"
              type="digit"
              placeholder={rechargeAmountMin > 0 ? `填写充值金额(最少${rechargeAmountMin}元)` : '填写充值金额'}
              value={number}
              onChange={this.handleChange}
            />
          </View>

          {
            rechargeSendRules.length > 0 && <View className="button-wrapper">
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

          <AtButton
            className="recharge-button"
            formType="submit"
            type="primary"
            onClick={this.onSubmit}
          >
            <View className="button-line">充值</View>
          </AtButton>

          {
            rechargeSendRules.length > 0 && <View className="recharge-info-wrapper">
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

