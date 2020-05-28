import React, { Component } from 'react'
import Taro, { Current } from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Image, Text, Swiper, SwiperItem, Button } from '@tarojs/components'
import { AtFloatLayout } from 'taro-ui'
import { getProductDetail, getReputation } from '@/redux/actions/goods'
import { productPrice } from '@/services/goods'
import { BottomBar } from '@/components'
import classNames from 'classnames'
import { addCart } from '@/redux/actions/user'
import { ProductsState, ProductDetail as ProductDetailType, Product, Properties } from '@/redux/reducers/goods'
import { UserState } from '@/redux/reducers/user'

import shopIcon from '@/assets/icon/shop.jpg'
import shopcartIcon from '@/assets/icon/shopcart.jpg'
import contactIcon from '@/assets/icon/contact.jpg'
import { routes } from '@/utils/router'

import { ProductPrice, SkuSelect, ReputationCard } from './_components'

import './index.scss'

type PageProps = {
  productDetail: ProductDetailType
  reputations: ProductsState['reputations']
  shopCartInfo: UserState['shopCartInfo']
  getProductDetail: typeof getProductDetail
  getReputation: typeof getReputation
  addCart: typeof addCart
}

type PageState = {
  productInfo?: ProductDetailType,
  isSkuFloatLayoutOpened: boolean,
  selectSku?: { [P in keyof Product]?: Product[P] },
  buttonType: 1 | 2, // 1: 立即购买 2: 加入购物车
}

@connect(
  ({ goods, user: { shopCartInfo } }) => ({
    productDetail: goods.productDetail,
    reputations: goods.reputations,
    shopCartInfo,
  }),
  (dispatch: any) => ({
    getProductDetail: data => dispatch(getProductDetail(data)),
    getReputation: data => dispatch(getReputation(data)),
    addCart: data => dispatch(addCart(data)),
    // updateCart: data => dispatch(updateCart(data)),
  }),
)

export default class ProductDetail extends Component<PageProps, PageState> {
  state: PageState = {
    productInfo: undefined,
    isSkuFloatLayoutOpened: false,
    selectSku: undefined,
    buttonType: 1, // 1: 立即购买 2: 加入购物车
  }

  componentWillMount() {
    // 获取页面商品id
    let { id, scene } = Current.router?.params || {}
    this.productId = id

    // 处理扫码进商品详情页面的逻辑
    if (scene) {
      scene = decodeURIComponent('' + scene)
      const [productId, referrer] = scene.split(',')
      this.productId = productId
      Taro.setStorageSync('referrer', referrer)
    }
  }

  productId: string = ''
  curuid: string = ''


  async componentDidShow() {
    // 获取商品详情数据
    await this.props.getProductDetail({
      id: this.productId,
    })

    const productDetail = this.props.productDetail
    if (!productDetail) {
      return
    }

    const productInfo = productDetail[this.productId]

    this.handleSelectSku(productInfo)

    this.curuid = Taro.getStorageSync('uid')

    // 设置页面标题
    Taro.setNavigationBarTitle({
      title: productInfo.basicInfo.name,
    })

    this.props.getReputation({
      goodsId: this.productId,
    })
  }

