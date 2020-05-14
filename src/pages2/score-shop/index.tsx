import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { connect } from 'react-redux'
import { getProducts } from '@/redux/actions/goods'
import { ProductsState } from '@/redux/reducers/goods'
import { Price } from '@/components'

import './index.scss'


type PageProps = {
  products: ProductsState['products'][0]
  getProducts: typeof getProducts
}
type PageState = {

}
@connect(
  ({
    goods: { products },
  }) => ({
    products: products.scoreProducts,
  }),
  dispatch => ({
    getProducts: data => dispatch(getProducts(data)),
  }),
)

export default class ScoreShop extends Component<PageProps, PageState> {
  async componentDidShow() {
    // 加载首页推荐商品
    this.props.getProducts({
      key: 'scoreProducts',
      tagsLike: '积分兑换',
    })
  }

  // 跳转商品详情页
  goToProductDetail = id => {
    Taro.navigateTo({
      url: `/pages2/product-detail/index?id=${id}`,
    })
  }

  render () {
    const {
      products = [],
    } = this.props
    return (
      <View className="container">
        {products.length === 0 && <View className="no-data">暂无积分兑换商品</View>}
        {
          products.length > 0 && <View className="all-products">
            <View className="list">{
              products.map(product => {
                const { id, pic, name, characteristic, minPrice, minScore, numberSells } = product
                return <View key={id} className="item" onClick={this.goToProductDetail.bind(this, id)}>
                  <Image className="product-image" src={pic} mode="aspectFill"></Image>
                  <View className="name clamp">{name}</View>
                  <View className="characteristic clamp">{characteristic}</View>
                  <View className="price-wrapper">
                    <Price price={minPrice} score={minScore}></Price>
                    <View className="sold-amount">
                      已售:{numberSells > 999 ? '999+' : numberSells}件
                    </View>
                  </View>
                </View>
              })
            }</View>
          </View>
        }
      </View>
    )
  }
}
