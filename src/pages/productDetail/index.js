import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components'
import { AtIcon, AtButton, AtFloatLayout, AtInputNumber } from 'taro-ui'
import { getProductDetail } from '@/redux/actions/goods'
// import { AtButton, AtAvatar } from 'taro-ui'
import { theme } from '@/utils'
import WxParse from '@/thirdUtils/wxParse/wxParse'
import { productPrice } from '@/services/goods'


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
    isSkuFloatLayoutOpened: true,
    selectSku: {},
    buttonType: 1, // 1: 立即购买 2: 加入购物车
    amount: 1, // 商品数量
  }

  componentWillMount() {
    // 获取页面商品id
    const { id } = this.$router.params
    this.productId = id
    // 设置bar颜色
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
    console.log(productInfo)

    this.handleSelectSku(productInfo)

    // 处理商品详情富文本
    WxParse.wxParse('article', 'html', productInfo.content, this.$scope, 5)
    // 设置页面标题
    Taro.setNavigationBarTitle({
      title: productInfo.basicInfo.name,
    })
  }

  // 处理当前选中sku逻辑
  handleSelectSku = async productInfo => {
    const {
      basicInfo: {
        propertyIds,
        stores,
        minPrice,
        id,
      },
      properties,
    } = productInfo

    // 没有配属性值
    if (!propertyIds) {
      this.setState({
        selectSku: {
          stores,
          price: minPrice,
          originalPrice,
        },
        productInfo,
      })
    } else {
      // 配置属性值
      // 默认取第一个sku
      let { propertyChildIds, propertiesN } = properties.reduce((pre, propertie) => {
        pre.propertyChildIds.push(propertie.childsCurGoods[0].id)
        // 选中状态
        propertie.childsCurGoods[0].checked = true
        pre.propertiesN.push(propertie)
        return pre
      }, {
        propertyChildIds: [],
        propertiesN: [],
      })

      propertyChildIds = propertyChildIds.join(',')

      const res = await productPrice({
        propertyChildIds,
        goodsId: id,
      })
      this.setState({
        selectSku: {
          ...res.data,
          propertyChildIds,
        },
        productInfo: {
          ...productInfo,
          properties: propertiesN,
        },
      })
    }
  }

  // 关闭选配弹窗
  handleClose = () => {
    this.setState({
      isSkuFloatLayoutOpened: false,
    })
  }

  // 展开选配框
  showSelectSku = type => {
    this.setState({
      isSkuFloatLayoutOpened: true,
      buttonType: type,
    })
  }

  // 用户点击选配属性
  onAttributeClick = async (index, attribute) => {
    let {
      productInfo: { properties },
      productInfo,
      selectSku: { propertyChildIds },
    } = this.state

    // 同规格 选中状态重置
    properties[index].childsCurGoods.forEach((child) => {
      child.checked = child.id === attribute.id
      return child
    })

    // 更新选中 propertyChildIds
    propertyChildIds = propertyChildIds
      .split(',')
      .map((id, i) => index === i ? attribute.id : id)
      .join(',')

    const res = await productPrice({
      propertyChildIds,
      goodsId: this.productId,
    })

    this.setState({
      selectSku: {
        ...res.data,
        propertyChildIds,
      },
      productInfo: {
        ...productInfo,
        properties,
      },
    })
  }

  // 处理数量变更
  onNumberChange = value => {
    this.setState({
      amount: value,
    })
  }

  render () {
    const {
      productInfo,
      isSkuFloatLayoutOpened,
      selectSku: {
        stores,
        price,
      },
      selectSku,
      buttonType,
      amount,
    } = this.state

    // 商品详情页数据未拉取
    if (!productInfo && Object.keys(selectSku).length === 0) {
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
        pic,
      },
      logistics,
      extJson,
      properties,
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
            <View className="price-wrapper">
              <Text className="price">￥{minPrice}</Text>
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

        {/* 底部 bottom bar */}
        <View className="bottom-bar">
          <View>
            <AtIcon value="search" size="24" color="#5d5d5d"></AtIcon>
            <Text>客服</Text>
          </View>
          <View>
            <AtIcon value="shopping-cart" size="24" color="#5d5d5d"></AtIcon>
            <Text>购物车</Text>
          </View>
          <View className="button-wrapper">
            <View className="add-card">
              <AtButton
                className="button1"
                full
                type="primary"
                onClick={this.showSelectSku.bind(this, 2)}
              >加入购物车</AtButton>
            </View>
            <View>
              <AtButton
                className="button"
                full type="primary"
                onClick={this.showSelectSku.bind(this, 1)}
              >立即购买</AtButton>
            </View>
          </View>
        </View>

        {/* 选配框 */}
        <AtFloatLayout className="sku-select" isOpened={isSkuFloatLayoutOpened} onClose={this.handleClose}>
          <View className="select_product-info">
            <Image mode="widthFix" src={pic} class="product-image" />
            <View>
              <View className="price">￥{price}</View>
              {selectSku.originalPrice !== price && <View className="original-price">￥{selectSku.originalPrice}</View> }
              <View>库存：{stores}</View>
            </View>
          </View>
          {/* 规格参数 */}
          {properties && <View className="properties">
            {
              properties.map((propertie, index) => <View key={propertie.id}>
                <View className="propertie-name">
                  {propertie.name}
                </View>
                <View className="attributes">
                  {
                    propertie.childsCurGoods.map(child => <View key={child.id} className="attribute">
                      <AtButton
                        size="small"
                        className="button"
                        type={child.checked ? 'primary' : 'secondary'}
                        onClick={this.onAttributeClick.bind(this, index, child)}
                      >{child.name}</AtButton>
                    </View>)
                  }
                </View>
              </View>)
            }
          </View>}
          {/* 数量 */}
          <View className="amount">
            <View>数量</View>
            <AtInputNumber
              min={1}
              max={10}
              step={1}
              value={amount}
              onChange={this.onNumberChange}
            />
          </View>
          <AtButton
            className="button"
            full type="primary"
            onClick={this.showSelectSku.bind(this, 1)}
          >{buttonType === 1 ? '立即购买' : '加入购物车'}</AtButton>
        </AtFloatLayout>
      </View>
    )
  }
}

export default ProductDetail
