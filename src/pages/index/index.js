import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getBanners } from '@/redux/actions/config'

import './index.scss'

// 首页多加滤镜
@connect(({ counter }) => ({
  counter,
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
    return (
      <View className="index">
        <Button className="add_btn" onClick={this.props.add}>+</Button>
        <Button className="dec_btn" onClick={this.props.dec}>-</Button>
        <Button className="dec_btn" onClick={this.props.asyncAdd}>async</Button>
        <View><Text>{this.props.counter.num}</Text></View>
        <View><Text>Hello, World</Text></View>
      </View>
    )
  }
}

export default Index
