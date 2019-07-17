import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { getAddressList } from '@/redux/actions/user'
import { theme } from '@/utils'
import { AtButton, AtIcon, AtForm } from 'taro-ui'
import { updateAddress } from '@/services/user'
import { addWxFormId } from '@/services/wechat'
import './index.scss'

// 首页多加滤镜
@connect(({ user: { addressList } }) => ({
  addressList,
}), dispatch => ({
    getAddressList: () => dispatch(getAddressList()),
}))

export default class SelectAddress extends Component {
  config = {
    navigationBarTitleText: '选择收货地址',
  }

  componentDidShow() {
    this.props.getAddressList()
  }

  componentWillMount() {
    // 设置bar颜色
    Taro.setNavigationBarColor({
      backgroundColor: theme['$color-brand'],
      frontColor: '#ffffff',
    })
  }

  // 编辑地址
  editAddress = (id, e) => {
    e.stopPropagation()
    Taro.navigateTo({
      url: `/pages/edit-address/index?id=${id}`,
    })
  }

  // 新建地址
  addAddress = async e => {
    await addWxFormId({
      type: 'form',
      formId: e.detail.formId,
    })
    Taro.navigateTo({
      url: '/pages/edit-address/index',
    })
  }

  // 用户选择地址
  onChooseAddres = async id => {
    await updateAddress({
      id,
      isDefault: true,
    })
    Taro.navigateBack()
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
        <AtForm className="add-address" onSubmit={this.addAddress}>
          <AtButton type="primary" formType="submit">新建地址</AtButton>
        </AtForm>
      </View>
    )
  }
}

