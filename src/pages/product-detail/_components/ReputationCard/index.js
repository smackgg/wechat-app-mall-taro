import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { AtRate } from 'taro-ui'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import './index.scss'

export default class ReputationCard extends Component {
  static options = {
    addGlobalClass: true,
  }

  static propTypes = {
    reputation: PropTypes.object,
    showAllRemark: PropTypes.bool,
  }

  static defaultProps = {
    basicreputationInfo: {},
    showAllRemark: false,
  }

  render() {
    const { showAllRemark, reputation } = this.props
    if (!reputation) {
      return null
    }
    const { goods: { dateReputation, goodReputation, goodReputationStr, goodReputationRemark }, user: { avatarUrl } } = reputation

    return <View className="reputation">
      <View className="reputation__info">
        <View className="avatar-block">
          <Image className="avatar" src={avatarUrl} mode="aspectFill"></Image>
        </View>

        <View className="rate-block">
          <AtRate max={3} size="24" value={goodReputation + 1} />
          <View className="str">{goodReputationStr}</View>
          <View className="date">
            {dateReputation.split(' ')[0]}
          </View>
        </View>
      </View>
      <View className={classNames('reputation__remark', {
        'clamp-3': !showAllRemark,
      })}>
        {goodReputationRemark}
        {/* {Array(100).fill(1).map(() => '测试')} */}
      </View>
    </View>
  }
}
