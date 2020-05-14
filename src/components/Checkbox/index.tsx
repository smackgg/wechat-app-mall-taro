import React from 'react'
import PropTypes from 'prop-types'
import { View } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import classNames from 'classnames'

import './index.scss'

type Props = {
  checked: boolean,
  onChange?: (checked: boolean) => void
}

export default function Checkbox(props: Props) {
  const { checked, onChange } = props

  const onClick = () => {
    onChange && onChange(!checked)
  }

  return <View className={classNames('component__check-box', { checked })} onClick={onClick}>
    <AtIcon value="check" size="14" color="#fff"></AtIcon>
  </View>
}

Checkbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func,
}
