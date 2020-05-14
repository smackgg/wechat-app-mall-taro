import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import PropTypes from 'prop-types'
import { View, Text, Image } from '@tarojs/components'
import { AtIcon } from 'taro-ui'

import addressIcon from '@/assets/icon/address.png'
import './index.scss'


type Props = {
  needLogistics?: boolean,
  address?: {
    id: string,
    linkMan: string,
    mobile: string,
    provinceStr: string,
    cityStr: string,
    areaStr: string,
    address: string,
  },
  type?: number, // 0: 结算页过来的，可以跳转地址列表；2: 订单的地址，不可以
}

type State = {
}

export default class Address extends Component<Props, State> {
  static propTypes = {
    needLogistics: PropTypes.bool,
    address: PropTypes.object.isRequired,
    type: PropTypes.number, // 0: 结算页过来的，可以跳转地址列表；2: 订单的地址，不可以
  }

  static defaultProps = {
    needLogistics: false,
    type: 0,
  }

  // 添加地址
  addAddress = () => {
    Taro.navigateTo({
      url: '/pages2/address-edit/index',
    })
  }

  // 用户切换地址
  chooseAddress = () => {
    const { type } = this.props
    if (type === 1) {
      return
    }
    Taro.navigateTo({
      url: '/pages2/address-select/index',
    })
  }

  render() {
    const { needLogistics, address, type } = this.props

    return needLogistics && <View className="component__address">
      {
        (!address || (address && !address.id))
        && <View className="add-address" onClick={this.addAddress}>添加收货地址</View>
      }
      {
        address && address.id && <View className="address-content" onClick={this.chooseAddress}>
          <View className="address-info">
            <Image className="address-icon" src={addressIcon} mode="widthFix" />
            <View className="info">
              <View>
                <Text className="name">收货人：{address.linkMan}</Text>
                <Text>{address.mobile}</Text>
              </View>
              <View className="detail">
                收货地址{address.provinceStr}{address.cityStr}{address.areaStr === '-' ? '' : address.areaStr}{address.address}
              </View>
            </View>
          </View>
          {
            type === 0 && <View className="chevron-right">
              <AtIcon value="chevron-right" size="18" color="#000"></AtIcon>
            </View>
          }
        </View>
      }
    </View>
  }
}
