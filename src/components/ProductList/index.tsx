import Taro from '@tarojs/taro'
import PropTypes from 'prop-types'
import { View, Image, Text } from '@tarojs/components'
import { Product } from '@/redux/reducers/goods'
import { AtInputNumber } from 'taro-ui'
import MyCheckbox from '../Checkbox'
import Price from '../Price'

import './index.scss'

// type Product = {
//   id: number,
//   pic: string,
//   name: string,
//   goodsName: string,
//   number: number,
//   property: string,
//   score: number,
//   amount: number,
//   active: boolean,
//   price: number,
//   label: string,
// }

type Props = {
  list: Product[],
  edit?: boolean,
  onChange?: (product: Product) => void
}

export default function ProductList(props: Props) {
  const { list = [], edit = false, onChange } = props
  if (list.length === 0) {
    return null
  }

  // checkbox change
  const onCheckboxChange = (product: Product) => {
    onChange && onChange({
      ...product,
      active: !product.active,
    })
  }

  const onNumberChange = (product: Product, value: string) => {
    onChange && onChange({
      ...product,
      number: +value,
    })
  }

  return <View className="product-list">
    {
      list.map(product => {
        const { id, pic, name, goodsName, number, property, score, amount, active, price, label } = product
        return <View className="product" key={id}>
          {edit && <View className="check-box">
            <MyCheckbox checked={active} onChange={onCheckboxChange.bind(this, product)}></MyCheckbox>
          </View>}
          <Image className="product-image" src={pic} mode="aspectFill"></Image>
          <View className="product-info">
            <Text className="name">{goodsName || name}</Text>
            <Text className="property">规格: {property || label || '无规格参数'}</Text>
            <Price className="product-price" price={amount || price} score={score} />
          </View>
          {
            edit
              ? <View className="count">
                <AtInputNumber
                  type="number"
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
