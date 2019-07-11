import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getBanners } from '@/redux/actions/config'

import './index.scss'

// 首页多加滤镜
@connect(({ config }) => ({
  banners: config.banners['index'],
}), dispatch => ({
  getBanners: type => dispatch(getBanners(type)),
}))

class Index extends Component {
  config = {
    navigationBarTitleText: '首页',
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () {
    // 展示启动页
    this.props.getBanners('index')

    // .then(function (res) {
    //   if (res.code == 700) {
    //     wx.switchTab({
    //       url: '/pages/index/index',
    //     });
    //   } else {
    //     _this.setData({
    //       banners: res.data,
    //       swiperMaxNumber: res.data.length
    //     });
    //   }
    // }).catch(function (e) {
    //   wx.switchTab({
    //     url: '/pages/index/index',
    //   });
    // })
  }

  componentDidHide () { }

  render () {
    const { banners } = this.props

    return (
      <View className="index">
        <Swiper
          className="swiper"
          // indicatorColor="#999"
          // indicatorActiveColor="#333"
          circular
          indicatorDots
          autoplay
        >
          {banners.map((item, index) => <SwiperItem className="swiper-item" key={index}>
            <Image className="swiper-item_image" src={item.picUrl} />
          </SwiperItem>) }
        </Swiper>
        <View><Text>Hello, World</Text></View>
      </View>
    )
  }
}

export default Index
