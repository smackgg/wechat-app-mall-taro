import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import PropTypes from 'prop-types'
import { priceToFloat } from '@/utils'
import Price from '../Price'

import './index.scss'

const PRICE_MAP = {
  productsAmount: {
    title: '商品金额',
    symbol: '￥',
  },
  shippingAmount: {
    title: '运费',
    symbol: '+￥',
  },
  couponAmount: {
    key: 'couponAmount',
    title: '优惠券',
    symbol: '-￥',
  },
  score: {
    title: '消耗积分',
    symbol: '-',
  },
  otherDiscounts: {
    title: '其它优惠（包括会员折扣等）',
    symbol: '-',
  },
}
export default function PriceInfo(props) {
  const { realAmount, score } = props
  const list = Object.keys(PRICE_MAP).filter(key => props[key] !== undefined && props[key] >= 0)

  return <View className="price-info">
    <View className="list">
      {list.map(key => {
        const price = props[key]
        const { title, symbol } = PRICE_MAP[key]

        return <View key={key} className="price-item">
          <View className="price-item">
            <Text>{title}</Text>
            <Text>{symbol}{priceToFloat(price)}</Text>
          </View>
        </View>
      })}
    </View>
    <View className="real-amount">
      <Text>实付：</Text><Price price={realAmount} score={score}></Price>
    </View>
  </View>
}

PriceInfo.propTypes = {
  list: PropTypes.array,
  productsAmount: PropTypes.number,
  shippingAmount: PropTypes.number,
  couponAmount: PropTypes.number,
  score: PropTypes.number,
  realAmount: PropTypes.number,
}