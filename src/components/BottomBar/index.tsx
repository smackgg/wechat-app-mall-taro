import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import PropTypes from 'prop-types'

import './index.scss'

type Props = {
}

type State = {
  isIphoneX: boolean,
}

export default class BottomBar extends Component<Props, State> {
  static propTypes = {
    children: PropTypes.node,
  }

  state = {
    isIphoneX: false,
  }

  componentWillMount() {
    Taro.getSystemInfo({
      success: (res: any) => {
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
    return <View className="component__bottom-bar" style={style}>
      {this.props.children}
    </View>
  }
}
