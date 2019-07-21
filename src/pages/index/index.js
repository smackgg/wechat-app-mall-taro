import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getBanners } from '@/redux/actions/config'
import { getProducts } from '@/redux/actions/goods'
import { priceToFloat } from '@/utils'

import './index.scss'

// 首页多加滤镜
@connect(({ config, goods }) => ({
  banners: config.banners['index'],
  recommendProducts: goods.homeRecommendProducts,
  allProducts: goods.allProducts,
}), dispatch => ({
  getBanners: type => dispatch(getBanners(type)),
  getProducts: data => dispatch(getProducts(data)),
}))

class Index extends Component {
  config = {
    navigationBarTitleText: '首页',
    navigationStyle: 'custom',
  }

  componentWillUnmount () { }

  componentDidShow () {
    // 展示启动页
    this.props.getBanners('index')

    // 加载首页推荐商品
    this.props.getProducts({
      key: 'homeRecommendProducts',
      recommendStatus: 1,
    })

    // 展示发现更多商品块
    this.props.getProducts({
      key: 'allProducts',
      recommendStatus: 1,
      page: 1,
      pageSize: 10,
    })
  }

  // 跳转商品详情页
  goToProductDetail = id => {
    Taro.navigateTo({
      url: `/pages/product-detail/index?id=${id}`,
    })
  }

  render () {
    const { banners, recommendProducts, allProducts } = this.props
    console.log(recommendProducts)
    return (
      <View className="index">
        <Swiper
          className="swiper"
          // indicatorColor="#999"
          // indicatorActiveColor="#333"
          circular
          indicatorDots={false}
          autoplay
        >
          {banners.map((item, index) => <SwiperItem className="swiper-item" key={index}>
            <Image showMenuByLongpress className="swiper-item_image" src={item.picUrl} mode="aspectFill" />
          </SwiperItem>) }
        </Swiper>
        {
          recommendProducts && recommendProducts.length > 0 && <View className="recommend-products">
            <View className="title title-line">精品推荐</View>
            <View className="list">
              {
                recommendProducts.map(product => {
                  const { id, pic, name, characteristic, minPrice, minScore } = product
                  return <View key={id} onClick={this.goToProductDetail.bind(this, id)}>
                    <Image className="product-image" src={pic} mode="aspectFill"></Image>
                    <View className="name clamp">{name}</View>
                    <View className="characteristic clamp">{characteristic}</View>
                    <View className="price">{(minPrice > 0 || minScore === 0)
                      ? `￥${priceToFloat(minPrice)}` : `${minScore} 积分`}</View>
                  </View>
                })
              }
            </View>
          </View>
        }
        {
          allProducts && allProducts.length > 0 && <View className="all-products">
            <View className="title title-line">发现更多</View>
            <View className="list">{
              allProducts.map(product => {
                const { id, pic, name, characteristic, minPrice, minScore } = product
                return <View key={id} className="item" onClick={this.goToProductDetail.bind(this, id)}>
                  <Image className="product-image" src={pic} mode="aspectFill"></Image>
                  <View className="name clamp">{name}</View>
                  <View className="characteristic clamp">{characteristic}</View>
                  <View className="price">{(minPrice > 0 || minScore === 0)
                    ? `￥${priceToFloat(minPrice)}` : `${minScore} 积分`}</View>
                </View>
              })
            }</View>
          </View>
        }
      </View>
    )
  }
}

export default Index
