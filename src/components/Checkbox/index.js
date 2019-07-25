import Taro from '@tarojs/taro'
import PropTypes from 'prop-types'
import { View } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import classNames from 'classnames'

import './index.scss'

export default function Checkbox(props) {
  const { checked, onChange } = props

  const onClick = () => {
    onChange && onChange(!checked)
  }

  return <View className={classNames('check-box', { checked })} onClick={onClick}>
    <AtIcon value="check" size="14" color="#fff"></AtIcon>
  </View>
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
}
