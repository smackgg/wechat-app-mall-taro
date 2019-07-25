import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import PropTypes from 'prop-types'
import { AtButton, AtForm } from 'taro-ui'
import { priceToFloat } from '@/utils'

import './index.scss'

export default function BottomBar(props) {
  const { totalAmount, placeOrder } = props
  return <View className="bottom-bar">
    {totalAmount >= 0 && <Text>实付：￥{priceToFloat(totalAmount)}</Text>}
    <AtForm onSubmit={placeOrder}>
      <View className="place-order">
        <AtButton
          formType="submit"
          full
          type="primary"
        >提交订单</AtButton>
      </View>
    </AtForm>
  </View>
}

BottomBar.propTypes = {
  totalAmount: PropTypes.number,
  placeOrder: PropTypes.func,
}
