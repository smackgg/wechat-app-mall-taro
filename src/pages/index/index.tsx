import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Image, Video, Swiper, SwiperItem } from '@tarojs/components'

import { getBanners } from '@/redux/actions/config'
import { getProducts } from '@/redux/actions/goods'
import classNames from 'classnames'
import { Price } from '@/components'
import { setCartBadge } from '@/utils'
import { routes } from '@/utils/router'
import './index.scss'

// import { add, minus, asyncAdd } from '../../redux/actions/counter'


// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

type PageProps = {
  banners: any[]
  systemConfig: { [key: string]: string }
  recommendProducts: []
  allProducts: []
  products: { [key: string]: any }
  getBanners: typeof getBanners
  getProducts: typeof getProducts
}

type PageState = {
  swiperIndex: number
  playVideo: boolean
}

@connect(({ config, goods: { products } }) => ({
  products,
  banners: config.banners['index'],
  systemConfig: config.systemConfig,
  recommendProducts: products.homeRecommendProducts,
  allProducts: products.allProducts,
}), dispatch => ({
  getBanners: data => dispatch(getBanners(data)),
  getProducts: data => dispatch(getProducts(data)),
}))

export default class Index extends Component<PageProps, PageState> {
  state = {
    swiperIndex: 0,
    playVideo: false,
  }

  componentWillMount() {
    setCartBadge()
  }

  orderCategoryId: string

  componentDidShow() {
    // 展示启动页
    this.props.getBanners({
      type: 'index',
    })

    // 加载首页推荐商品
    this.props.getProducts({
      key: 'homeRecommendProducts',
      recommendStatus: 1,
    })

    // 展示发现更多商品块
    this.props.getProducts({
      key: 'allProducts',
      page: 1,
      pageSize: 10,
    })
  }

  // 跳转商品详情页
  goToProductDetail = (id: string) => {
    Taro.navigateTo({
      url: `${routes.productDetail}?id=${id}`,
    })
  }

  // 监听轮播图变化
  onSwiperChange = (e: TaroBaseEventOrig) => {
    this.setState({
      swiperIndex: e.detail.current,
    })
  }

  // 播放视频
  playVideo = () => {
    this.setState({
      playVideo: true,
    }, () => {
      const videoContext = Taro.createVideoContext('playVideo')
      videoContext.requestFullScreen({ direction: 0 })
    })
  }

  // 视频全屏事件
  onFullScreenChange = (e: TaroBaseEventOrig) => {
    if (!e.detail.fullScreen) {
      this.setState({
        playVideo: false,
      })
    }
  }

  // banner 点击
  onBannerClick = (item: { linkUrl: string }) => {
    const { linkUrl } = item

    // 项目内跳转
    if (/^\/pages\//.test(linkUrl)) {
      Taro.navigateTo({
        url: linkUrl,
      })
    }
    // // 公众号跳转
    // if (/^http/.test(linkUrl)) {
    //   Taro.navigateTo({
    //     url: `/pages/webview/index?url=${encodeURIComponent(linkUrl)}`,
    //   })
    // }
  }

  // 返回首页
  goHome = () => {
    Taro.redirectTo({
      url: routes.index,
    })
  }

  render() {
    const {
      banners = [],
      recommendProducts,
      allProducts,
      systemConfig: {
        index_video_1: videoUrl,
        index_video_2: videoUrl2,
      },
    } = this.props
    const { swiperIndex, playVideo } = this.state

    return (
      <View className="index">
        {/* banner */}
        <Swiper
          className="swiper"
          circular
          indicatorDots={false}
          autoplay
          onChange={this.onSwiperChange}
        >
          {banners.map(item => <SwiperItem className="swiper-item" key={item.id} onClick={this.onBannerClick.bind(this, item)}>
            <Image showMenuByLongpress className="swiper-item_image" src={item.picUrl} mode="aspectFill" />
          </SwiperItem>)}
        </Swiper>
        {/* 轮播图 dots */}
        <View className="indicator-dots">
          {banners.map((item, index) => <View className={classNames('indicator-dot', {
            active: swiperIndex === index,
          })} key={item.id}
          ></View>)}
        </View>
        <View className="recommend-products">
          {/* 精品推荐商品块 */}
          {
            recommendProducts && recommendProducts.length > 0 && <View>
              <View className="title title-line">精品推荐</View>
              <View className="list">
                {
                  recommendProducts.map(product => {
                    const { id, pic, name, characteristic, minPrice, minScore } = product
                    return <View key={id} onClick={this.goToProductDetail.bind(this, id)}>
                      <Image className="product-image" src={pic} mode="aspectFill"></Image>
                      <View className="name clamp">{name}</View>
                      <View className="characteristic clamp">{characteristic}</View>
                      <Price price={minPrice} score={minScore}></Price>
                    </View>
                  })
                }
              </View>
            </View>
          }
          {/* 店内环境 */}
          {
            videoUrl && <View onClick={this.playVideo}>
              <View className="title title-line">店内环境</View>
              <View className="video-wrapper">
                <Video
                  src={videoUrl}
                  loop
                  autoplay
                  muted
                  controls={false}
                  object-fit="fill"
                >
                  <View className="mask">
                    <View className="play-button"></View>
                  </View>
                </Video>
              </View>
              {playVideo && <Video
                src={videoUrl2}
                loop
                autoplay
                objectFit="fill"
                id="playVideo"
                onFullscreenChange={this.onFullScreenChange}
              >
              </Video>}
            </View>
          }
        </View>

        {/* 发现更多商品块 */}
        {
          allProducts && allProducts.length > 0 && <View className="all-products">
            <View className="title title-line">发现更多</View>
            <View className="list">{
              allProducts.map(product => {
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
