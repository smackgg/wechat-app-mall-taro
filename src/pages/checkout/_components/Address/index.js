import Taro, { Component } from '@tarojs/taro'
import PropTypes from 'prop-types'
import { View, Text, Image } from '@tarojs/components'
import { AtIcon } from 'taro-ui'

import addressIcon from '@/assets/icon/address.png'
import './index.scss'

export default class Address extends Component {
  static propTypes = {
    needLogistics: PropTypes.bool,
    defaultAddress: PropTypes.object,
  }

  static defaultProps = {
    needLogistics: false,
  }

  render() {
    const { needLogistics, defaultAddress } = this.props
    return needLogistics && <View className="address">
      {
        (defaultAddress && !defaultAddress.id)
        && <View className="add-address" onClick={this.addAddress}>添加收货地址</View>
      }
      {
        defaultAddress && defaultAddress.id && <View className="address-content" onClick={this.chooseAddress}>
          <Image className="address-icon" src={addressIcon} mode="widthFix" />
          <View className="info">
            <View>
              <Text className="name">收货人：{defaultAddress.linkMan}</Text>
              <Text>{defaultAddress.mobile}</Text>
            </View>
            <View className="detail">
              收货地址{defaultAddress.provinceStr}{defaultAddress.cityStr}{defaultAddress.areaStr === '-' ? '' : defaultAddress.areaStr}{defaultAddress.address}
            </View>
          </View>
          <AtIcon className="chevron-right" value="chevron-right" size="18" color="#000"></AtIcon>
        </View>
      }
    </View>
  }
}
