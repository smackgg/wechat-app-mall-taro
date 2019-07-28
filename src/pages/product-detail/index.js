import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Image, Text, Swiper, SwiperItem, Button, ScrollView, Form } from '@tarojs/components'
import { AtIcon, AtFloatLayout, AtInputNumber, AtActionSheet, AtActionSheetItem } from 'taro-ui'
import { getProductDetail } from '@/redux/actions/goods'
import WxParse from '@/third-utils/wxParse/wxParse'
import { productPrice } from '@/services/goods'
import { Price, BottomBar } from '@/components'
import classNames from 'classnames'
import { addCart, updateCart } from '@/redux/actions/user'
// import { addWxFormId } from '@/services/wechat'

import './index.scss'

@connect(
  ({ goods, user: { shopCartInfo } }) => ({
    productDetail: goods.productDetail,
    shopCartInfo,
  }),
  dispatch => ({
    getProductDetail: data => dispatch(getProductDetail(data)),
    addCart: data => dispatch(addCart(data)),
    updateCart: data => dispatch(updateCart(data)),
  }),
)

export default class ProductDetail extends Component {

  config = {
    navigationBarTitleText: '',
  }

  state = {
    productInfo: null,
    isSkuFloatLayoutOpened: false,
    selectSku: {},
    buttonType: 1, // 1: 立即购买 2: 加入购物车
    amount: 1, // 商品数量
    showActionSheet: false,
  }

  componentWillMount() {
    // 获取页面商品id
    let { id, scene } = this.$router.params
    this.productId = id

    // 处理扫码进商品详情页面的逻辑
    if (scene) {
      scene = decodeURIComponent(scene)
      if (scene) {
        const [productId, referrer] = scene.split(',')
        this.productId = productId
        Taro.setStorageSync('referrer', referrer)
      }
    }
  }

