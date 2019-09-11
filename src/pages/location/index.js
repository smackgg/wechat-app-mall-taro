import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'

import './index.scss'


export default class Location extends Component {
  config = {
    navigationBarTitleText: '本店位置',
  }

  componentDidMount() {
    Taro.openLocation({
      latitude: 45.753295,
      longitude: 126.588948,
      name: '后生家私人会所',
      address: '哈尔滨市道里区河鼓三道街183号 后生家私人会所',
    })
  }
  render() {
    return <View></View>
  }
}

