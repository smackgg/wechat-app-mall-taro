import React, { Component } from 'react'

import Taro, { Current } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { connect } from 'react-redux'
import { getAddressList } from '@/redux/actions/user'
import { config } from '@/utils'
import { AtButton, AtIcon } from 'taro-ui'
import { updateAddress } from '@/services/user'

import { BottomBar } from '@/components'
import { UserState } from '@/redux/reducers/user'
import { routes } from '@/utils/router'

import './index.scss'

const { theme } = config

type PageProps = {
  addressList: UserState['addressList']
  getAddressList: typeof getAddressList
}

type PageState = {
}

// 首页多加滤镜
@connect(({ user: { addressList } }) => ({
  addressList,
}), (dispatch: any) => ({
  getAddressList: () => dispatch(getAddressList()),
}))

export default class SelectAddress extends Component<PageProps, PageState> {
  componentWillMount() {
    this.type = +(Current.router?.params?.type || 0)

    Taro.setNavigationBarTitle({
      title: this.type === 0 ? '选择收货地址' : '设置默认地址',
    })
  }

  type: number

  componentDidShow() {
    this.props.getAddressList()
  }


  // 编辑地址
  editAddress = (id: number, e: TaroBaseEventOrig) => {
    e.stopPropagation()
    Taro.navigateTo({
      url: `${routes.addressEdit}?id=${id}`,
    })
  }

  // 新建地址
  addAddress = async () => {
    Taro.navigateTo({
      url: routes.addressEdit,
    })
  }

  // 用户选择地址
  onChooseAddres = async (id: number) => {
    await updateAddress({
      id,
      isDefault: true,
    })
    if (this.type === 0) {
      Taro.navigateBack()
    } else {
      Taro.showToast({
        title: '设置成功',
        icon: 'success',
      })
      this.props.getAddressList()
    }
  }

  render() {
    const { addressList } = this.props
    return (
      <View className="container">
        <View className="address-list">
          {
            addressList.map(addressItem => {
              const { linkMan, mobile, provinceStr, cityStr, address, areaStr, id, isDefault } = addressItem
              return <View key={id} className="address-item" onClick={this.onChooseAddres.bind(this, id)}>
                <View className="check-icon">
                  {isDefault && <AtIcon value="check" size="18" color={theme['$color-brand']}></AtIcon>}
                </View>
                <View className="info">
                  <View>
                    <Text className="name">{linkMan}</Text>
                    <Text>{mobile}</Text>
                  </View>
                  <View className="detail">{provinceStr}{cityStr}{areaStr === '-' ? '' : areaStr}{address}</View>
                </View>
                <View className="edit-button" onClick={this.editAddress.bind(this, id)}>
                  <AtIcon value="edit" size="18" color={theme['$color-brand']}></AtIcon>
                </View>
              </View>
            })
          }
        </View>
        <BottomBar>
          <AtButton onClick={this.addAddress} type="primary">新建地址</AtButton>
        </BottomBar>
      </View>
    )
  }
}
