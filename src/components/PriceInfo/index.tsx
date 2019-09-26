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

interface DisplayPrice {
  score: number,
  productsAmount?: number,
  shippingAmount?: number,
  couponAmount?: number,
  otherDiscounts?: number,
}

interface Props extends DisplayPrice {
  realAmount: number,
}

type Key = keyof DisplayPrice

export default function PriceInfo(props: Props) {
  const { realAmount, score } = props
  const list = Object.keys(PRICE_MAP).filter((key: Key) => props[key] !== undefined && (props[key] || -1) >= 0)

  return <View className="price-info">
    <View className="list">
      {list.map((key: Key) => {
        const price = props[key] || -1
        if (price <= 0) {
          return <View></View>
        }
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
  list: PropTypes.array.isRequired,
  productsAmount: PropTypes.number,
  shippingAmount: PropTypes.number,
  couponAmount: PropTypes.number,
  score: PropTypes.number,
  realAmount: PropTypes.number,
}
