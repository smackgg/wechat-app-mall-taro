import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Image, Text, Swiper, SwiperItem, Button } from '@tarojs/components'
import { AtFloatLayout } from 'taro-ui'
import { getProductDetail, getReputation } from '@/redux/actions/goods'
import WxParse from '@/third-utils/wxParse/wxParse'
import { productPrice } from '@/services/goods'
import { BottomBar } from '@/components'
import classNames from 'classnames'
import { addCart } from '@/redux/actions/user'
import { ProductDetail as ProductDetailType, Product, Properties, Reputation } from '@/redux/reducers/goods'
import { ProductPrice, SkuSelect, ReputationCard } from './_components'

import './index.scss'

type ProductInfo = {
  number: number | string
  goodsId: string
  propertyChildIds: string
  active?: boolean
}
type AddCartParams = {
  type: string
  productInfo: ProductInfo
}

type PageStateProps = {
  productDetail: { [key: string]: ProductDetailType }
  reputations: { [key: string]: Reputation[] }
  shopCartInfo: any
}

type PageDispatchProps = {
  getProductDetail: (data: { id: string }) => void
  getReputation: (data: { goodsId: string }) => void
  addCart: (data: AddCartParams) => void
}

type PageOwnProps = {}

type PageState = {
  productInfo?: ProductDetailType,
  isSkuFloatLayoutOpened: boolean,
  selectSku?: Product,
  buttonType: 1 | 2, // 1: 立即购买 2: 加入购物车
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface ProductDetail {
  props: IProps
}

@connect(
  ({ goods, user: { shopCartInfo } }) => ({
    productDetail: goods.productDetail,
    reputations: goods.reputations,
    shopCartInfo,
  }),
  (dispatch: any) => ({
    getProductDetail: (data: { id: string }) => dispatch(getProductDetail(data)),
    getReputation: (data: { goodsId: string }) => dispatch(getReputation(data)),
    addCart: (data: AddCartParams) => dispatch(addCart(data)),
    // updateCart: data => dispatch(updateCart(data)),
  }),
)

class ProductDetail extends Component {
  productId: string = ''
  curuid: string = ''

  config: Config = {
    navigationBarTitleText: '',
  }

  state: PageState = {
    productInfo: undefined,
    isSkuFloatLayoutOpened: false,
    selectSku: undefined,
    buttonType: 1, // 1: 立即购买 2: 加入购物车
  }

  componentWillMount() {
    // 获取页面商品id
    let { id, scene } = this.$router.params
    this.productId = id

    // 处理扫码进商品详情页面的逻辑
    if (scene) {
      scene = decodeURIComponent('' + scene)
      const [productId, referrer] = scene.split(',')
      this.productId = productId
      Taro.setStorageSync('referrer', referrer)
    }
  }

  async componentDidShow() {
    // 获取商品详情数据
    await this.props.getProductDetail({
      id: this.productId,
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
    Taro.switchTab({ url: '/pages/index/index' })
  }

  onShareAppMessage = () => {
    if (!this.state.productInfo) {
      return {
        title: '分享商品',
        path: `/pages/product-detail/index?id=${this.productId}&inviter_id=${Taro.getStorageSync('uid')}`,
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
      selectSku = {},
      buttonType,
    } = this.state

    // 商品详情页数据未拉取
    if (!productInfo || Object.keys(selectSku).length === 0) {
      return null
    }

    const {
      pics,
      basicInfo: {
        tags,
      },
      basicInfo,
      logistics,
      extJson,
    } = productInfo

    const services = extJson.service
      ? extJson.service.split(' ')
      : null

    // 是否为预订
    const isReserve = !!(tags && tags.includes('在线定位'))

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
        <ProductPrice basicInfo={basicInfo} logistics={logistics} productId={this.productId} isReserve={isReserve}></ProductPrice>

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
            {reputationLength > 3 && <View className="more-reputations" onClick={() => this.goPage(`/pages/product-detail/reputations?id=${this.productId}`)}>查看更多</View>}
          </View>
        }

        {/* 商品详情 */}
        <import src="../../third-utils/wxParse/wxParse.wxml" />
        <View className="product-content">
          <View className="title-line">商品详情</View>
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
                {!isReserve && <Button
                  className="button button-cart"
                  // full
                  type="primary"
                  onClick={this.showSelectSku.bind(this, 2)}
                >加入购物车</Button>}
              </View>
              <View>
                <Button
                  className={classNames('button button-buynow', {
                    'is-reserve': isReserve,
                  })}
                  // full
                  type="primary"
                  onClick={this.showSelectSku.bind(this, 1)}
                >{isReserve ? '立即预订' : '立即购买'}</Button>
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
            isReserve={isReserve}
          />
        </AtFloatLayout>
      </View>
    )
  }
}


export default ProductDetail as ComponentClass<PageOwnProps, PageState>
