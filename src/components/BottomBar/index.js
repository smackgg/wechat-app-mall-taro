import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import PropTypes from 'prop-types'

import './index.scss'

export default class BottomBar extends Component {
  static propTypes = {
    children: PropTypes.any,
  }

  state = {
    isIphoneX: false,
  }

  componentWillMount() {
    Taro.getSystemInfo({
      success: res => {
        // console.log('手机信息res'+res.model)
        let modelmes = res.model
        if (modelmes.search('iPhone X') != -1) {
           this.setState({
             isIphoneX: true,
           })
        }
      },
    })
  }

  render() {
    const { isIphoneX } = this.state
    let style = {}
    if (isIphoneX) {
      style = {
        height: '130rpx',
        paddingBottom: '30rpx',
      }
    }
    return <View className="bottom-bar" style={style}>
      {this.props.children}
    </View>
  }
}