  // 处理当前选中sku逻辑
  handleSelectSku = async (productInfo: ProductDetailType) => {
    if (!productInfo) {
      return
    }
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
      let { propertyChildIds, propertiesN } = properties.reduce((pre: {
        propertiesN: Properties[]
        propertyChildIds: string[]
      }, propertie) => {
        pre.propertyChildIds.push(propertie.id + ':' + propertie.childsCurGoods[0].id)
        // 选中状态
        propertie.childsCurGoods[0].checked = true
        pre.propertiesN.push(propertie)
        return pre
      }, {
        propertyChildIds: [],
        propertiesN: [],
      })

      const propertyChildIdsStr: string = propertyChildIds.join(',')

      const res = await productPrice({
        propertyChildIds: propertyChildIdsStr,
        goodsId: id,
      })
      this.setState({
        selectSku: {
          ...res.data,
          propertyChildIds: propertyChildIdsStr,
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
  showSelectSku = (type: 1 | 2) => {
    this.setState({
      isSkuFloatLayoutOpened: true,
      buttonType: type,
    })
  }

  // 跳转 url
  goPage = (url: string, tabBar = false) => {
    if (!tabBar) {
      Taro.navigateTo({ url })
      return
    }

    Taro.switchTab({ url })
  }

  // 回首页
  goHome = () => {
    Taro.switchTab({ url: routes.index })
  }

  onShareAppMessage = () => {
    if (!this.state.productInfo) {
      return {
        title: '分享商品',
        path: `${routes.productDetail}?id=${this.productId}&inviter_id=${Taro.getStorageSync('uid')}`,
      }
    }
    const {
      basicInfo: {
        name,
        id,
        pic,
      },
    } = this.state.productInfo

    const data = {
      title: name,
      path: `${routes.productDetail}?id=${id}&inviter_id=${Taro.getStorageSync('uid')}`,
      imageUrl: pic,
    }

    return data
  }

  render () {
    const { shopCartInfo } = this.props
    const {
      productInfo,
      isSkuFloatLayoutOpened,
      selectSku = {},
      buttonType,
    } = this.state

    // 商品详情页数据未拉取
    if (!productInfo || Object.keys(selectSku).length === 0) {
      return null
    }

    const {
      pics,
      basicInfo,
      logistics,
      extJson,
    } = productInfo

    const services = extJson.service
      ? extJson.service.split(' ')
      : null

    // 评价
    const reputations = this.props.reputations[this.productId] || []
    const reputationList = reputations.slice(0, 3)
    const reputationLength = reputations.length
    return (
      <View className="container">
        {/* 轮播图 */}
        <Swiper
          className="swiper"
          circular
          indicatorDots
          autoplay
        >
          {pics.map((item, index: number) => <SwiperItem showMenuByLongpress className="swiper-item" key={index}>
            <Image className="swiper-item_image" mode="aspectFill" src={item.pic} />
          </SwiperItem>)}
        </Swiper>

        {/* 商品价格块 */}
        <ProductPrice basicInfo={basicInfo} logistics={logistics} productId={this.productId}></ProductPrice>

        {/* 额外服务 */}
        {services && <View className="service">
          <View className="title">服务</View>
          <View className="service-list">
            {services.map((service: string, index: number) => <Text className="service-item" key={index}>{service}</Text>) }
          </View>
        </View>}

        {/* 评价列表 */}
        {
          (reputationList && reputationLength > 0) && <View className="reputations">
            <View className="title-line">商品评价({reputationLength}条)</View>
            {
              reputationList.map((reputation, index) => <ReputationCard key={index} reputation={reputation} />)
            }
            {reputationLength > 3 && <View className="more-reputations" onClick={() => this.goPage(`${routes.productReputations}?id=${this.productId}`)}>查看更多</View>}
          </View>
        }

        {/* 商品详情 */}
        <View className="product-content">
          <View className="title-line">商品详情</View>
          {/* <WxParse html={productInfo.content} /> */}
          <wxparse html={productInfo.content} />
        </View>

        {/* 底部 bottom bar */}
        <BottomBar>
          <View className="bottombar">
            <View className="icon-wrapper">
              <View className="icon" onClick={this.goHome}>
                <Image
                  className="icon-image"
                  src={shopIcon}
                  mode="widthFix"
                />
                <Text>店铺</Text>
              </View>
              <View className="icon" onClick={this.goPage.bind(this, routes.shopcart, true)}>
                <Image
                  className="icon-image"
                  src={shopcartIcon}
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
                  src={contactIcon}
                  mode="widthFix"
                />
                <Text>客服</Text>
              </Button>
            </View>
            <View className="button-wrapper">
              <View className="add-card">
                <Button
                  className="button button-cart"
                  // full
                  type="primary"
                  onClick={this.showSelectSku.bind(this, 2)}
                >加入购物车</Button>
              </View>
              <View>
                <Button
                  className={classNames('button button-buynow')}
                  // full
                  type="primary"
                  onClick={this.showSelectSku.bind(this, 1)}
                >立即购买</Button>
              </View>
            </View>
          </View>
        </BottomBar>

        {/* 选配框 */}
        <AtFloatLayout className="sku-select" isOpened={isSkuFloatLayoutOpened} onClose={this.handleClose}>
          <SkuSelect
            productInfoProps={productInfo}
            selectSkuProps={selectSku}
            productId={this.productId}
            handleClose={this.handleClose}
            buttonType={buttonType}
            addCart={this.props.addCart}
          />
        </AtFloatLayout>
      </View>
    )
  }
}
