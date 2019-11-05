import { ComponentClass } from 'react'

import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { getAddressList } from '@/redux/actions/user'
import { theme } from '@/utils'
import { AtButton, AtIcon, AtForm } from 'taro-ui'
import { updateAddress } from '@/services/user'
import { addWxFormId } from '@/services/wechat'
import { BottomBar } from '@/components'
import { Address } from '@/redux/reducers/user'
import './index.scss'


type PageStateProps = {
  addressList: Address[]
}

type PageDispatchProps = {
  getAddressList: () => void
}

type PageOwnProps = {}

type PageState = {
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface SelectAddress {
  props: IProps
}

// 首页多加滤镜
@connect(({ user: { addressList } }) => ({
  addressList,
}), (dispatch: any) => ({
    getAddressList: () => dispatch(getAddressList()),
}))

class SelectAddress extends Component {
  type: number

  config: Config = {
    navigationBarTitleText: '选择收货地址',
  }

  componentDidShow() {
    this.props.getAddressList()
  }

  componentWillMount() {
    const { type = 0 } = this.$router.params
    this.type = +type

    Taro.setNavigationBarTitle({
      title: this.type === 0 ? '选择收货地址' : '设置默认地址',
    })
  }

  // 编辑地址
  editAddress = (id: number, e: TaroBaseEventOrig) => {
    e.stopPropagation()
    Taro.navigateTo({
      url: `/pages/edit-address/index?id=${id}`,
    })
  }

  // 新建地址
  addAddress = async (e: TaroBaseEventOrig) => {
    await addWxFormId({
      type: 'form',
      formId: e.detail.formId,
    })
    Taro.navigateTo({
      url: '/pages/edit-address/index',
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
          <AtForm reportSubmit onSubmit={this.addAddress}>
            <AtButton type="primary" formType="submit">新建地址</AtButton>
          </AtForm>
        </BottomBar>
      </View>
    )
  }
}

export default SelectAddress as ComponentClass<PageOwnProps, PageState>
