import Taro, { Component } from '@tarojs/taro'
import { View, Image, Swiper, SwiperItem, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getLevelList } from '@/redux/actions/user'
import { AtButton } from 'taro-ui'
import { theme } from '@/utils'
import classNames from 'classnames'
import Bg from '@/assets/img/account_bg.png'
import Vip1Icon from '@/assets/icon/vip1_icon.png'
import Vip2Icon from '@/assets/icon/vip2_icon.png'
import Vip3Icon from '@/assets/icon/vip3_icon.png'
import Vip4Icon from '@/assets/icon/vip4_icon.png'

import Vip1Bg from '@/assets/img/vip1_bg.png'
import Vip2Bg from '@/assets/img/vip2_bg.png'
import Vip3Bg from '@/assets/img/vip3_bg.png'
import Vip4Bg from '@/assets/img/vip4_bg.png'
import './index.scss'

const SWIPER_ITEM_MARGIN = '45rpx'

@connect(
  ({ global, user }) => ({
    global,
    user,
  }),
  dispatch => ({
    getLevelList: () => dispatch(getLevelList()),
  }),
)

class Account extends Component {

  config = {
    navigationBarTitleText: '个人中心',
  }

  state = {
    swiperIndex: 0,
  }

  vipList = [
    {
      icon: Vip1Icon,
      lv: 1,
      bg: Vip1Bg,
    },
    {
      icon: Vip2Icon,
      lv: 2,
      bg: Vip2Bg,
    },
    {
      icon: Vip3Icon,
      lv: 3,
      bg: Vip3Bg,
    },
    {
      icon: Vip4Icon,
      lv: 4,
      bg: Vip4Bg,
    },
  ]

  componentWillMount() {
    Taro.setNavigationBarColor({
      backgroundColor: theme['$color-brand'],
      frontColor: '#ffffff',
    })
  }

  async componentDidShow() {
    await this.props.getLevelList()
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
        lv,
        name,
      },
      userLevel,
      levelList,
    } = this.props.user
    const {
      icon,
    } = (this.vipList[lv - 1] || {})
    return (
      <View className="container">
        {/* 用户信息 */}
        <View className="userinfo" style={{ backgroundColor: theme['$color-brand'] }}>
          <Image className="userinfo-bg" src={Bg}></Image>
          <View className="content">
            <Image className="avatar" src={avatarUrl}></Image>
            <View className="info">
              <View className="nickname">{nick}</View>
              <View className="vip-info">
                <Image className="vip-icon" src={icon}></Image>
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
                  src={this.vipList[level.lv - 1].bg}
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
