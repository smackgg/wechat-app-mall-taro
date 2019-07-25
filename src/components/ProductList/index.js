import Taro from '@tarojs/taro'
import PropTypes from 'prop-types'
import { View, Image, Text } from '@tarojs/components'
import MyCheckbox from '../Checkbox'
import Price from '../Price'
import './index.scss'

export default function ProductList(props) {
  const { list = [], edit = false, onCheckboxChange } = props
  if (list.length === 0) {
    return null
  }

  // checkbox change
  const onChange = (product, value) => {
    onCheckboxChange && onCheckboxChange(product, value)
  }

  return <View className="product-list">
    {
      list.map(product => {
        const { id, pic, name, goodsName, number, property, score, amount, active } = product

        return <View className="product" key={id}>
          {edit && <MyCheckbox checked={active} onChange={onChange.bind(this, product)}></MyCheckbox>}
          <Image className="product-image" src={pic} mode="aspectFill"></Image>
          <View className="product-info">
            <Text className="name">{goodsName || name}</Text>
            <Text className="property">规格: {property || '无规格参数'}</Text>
            <Price className="product-price" price={amount} score={score} />
          </View>
          <View className="count">x{number}</View>
        </View>
      })
    }
  </View>
}

ProductList.propTypes = {
  list: PropTypes.array,
  edit: PropTypes.bool,
  onCheckboxChange: PropTypes.func,
}
