import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import classNames from 'classnames'
import { AtButton, AtInput, AtIndexes, AtDrawer, AtForm, AtMessage } from 'taro-ui'
import { getProvince, getNextRegion } from '@/redux/actions/config'
import { cError } from '@/utils'
import { addWxFormId } from '@/services/wechat'
import { addAddress, updateAddress } from '@/services/user'
import './index.scss'

@connect(({ config: { provinces, citys, districts } }) => ({
  provinces,
  citys,
  districts,
}), dispatch => ({
    getProvince: () => dispatch(getProvince()),
    getNextRegion: data => dispatch(getNextRegion(data)),
}))

class AddAddress extends Component {
  config = {
    navigationBarTitleText: '新增收货地址',
  }

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
    addressData: {},
    regionList: [], // 字母索引选择器数据
    hideDistrict: false, // 是否隐藏街道选项
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount() { }

  async componentWillMount() {
    this.type = this.$router.params.type || 'add'
    await this.props.getProvince()
    this.setState({
      regionList: this.props.provincesIndexs,
    })

    this.props.getNextRegion({
      pid: 110000,
      key: 'city',
    })
    this.props.getNextRegion({
      pid: 130000,
      key: 'city',
    })
  }

  readFromWx = () => {
    // Taro.chooseAddress({
    //   success: res => {
    //     const { provinceName, cityName, countyName } = res
    //     console.log(provinceName, cityName, countyName)
    //     // return;
    //     // for (let i = 0; i < commonCityData.cityData.length; i++) {
    //     //   if (provinceName == commonCityData.cityData[i].name) {
    //     //     let eventJ = { detail: { value: i } };
    //     //     that.bindPickerProvinceChange(eventJ);
    //     //     that.data.selProvinceIndex = i;
    //     //     for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
    //     //       if (cityName == commonCityData.cityData[i].cityList[j].name) {
    //     //         //that.data.selCityIndex = j;
    //     //         eventJ = { detail: { value: j } };
    //     //         that.bindPickerCityChange(eventJ);
    //     //         for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
    //     //           if (diatrictName == commonCityData.cityData[i].cityList[j].districtList[k].name) {
    //     //             //that.data.selDistrictIndex = k;
    //     //             eventJ = { detail: { value: k } };
    //     //             that.bindPickerChange(eventJ);
    //     //           }
    //     //         }
    //     //       }
    //     //     }
    //     //   }
    //     }

    //     // that.setData({
    //     //   wxaddress: res,
    //     // });
    //   }
    // })
  }

  // 处理表单变化
  handleFormChange = (name, value) => {
    console.log(name)
    this.setState({
      addressData: {
        ...this.state.addressData,
        [name]: value,
      },
    })
    return value
  }

  onAddressPickerChange = value => {
    this.setState({
      [value.key]: value,
    })
  }

  // 地址选择器处理事件
  onPickerClick = type => {
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
  onChooseRegion = async value => {
    const { key } = value
    const nextState = {
      [value.key]: value,
      showDrawer: false,
      hideDistrict: false,
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
  onSubmit = async e => {
    addWxFormId({
      type: 'form',
      formId: e.detail.formId,
    })

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

    if (this.type === 'add') {
      // 添加地址
      Taro.showLoading({
        title: '加载中',
      })
      const [error] = await cError(addAddress({
        provinceId: province.id,
        cityId: city.id,
        districtId: district.id || '',
        linkMan,
        address,
        mobile,
        code,
        isDefault: true,
      }))
      Taro.hideLoading()
      if (error) {
        Taro.showModal({
          title: '失败',
          content: error.msg,
        })
        return
      }
      // 跳转到结算页面
      Taro.navigateBack()
    }
  }

  atMessageError = message => {
    Taro.atMessage({
      message,
      type: 'error',
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
      <View className="container">
        <AtMessage />
        <AtForm onSubmit={this.onSubmit}>
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
              maxLength="11"
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
            <AtButton className="button wx" type="primary" onClick={this.readFromWx}>从微信导入</AtButton>
            <AtButton className="button" formType="reset">取消</AtButton>
          </View>
          <AtDrawer
            show={showDrawer}
            width="90vw"
            mask
            right
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

export default AddAddress
