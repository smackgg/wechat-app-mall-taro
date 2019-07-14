import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import { getProductDetail } from '@/redux/actions/goods'
// import { AtButton, AtAvatar } from 'taro-ui'
import { theme } from '@/utils'
import WxParse from '@/thirdUtils/wxParse/wxParse'

import './index.scss'


@connect(
  ({ goods }) => ({
    productDetail: goods.productDetail,
  }),
  dispatch => ({
    getProductDetail: data => dispatch(getProductDetail(data)),
  }),
)

class ProductDetail extends Component {

  config = {
    navigationBarTitleText: '',
  }

  state = {
    productInfo: null,
  }

  componentWillMount() {
    // console.log(e, 'eeeeeeeeeeeeeeeeeee')
    const { id } = this.$router.params
    this.productId = id
    Taro.setNavigationBarColor({
      backgroundColor: theme['$color-brand'],
      frontColor: '#ffffff',
    })
  }
  async componentDidShow() {
    // 获取商品详情数据
    await this.props.getProductDetail({
      productId: this.productId,
    })

    const productInfo = this.props.productDetail[this.productId]

    this.setState({
      productInfo,
    })

    console.log(productInfo)
    WxParse.wxParse('article', 'html', productInfo.content, this.$scope, 5)
    // 设置页面标题
    Taro.setNavigationBarTitle({
      title: productInfo.basicInfo.name,
    })
  }

  render () {
    const { productInfo } = this.state
    if (!productInfo) {
      return null
    }
    const {
      pics,
      basicInfo: {
        name,
        characteristic,
        originalPrice,
        minPrice,
        numberOrders,
      },
      logistics,
      extJson,
    } = productInfo

    const services = extJson.service
      ? extJson.service.split(' ')
      : null

    return (
      <View className="container">
        {/* 轮播图 */}
        <Swiper
          className="swiper"
          // indicatorColor="#999"
          // indicatorActiveColor="#333"
          circular
          indicatorDots
          autoplay
        >
          {pics.map((item, index) => <SwiperItem className="swiper-item" key={index}>
            <Image className="swiper-item_image" mode="scaleToFill" src={item.pic} />
          </SwiperItem>)}
        </Swiper>

        {/* 商品价格块 */}
        <View className="product-info">
          <View className="base">
            <View className="info">
              <Text className="name">{name}</Text>
              <Text className="characteristic">{characteristic}</Text>
            </View>
            <View className="share">
              <AtIcon value="share-2" size="24" color="#5d5d5d"></AtIcon>
              <View>分享</View>
            </View>
          </View>
          <View className="other">
            <View className="price">
              <Text className="min-price">￥{minPrice}</Text>
              <Text className="original-price">￥{originalPrice}</Text>
            </View>
            <Text className="name">邮费：{(!logistics || logistics.isFress) ? '包邮' : '￥' + logistics.details[0].firstAmount}</Text>
            <Text>已售：{numberOrders}</Text>
          </View>
        </View>

        {/* 额外服务 */}

        {
          services && <View className="service">
            <View className="title">服务</View>
            <View className="service-list">
              {services.map((service, index) => <Text className="service-item" key={index}>{service}</Text>) }
            </View>
          </View>
        }

        {/* 商品详情 */}
        <import src="../../thirdUtils/wxParse/wxParse.wxml" />
        <View className="product-content">
          <View className="title">商品详情</View>
          <template is="wxParse" data="{{wxParseData:article.nodes}}" />
        </View>
      </View>
    )
  }
}

export default ProductDetail
