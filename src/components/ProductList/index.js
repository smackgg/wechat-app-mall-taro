import Taro from '@tarojs/taro'
import PropTypes from 'prop-types'
import { View, Image, Text } from '@tarojs/components'
import MyCheckbox from '../Checkbox'
import Price from '../Price'
import { AtInputNumber } from 'taro-ui'

import './index.scss'

export default function ProductList(props) {
  const { list = [], edit = false, onChange } = props
  if (list.length === 0) {
    return null
  }

  // checkbox change
  const onCheckboxChange = product => {
    onChange({
      ...product,
      active: !product.active,
    })
  }

  const onNumberChange = (product, value) => {
    onChange({
      ...product,
      number: +value,
    })
  }

  return <View className="product-list">
    {
      list.map(product => {
        const { id, pic, name, goodsName, number, property, score, amount, active, price } = product
        return <View className="product" key={id}>
          {edit && <View className="check-box">
            <MyCheckbox checked={active} onChange={onCheckboxChange.bind(this, product)}></MyCheckbox>
          </View>}
          <Image className="product-image" src={pic} mode="aspectFill"></Image>
          <View className="product-info">
            <Text className="name">{goodsName || name}</Text>
            <Text className="property">规格: {property || '无规格参数'}</Text>
            <Price className="product-price" price={amount || price} score={score} />
          </View>
          {
            edit
              ? <View className="count">
                <AtInputNumber
                  min={1}
                  max={99999}
                  step={1}
                  value={number}
                  onChange={onNumberChange.bind(this, product)}
                />
              </View>
              : <View className="count">x{number}</View>
          }
        </View>
      })
    }
  </View>
}

ProductList.propTypes = {
  list: PropTypes.array,
  edit: PropTypes.bool,
  onChange: PropTypes.func,
}