  async componentDidShow() {
    // 获取商品详情数据
    await this.props.getProductDetail({
      productId: this.productId,
    })

    const productInfo = this.props.productDetail[this.productId]

    this.handleSelectSku(productInfo)

    this.curuid = Taro.getStorageSync('uid')

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
        minScore,
        originalPrice,
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
          score: minScore,
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
      amount: 1,
    })
  }

  // 处理数量变更
  onNumberChange = value => {
    this.setState({
      amount: +value,
    })
  }

  // 处理用户点击提交按钮逻辑
  handleSubmit = () => {
    const { buttonType } = this.state
    buttonType === 1
      ? this.buyNow()
      : this.addToCart()
  }

  // 立即购买
  buyNow = () => {
    const { amount } = this.state
    if (amount< 1) {
      Taro.showModal({
        title: '提示',
        content: '购买数量不能为0~',
        showCancel: false,
      })
      return
    }

    // 组建立即购买信息
    const productInfo = this.buliduCartInfo()
    this.props.addCart({
      type: 'buynow',
      productInfo,
    })

    // 关闭弹窗
    this.handleClose()
    // 跳转到结算页
    Taro.navigateTo({
      url: '/pages/checkout/index?orderType=buyNow',
    })
  }

  // 加购物车（本地缓存）
  addToCart = () => {
    // 组建购物车
    const productInfo = this.buliduCartInfo()

    this.props.addCart({
      productInfo,
    })

    // 关闭弹窗
    this.handleClose()

    Taro.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000,
    })
  }

  // 组建购物车信息 type=0 立即购买 type=1 购物车
  buliduCartInfo = () => {
    const {
      selectSku: {
        propertyChildIds,
        propertyChildNames,
        price,
        score,
      },
      amount,
    } = this.state
    const {
      basicInfo: {
        id,
        pic,
        name,
        logisticsId,
        weight,
      },
      logistics,
    } = this.state.productInfo

    // 商品信息
    const productInfo = {
      goodsId: id,
      pic,
      name,
      propertyChildIds,
      price,
      label: propertyChildNames,
      price,
      score,
      left: '',
      active: true,
      number: +amount,
      logisticsType: logisticsId,
      logistics,
      weight,
    }

    return productInfo
  }

  // 跳转 url
  goPage = (url, tabBar = false) => {
    if (!tabBar) {
      Taro.navigateTo({
        url,
      })
      return
    }

    Taro.switchTab({
      url,
    })
  }

  // 回首页
  goHome = () => {
    Taro.switchTab({
      url: '/pages/index/index',
    })
  }

  // 分享弹窗
  onToggleActionSheet = toggle => {
    this.setState({
      showActionSheet: toggle,
    })
  }

  onShareAppMessage = () => {
    const {
      basicInfo: {
        name,
        id,
        pic,
      },
    } = this.state.productInfo

    const data = {
      title: name,
      path: `/pages/product-detail/index?id=${id}&inviter_id=${Taro.getStorageSync('uid')}`,
      imageUrl: pic,
    }

    return data
  }

  render () {
    const { shopCartInfo } = this.props
    const {
      productInfo,
      isSkuFloatLayoutOpened,
      selectSku: {
        stores,
      },
      selectSku,
      buttonType,
      amount,
      showActionSheet,
    } = this.state

    // 商品详情页数据未拉取
    if (!productInfo || Object.keys(selectSku).length === 0) {
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
        minScore,
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
          circular
          indicatorDots
          autoplay
        >
          {pics.map((item, index) => <SwiperItem showMenuByLongpress className="swiper-item" key={index}>
            <Image className="swiper-item_image" mode="aspectFill" src={item.pic} />
          </SwiperItem>)}
        </Swiper>

        {/* 商品价格块 */}
        <View className="product-info">
          <View className="base">
            <View className="info">
              <Text className="name">{name}</Text>
              <Text className="characteristic">{characteristic}</Text>
            </View>
            <View className="share" onClick={this.onToggleActionSheet.bind(this, true)}>
              <AtIcon value="share-2" size="24" color="#5d5d5d"></AtIcon>
              <View>分享</View>
            </View>
          </View>
          <View className="other">
            <View className="price-wrapper">
              <Price price={minPrice} score={minScore}></Price>
              {originalPrice !== minPrice && <Text className="original-price">￥{originalPrice}</Text>}
            </View>
            {logistics && <Text className="name">邮费：{logistics.isFree ? '包邮' : '￥' + logistics.details[0].firstAmount}</Text>}
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
        <import src="../../third-utils/wxParse/wxParse.wxml" />
        <View className="product-content">
          <View className="title">商品详情</View>
          <template is="wxParse" data="{{wxParseData:article.nodes}}" />
        </View>

        {/* 底部 bottom bar */}
        <BottomBar>
          <View className="bottombar">
            <View className="icon-wrapper">
              <View className="icon" onClick={this.goHome}>
                <Image
                  className="icon-image"
                  src="/assets/icon/shop.jpg"
                  mode="widthFix"
                />
                <Text>店铺</Text>
              </View>
              <View className="icon" onClick={this.goPage.bind(this, '/pages/shop-cart/index', true)}>
                <Image
                  className="icon-image"
                  src="/assets/icon/shopcart.jpg"
                  mode="widthFix"
                />
                <Text>购物车</Text>
                {shopCartInfo && shopCartInfo.shopNum > 0 && <View className="badge">
                  {shopCartInfo.shopNum > 99 ? '99+' : shopCartInfo.shopNum}
                </View>}
              </View>
              <Button className="icon" openType="contact">
                <Image
                  className="icon-image"
                  src="/assets/icon/contact.jpg"
                  mode="widthFix"
                />
                <Text>客服</Text>
              </Button>
            </View>
            <View className="button-wrapper">
              <View className="add-card">
                <Button
                  className="button button-cart"
                  full
                  type="primary"
                  onClick={this.showSelectSku.bind(this, 2)}
                >加入购物车</Button>
              </View>
              <View>
                <Button
                  className="button button-buynow"
                  full type="primary"
                  onClick={this.showSelectSku.bind(this, 1)}
                >立即购买</Button>
              </View>
            </View>
          </View>
        </BottomBar>

        {/* 选配框 */}
        <AtFloatLayout className="sku-select" isOpened={isSkuFloatLayoutOpened} onClose={this.handleClose}>
          <View className="sku-wrapper">
            <ScrollView scrollY className="select-content">
              <View className="select_product-info">
                <Image mode="widthFix" src={pic} class="product-image" />
                <View>
                  <View className="price">￥{selectSku.price}</View>
                  {selectSku.originalPrice !== selectSku.price && <View className="original-price">￥{selectSku.originalPrice}</View>}
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
                          <Button
                            size="mini"
                            className={classNames('attribute-button', child.checked ? 'primary' : 'secondary')}
                            onClick={this.onAttributeClick.bind(this, index, child)}
                          >{child.name}</Button>
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
                  max={stores}
                  step={1}
                  value={amount}
                  onChange={this.onNumberChange}
                />
              </View>
            </ScrollView>
            <BottomBar>
              <Button
                className="submit-button"
                type="primary"
                disabled={stores === 0}
                onClick={this.handleSubmit}
              >{stores === 0 ? '已售罄' : (buttonType === 1 ? '立即购买' : '加入购物车')}</Button>
            </BottomBar>
          </View>
        </AtFloatLayout>

        {/* 分享弹窗 */}
        <AtActionSheet cancelText="取消" isOpened={showActionSheet} onClose={this.onToggleActionSheet.bind(this, false)}>
          <AtActionSheetItem>
            <Button openType="share" className="share-button">直接分享</Button>
          </AtActionSheetItem>
          <AtActionSheetItem onClick={this.goPage.bind(this, `/pages/product-detail/share-product?id=${this.productId}`, false)}>
            生成海报
          </AtActionSheetItem>
        </AtActionSheet>
      </View>
    )
  }
}

