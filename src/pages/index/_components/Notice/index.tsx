import React, { PureComponent } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtNoticebar } from 'taro-ui'
import './index.scss'

type Props = {
  notice
}

export default class Notice extends PureComponent<Props> {
  onClick = () => {
    const redirectUrl = this.props.notice.redirectUrl
    if (redirectUrl) {
      // redirectUrl
      Taro.navigateTo({
        url: redirectUrl,
      })
    }
  }
  render() {
    const { notice: { title, redirectUrl } } = this.props

    /* 通知条 */
    return <View className="notice-bar" onClick={this.onClick}>
      <AtNoticebar speed={30} icon="volume-plus" marquee>
        {redirectUrl && <Text>[点击查看] </Text>}{title}
      </AtNoticebar>
    </View>
  }
}
