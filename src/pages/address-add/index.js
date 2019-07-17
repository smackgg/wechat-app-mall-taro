import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Swiper, SwiperItem, Picker } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import classNames from 'classnames'
import { AtButton, AtInput, AtIndexes, AtDrawer } from 'taro-ui'
import commonCityData from '@/third-utils/city'
import { getProvince, getNextRegion } from '@/redux/actions/config'
import './index.scss'

@connect(({ config: { provincesIndexs, citysIndexs, districtsIndexs }, config }) => ({
  provincesIndexs,
  citysIndexs,
  districtsIndexs,
}), dispatch => ({
    getProvince: () => dispatch(getProvince()),
    getNextRegion: data => dispatch(getNextRegion(data)),
}))

class AddressAdd extends Component {
  config = {
    navigationBarTitleText: '新增收货地址',
  }

  state = {
    citys: [],
    districts: [],
    defaultProvinceCode: 2,
    defaultCityCode: 3,
    defaultCountyCode: 16,
    defaultAddressCode: '057750',
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
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount() { }

  async componentWillMount() {
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
    const { province, city, district } = this.state
    const {
      provincesIndexs,
      citysIndexs,
      districtsIndexs,
    } = this.props
    // let key = 'province'
    let regionList
    if (type === 'province') {
      regionList = provincesIndexs
    } else if (type === 'city') {
      // 用户点击城市，但是省没有选，弹出省选择器
      console.log(province)
      regionList = !province.id
        ? provincesIndexs
        : citysIndexs
    } else if (type === 'district') {

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
      this.setState({
        ...nextState,
        district: {
          id: '',
          name: '请选择区',
        },
      })
    }
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
    } = this.state

    return (
      <View className="container">
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
            <View className={classNames('picker', { gray: district.name === '请选择区' })} onClick={this.onPickerClick.bind(this, 'district')}>
              {district.name}
            </View>
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
      </View>
    )
  }
}

export default AddressAdd
