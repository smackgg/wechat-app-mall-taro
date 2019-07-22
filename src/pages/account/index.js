import Taro, { Component } from '@tarojs/taro'
import { View, Image, Swiper, SwiperItem, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getLevelList, getUserAmount } from '@/redux/actions/user'
// import { AtButton } from 'taro-ui'
import { theme } from '@/utils'
import classNames from 'classnames'

import './index.scss'

const SWIPER_ITEM_MARGIN = '45rpx'

@connect(
  ({ global, user, user: { userAmount } }) => ({
    global,
    user,
    userAmount,
  }),
  dispatch => ({
    getLevelList: () => dispatch(getLevelList()),
    getUserAmount: () => dispatch(getUserAmount()),
  }),
)

class Account extends Component {

  config = {
    navigationBarTitleText: '个人中心',
  }

  state = {
    swiperIndex: 0,
  }

  componentWillMount() {
    Taro.setNavigationBarColor({
      backgroundColor: theme['$color-brand'],
      frontColor: '#ffffff',
    })
  }

  async componentDidShow() {
    // 获取用户资产
    this.getUserAmount()

    // 获取vip等级列表
    await this.props.getLevelList()
  }

  getUserAmount = async () => {
    await this.props.getUserAmount()
    console.log(this.props.userAmount)
  }

  // 会员卡轮播图变化
  onSwiperChange = e => {
    this.setState({
      swiperIndex: e.detail.current,
    })
  }

  render () {
    const { swiperIndex } = this.state
    const {
      userDetail: { avatarUrl, nick, mobile },
      userLevel: {
        lv = 1,
        name,
      },
      userLevel,
      levelList,
    } = this.props.user

    return (
      <View className="container">
        {/* 用户信息 */}
        <View className="userinfo" style={{ backgroundColor: theme['$color-brand'] }}>
          <Image className="userinfo-bg" src="/assets/img/account_bg.png"></Image>
          <View className="content">
            <Image className="avatar" src={avatarUrl}></Image>
            <View className="info">
              <View className="nickname">{nick}</View>
              <View className="vip-info">
                <Image className="vip-icon" src={`/assets/icon/vip${lv}_icon.png`}></Image>
                <View className={`vip-name vip${lv}`}>{name}</View>
                <View className={`vip-level vip${lv}`}>Lv.{lv}</View>
              </View>
            </View>
          </View>
          {/* 会员卡轮播组件 */}
          <Swiper
            className="swiper-wrapper"
            indicatorDots={false}
            previousMargin={SWIPER_ITEM_MARGIN}
            nextMargin={SWIPER_ITEM_MARGIN}
            onChange={this.onSwiperChange}
            current={lv - 1}
          >
            {levelList.map((level, index) => <SwiperItem className="swiper-item" key={level.id}>
              <View className={classNames('item-content', `vip${level.lv}`)}>
                <Image
                  className={classNames('image', {
                    active: swiperIndex === index,
                  })}
                  src={`/assets/img/vip${level.lv}_bg.png`}
                  mode="aspectFill"
                />
                <View className="vip-names">
                  <Text className="vip-name">{level.name}</Text>
                  <Text className="vip-level">LV.{level.lv}</Text>
                </View>
              </View>
            </SwiperItem>)}
          </Swiper>

          <View>{mobile}</View>
        </View>
      </View>
    )
  }
}

export default Account
