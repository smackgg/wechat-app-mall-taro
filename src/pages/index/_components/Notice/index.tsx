import React, { PureComponent } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtNoticebar, AtCurtain } from 'taro-ui'
import { updateTimerFlags } from '@/redux/actions/config'
import { connect } from 'react-redux'
import { ConfigState } from '@/redux/reducers/config'
import './index.scss'

type Props = {
  notice: ConfigState['notice'],
  timerFlags: ConfigState['timerFlags']
  updateTimerFlags: typeof updateTimerFlags
}

type State = {
  isOpened: boolean
}

@connect(({ config }) => ({
  timerFlags: config.timerFlags
}), dispatch => ({
  updateTimerFlags: data => dispatch(updateTimerFlags(data)),
}))

export default class Notice extends PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      isOpened: false,
    }
  }

  componentDidMount() {
    const { notice: { type }, timerFlags } = this.props
    if (!timerFlags.homeNoticePopup && type === 'popup') {
      setTimeout(() => {
        this.setState({
          isOpened: true,
        })
        this.props.updateTimerFlags({
          homeNoticePopup: true,
        })
      }, 1500)
    }
  }

  onClick = () => {
    const { notice: { redirectUrl, type } } = this.props
    if (type === 'popup') {
      this.setState({
        isOpened: true,
      })
    }
    if (redirectUrl) {
      // redirectUrl
      Taro.navigateTo({
        url: redirectUrl,
      })
    }
  }


  onClose = () => {
    this.setState({
      isOpened: false,
    })
  }

  render() {
    const { notice: { title, redirectUrl, type, content } } = this.props
    const { isOpened } = this.state

    /* 通知条 */
    return <View className="notice-bar">
      <View onClick={this.onClick}>
        <AtNoticebar speed={30} icon="volume-plus" marquee>
          {(redirectUrl || type === 'popup') && <Text>[点击查看] </Text>}{title}
        </AtNoticebar>
      </View>
      {
        type === 'popup' && isOpened && <AtCurtain
          isOpened={isOpened}
          onClose={this.onClose}
        >
          <View className="html-parse-content">
            {/* <WxParse html={productInfo.content} /> */}
            <wxparse html={content} />
          </View>
        </AtCurtain>
      }
    </View>
  }
}
