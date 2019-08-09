import Taro, { Component } from '@tarojs/taro'
import { View, Image, Video, Swiper, SwiperItem, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getBanners } from '@/redux/actions/config'
import { getProducts } from '@/redux/actions/goods'
import classNames from 'classnames'
import { Price } from '@/components'
import { setCartBadge } from '@/utils'
import { AtIcon } from 'taro-ui'

import './index.scss'

// 首页多加滤镜
@connect(({ config, goods: { products } }) => ({
  banners: config.banners['index'],
  systemConfig: config.systemConfig,
  recommendProducts: products.homeRecommendProducts,
  allProducts: products.allProducts,
}), dispatch => ({
  getBanners: type => dispatch(getBanners(type)),
  getProducts: data => dispatch(getProducts(data)),
}))

class Index extends Component {
  config = {
    navigationBarTitleText: '首页',
    navigationStyle: 'custom',
  }

  state = {
    swiperIndex: 0,
    playVideo: false,
    statusBarHeight: 0,
  }

  componentWillMount() {
    setCartBadge()
    const { statusBarHeight } = Taro.getSystemInfoSync()
    this.setState({
      statusBarHeight,
    })
  }

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

  // 监听轮播图变化
  onSwiperChange = e => {
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
      videoContext.requestFullScreen()
    })
  }

  // 视频全屏事件
  onFullScreenChange = e => {
    if (!e.detail.fullScreen) {
      this.setState({
        playVideo: false,
      })
    }
  }

  // banner 点击
  onBannerClick = item => {
    const { linkUrl } = item

    // 项目内跳转
    if (/^\/pages\//.test(linkUrl)) {
      Taro.navigateTo({
        url: linkUrl,
      })
    }
    // 公众号跳转
    if (/^http/.test(linkUrl)) {
      Taro.navigateTo({
        url: `/pages/webview/index?url=${encodeURIComponent(linkUrl)}`,
      })
    }
  }

  // 返回首页
  goHome = () => {
    Taro.redirectTo({
      url: '/pages/entry/index',
    })
  }

  render () {
    const { banners = [], recommendProducts, allProducts, systemConfig } = this.props
    const { swiperIndex, playVideo, statusBarHeight } = this.state

    const videoUrl = systemConfig.index_video_1
    const videoUrl2 = systemConfig.index_video_2
    return (
      <View className="index">
        <View
          className="go-home"
          style={{
            paddingTop: `${statusBarHeight * 2}rpx`,
          }}
          onClick={this.goHome}
        >
          <AtIcon value="chevron-left" size="20" color="#fff"></AtIcon>
          <Text>首页</Text>
        </View>
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
          </SwiperItem>) }
        </Swiper>
        {/* 轮播图 dots */}
        <View className="indicator-dots">
          {banners.map((item, index) => <View className={classNames('indicator-dot', {
            active: swiperIndex === index,
          })} key={item.id}
          ></View>)}
        </View>

        {/* 精品推荐商品块 */}
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
                    <Price price={minPrice} score={minScore}></Price>
                  </View>
                })
              }
            </View>
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
                    <View class="mask">
                      <View class="play-button"></View>
                    </View>
                  </Video>
                </View>
                {playVideo && <Video
                  src={videoUrl2}
                  loop
                  autoplay
                  object-fit="fill"
                  id="playVideo"
                  onFullScreenChange={this.onFullScreenChange}
                >
                </Video>}
              </View>
            }
          </View>
        }

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

export default Index
