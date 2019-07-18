import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'

export default function PriceInfo(props) {
  const { list = [] } = props
  return <View className="price-info">{
    list.map(item => item.price >= 0 && <View key={item.key} className="price-item">
      <View className="price-item">
        <Text>{item.title}</Text>
        <Text>{item.symbol}{item.price}</Text>
      </View>
    </View>)
  }</View>
}
