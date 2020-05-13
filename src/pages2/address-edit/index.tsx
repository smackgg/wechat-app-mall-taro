import React, { Component } from 'react'

import Taro, { Current } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { AtButton, AtInput, AtIndexes, AtDrawer, AtForm, AtMessage } from 'taro-ui'
import { getProvince, getNextRegion } from '@/redux/actions/config'
import { cError } from '@/utils'
// import { addWxFormId } from '@/services/wechat'
import { addAddress, updateAddress, deleteAddress } from '@/services/user'
import { UserState } from '@/redux/reducers/user'
import { ConfigState } from '@/redux/reducers/config'

import commonCityData from '@/third-utils/city'

import './index.scss'

interface AddressInfo {
  provinceId?: number | string
  cityId?: number | string
  districtId?: number | string
  linkMan?: string
  address?: string
  mobile?: number | string
  code?: number | string
  isDefault?: boolean
  id?: number | string
}

type PageStateProps = {
  provinces: ConfigState['provinces']
  citys: ConfigState['citys']
  districts: ConfigState['districts']
  addressList: UserState['addressList']
}

type PageDispatchProps = {
  getProvince: typeof getProvince
  getNextRegion: typeof getNextRegion
}

type PageOwnProps = {}

type PageState = {
  province: {
    id: string,
    name: string,
  },
  city: {
    id: string,
    name: string,
  },
  district: {
    id: string,
    name: string,
  },
  addressData?: AddressInfo,
  regionList: any[], // 字母索引选择器数据
  hideDistrict: boolean, // 是否隐藏街道选项
  showDrawer: boolean
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(({
  config: { provinces, citys, districts },
  user: { addressList },
}) => ({
  provinces,
  citys,
  districts,
  addressList,
}), (dispatch: any) => ({
  getProvince: () => dispatch(getProvince()),
  getNextRegion: (data: { key: string, pid: string }) => dispatch(getNextRegion(data)),
}))

export default class EditAddress extends Component<IProps, PageState> {
  state = {
    province: {
      id: '',
      name: '请选择省',
    },
    city: {
      id: '',
      name: '请选择市',
    },
    district: {
      id: '',
      name: '请选择区',
    },
    addressData: {
      linkMan: '',
      mobile: '',
      address: '',
      code: '',
      provinceId: '',
      cityId: '',
      districtId: '',
      isDefault: false,
      id: '',
    },
    regionList: [], // 字母索引选择器数据
    hideDistrict: false, // 是否隐藏街道选项
    showDrawer: false,
  }

  async componentWillMount() {
    // Taro.setNavigationBarColor({
    //   backgroundColor: theme['$color-brand'],
    //   frontColor: '#ffffff',
    // })

    // 拉取省级联
    this.props.getProvince()

    this.addressId = Current.router?.params?.id || ''

    let pageTitle = '新增收货地址'
    if (this.addressId) {
      pageTitle = '编辑收货地址'
      const { addressList } = this.props

      const addressDetail = addressList.filter(item => item.id === +this.addressId)[0]
      if (!addressDetail) {
        Taro.navigateBack()
        return
      }
      const {
        linkMan,
        mobile,
        address,
        code,
        provinceId,
        provinceStr,
        cityId,
        cityStr,
        districtId,
        areaStr,
      } = addressDetail
      const nextState = {
        addressData: {
          linkMan,
          mobile,
          address,
          code,
        },
        province: {
          id: provinceId,
          name: provinceStr,
        },
        city: {
          id: cityId,
          name: cityStr,
        },
        district: {
          id: districtId,
          name: areaStr,
        },
      }

      await this.handleAddressPickerData({
        province: nextState.province,
        city: nextState.city,
      })
      this.setState(nextState)
    }

    Taro.setNavigationBarTitle({
      title: pageTitle,
    })
  }

  addressId: string

  // 从微信导入数据
  readFromWx = () => {
    Taro.chooseAddress({
      success: async (res: any) => {
        const { provinceName, cityName, countyName, userName, telNumber, postalCode, detailInfo } = res
        // const provinceName = '北京市'
        // const cityName = '北京市'
        // const countyName = '海淀区'

        const nextState: any = {
          addressData: {
            linkMan: userName,
            mobile: telNumber,
            address: detailInfo,
            code: postalCode,
          },
        }

        let noCity = true
        let provinceIndex
        for (let i = 0; i < commonCityData.cityData.length; i++) {
          // 省
          if (provinceName === commonCityData.cityData[i].name) {
            const { name, id } = commonCityData.cityData[i]
            nextState.province = { name, id }
            provinceIndex = i
            // 市
            for (let j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
              if (cityName === commonCityData.cityData[i].cityList[j].name) {
                noCity = false
                const { name: cName, id: cId } = commonCityData.cityData[i].cityList[j]
                nextState.city = { name: cName, id: cId }
                // 区、县
                for (let k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
                  if (countyName == commonCityData.cityData[i].cityList[j].districtList[k].name) {
                    const { name: dName, id: dId } = commonCityData.cityData[i].cityList[j].districtList[k]
                    nextState.district = { name: dName, id: dId }
                  }
                }
              }
            }
          }
        }

        // 没有二级地址，那三级地址就是二级地址
        if (noCity && provinceIndex !== undefined) {
          for (let j = 0; j < commonCityData.cityData[provinceIndex].cityList.length; j++) {
            if (countyName === commonCityData.cityData[provinceIndex].cityList[j].name) {
              const { name: cName, id: cId } = commonCityData.cityData[provinceIndex].cityList[j]
              nextState.city = { name: cName, id: cId }
            }
          }
        }

        // 拉取服务器地址数据校准
        // 也处理用户此时继续点击下拉菜单没有数据的bug
        await this.onChooseRegion({
          key: 'province',
          id: nextState.province.id,
          name: provinceName,
        })

        if (nextState.city.id) {
          await this.onChooseRegion({
            key: 'city',
            id: nextState.city.id,
            name: cityName,
          })
        }
        await this.handleAddressPickerData({
          province: nextState.province,
          city: nextState.city,
        })

        this.setState(nextState)
      },
    })
  }

  // 处理回填、微信读取地址piker的初始化
  // 拉取服务器地址数据校准
  // 也处理用户此时继续点击下拉菜单没有数据的bug
  handleAddressPickerData = async (addressData: any) => {
    const { province, city } = addressData
    await this.onChooseRegion({
      key: 'province',
      id: province.id,
      name: province.name,
    })

    if (city.id) {
      await this.onChooseRegion({
        key: 'city',
        id: city.id,
        name: city.name,
      })
    }
  }
  // 处理表单变化
  handleFormChange = (name: string, value: any) => {
    if (!this.state.addressData) {
      return
    }

    this.setState({
      addressData: {
        ...this.state.addressData,
        [name]: value,
      },
    })
    return value
  }

  // 地址选择器处理事件
  onPickerClick = (type: 'province' | 'city' | 'district') => {
    const { province, city } = this.state
    const {
      provinces,
      citys,
      districts,
    } = this.props
    // let key = 'province'
    let regionList
    if (type === 'province') {
      regionList = provinces
    } else if (type === 'city') {
      // 用户点击城市，但是省没有选，弹出省选择器
      regionList = !province.id
        ? provinces
        : citys
    } else if (type === 'district') {
      if (!province.id) {
        regionList = provinces
      } else if (!city.id) {
        regionList = citys
      } else {
        regionList = districts
      }
    }
    this.setState({
      showDrawer: true,
      regionList,
    })
  }

  // 选择地址
  onChooseRegion = async (value: {
    key: 'province' | 'city',
    id: string,
    name: string,
  }) => {
    const nextState = {
      showDrawer: false,
      hideDistrict: false,
    }

    const { key } = value
    nextState[key] = {
      id: value.id,
      name: value.name
    }

    if (key === 'province') {
      await this.props.getNextRegion({
        pid: value.id,
        key: 'citys',
      })

      this.setState({
        ...nextState,
        city: {
          id: '',
          name: '请选择市',
        },
        district: {
          id: '',
          name: '请选择区',
        },
      })
    } else if (key === 'city') {
      const [error] = await cError(this.props.getNextRegion({
        pid: value.id,
        key: 'districts',
      }))

      if (error && error.code === 700) {
        nextState.hideDistrict = true
      }
      this.setState({
        ...nextState,
        district: {
          id: '',
          name: '请选择区',
        },
      })
    } else if (key === 'district') {
      this.setState(nextState)
    }
  }

  // 表单提交
  onSubmit = async (e: TaroBaseEventOrig) => {
    // addWxFormId({
    //   type: 'form',
    //   formId: e.detail.formId,
    // })

    const {
      addressData: {
        linkMan,
        mobile,
        address,
        code,
      },
      province,
      city,
      district,
      hideDistrict,
    } = this.state

    // 报错拦截
    if (!linkMan) {
      return this.atMessageError('请填写姓名')
    }
    if (!mobile) {
      return this.atMessageError('请填写手机号码')
    }
    if (!province.id) {
      return this.atMessageError('请选择省份')
    }
    if (!city.id) {
      return this.atMessageError('请选择城市')
    }
    if (!district.id && !hideDistrict) {
      return this.atMessageError('请选择区县')
    }
    if (!address) {
      return this.atMessageError('请填写详细地址')
    }
    if (!code) {
      return this.atMessageError('请填写邮政编码')
    }

    const addressData = {
      provinceId: province.id,
      cityId: city.id,
      districtId: district.id || '',
      linkMan,
      address,
      mobile,
      code,
      isDefault: true,
    }
    // 添加地址
    Taro.showLoading({
      title: '加载中',
    })
    let error

    if (this.addressId) {
      // 编辑地址
      [error] = await cError(updateAddress({
        ...addressData,
        id: this.addressId,
      }))
    } else {
      // 添加地址
      [error] = await cError(addAddress(addressData))
    }
    Taro.hideLoading()
    if (error) {
      Taro.showModal({
        title: '失败',
        content: error.msg,
      })
      return
    }
    // 跳转到之前的页面
    Taro.navigateBack()
  }

  // 报错信息
  atMessageError = (message: string) => {
    Taro.atMessage({
      message,
      type: 'error',
    })
  }

  // 删除地址
  deleteAddress = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: async res => {
        if (res.confirm) {
          await deleteAddress({ id: this.addressId })
          Taro.navigateBack()
        }
      },
    })
  }

  // 取消
  onCancel = () => {
    Taro.navigateBack()
  }

  // 关闭右边栏
  onCloseDrawer = () => {
    this.setState({
      showDrawer: false,
    })
  }

  render() {

    const {
      addressData: {
        linkMan,
        mobile,
        address,
        code,
      },
      province,
      city,
      district,
      regionList,
      showDrawer,
      hideDistrict,
    } = this.state

    return (
      <View>
        <AtMessage />
        <AtForm reportSubmit onSubmit={this.onSubmit} className="container">
          <View className="form">
            <AtInput
              name="linkMan"
              title="联系人"
              type="text"
              placeholder="姓名"
              value={linkMan}
              onChange={this.handleFormChange.bind(this, 'linkMan')}
            />
            <AtInput
              name="mobile"
              title="手机号码"
              type="number"
              placeholder="请填写11位手机号码"
              value={mobile}
              maxLength={11}
              onChange={this.handleFormChange.bind(this, 'mobile')}
            />
            <View className="address-picker">
              <Text className="label">选择地区</Text>
              <View className={classNames('picker', { gray: province.name === '请选择省' })} onClick={this.onPickerClick.bind(this, 'province')}>
                {province.name}
              </View>
              <View className={classNames('picker', { gray: city.name === '请选择市' })} onClick={this.onPickerClick.bind(this, 'city')}>
                {city.name}
              </View>
              {!hideDistrict && <View className={classNames('picker', { gray: district.name === '请选择区' })} onClick={this.onPickerClick.bind(this, 'district')}>
                {district.name}
              </View>}
            </View>
            <AtInput
              name="address"
              title="详细地址"
              type="text"
              placeholder="街道门牌信息"
              value={address}
              onChange={this.handleFormChange.bind(this, 'address')}
            />
            <AtInput
              name="code"
              title="邮政编码"
              type="number"
              placeholder="邮政编码"
              value={code}
              onChange={this.handleFormChange.bind(this, 'code')}
            />
          </View>
          <View className="buttons">
            <AtButton className="button" type="primary" formType="submit">保存</AtButton>
            {!this.addressId && <AtButton className="button wx" type="primary" onClick={this.readFromWx}>从微信导入</AtButton>}
            {this.addressId && <AtButton className="button" type="secondary" onClick={this.deleteAddress}>删除地址</AtButton>}
            <AtButton className="button" onClick={this.onCancel}>取消</AtButton>
          </View>
          <AtDrawer
            show={showDrawer}
            width="90vw"
            mask
            right
            onClose={this.onCloseDrawer}
          >
            <View className="region-indexes">
              <AtIndexes
                animation
                list={regionList}
                onClick={this.onChooseRegion}
              >
                <View className="region-indexes_title">请选择地址</View>
              </AtIndexes>
            </View>
          </AtDrawer>
        </AtForm>
      </View>
    )
  }
}
