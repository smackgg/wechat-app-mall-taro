import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import './index.scss'

export default function ProductList(props) {
  const { productList = [] } = props
  return <View className="product-list">
    {
      productList.map(product => {
        const { id, pic, name, price, characteristic, number } = product
        return <View key={id} className="product-item">
          <Image className="product-image" src={pic} mode="widthFix" />
          <View className="info">
            <View className="name">{name}</View>
            <View className="characteristic">{characteristic}</View>
            <View className="price">￥{price}</View>
          </View>
          <View className="amount">x{number}</View>
        </View>
      })
    }
  </View>
}
