import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import PropTypes from 'prop-types'
import { AtButton } from 'taro-ui'
import { priceToFloat } from '@/utils'

import './index.scss'

export default function BottomBar(props) {
  const { totalAmount, placeOrder } = props
  return <View className="bottom-bar">
    {totalAmount >= 0 && <Text>实付款：￥{priceToFloat(totalAmount)}</Text>}
    <View className="place-order">
      <AtButton
        full
        type="primary"
        onClick={placeOrder}
      >提交订单</AtButton>
    </View>
  </View>
}

BottomBar.propTypes = {
  totalAmount: PropTypes.number,
  placeOrder: PropTypes.func,
}
