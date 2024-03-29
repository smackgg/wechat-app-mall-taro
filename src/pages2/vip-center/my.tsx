import React, { Component } from 'react'
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components'
import { connect } from 'react-redux'
import { getLevelList, getUserAmount, getLevelDetail } from '@/redux/actions/user'

import classNames from 'classnames'
import { UserState } from '@/redux/reducers/user'
// icons
import accountBg from '@/assets/img/account_bg.png'

import './my.scss'

type PageProps = {
  user: UserState
  getLevelList: typeof getLevelList
  getLevelDetail: typeof getLevelDetail
  getUserAmount: typeof getUserAmount
}

type PageState = {
  swiperIndex: number
  loading: boolean
}

const SWIPER_ITEM_MARGIN = '45rpx'
@connect(({ user }) => ({
  user,
}), (dispatch: any) => ({
  getLevelList: () => dispatch(getLevelList()),
  getLevelDetail: data => dispatch(getLevelDetail(data)),
  getUserAmount: () => dispatch(getUserAmount()),
}))

export default class MyVip extends Component<PageProps, PageState> {
  state = {
    swiperIndex: 0,
    loading: true,
  }

  async componentDidShow() {
    // 获取用户资产
    this.props.getUserAmount()

    // 获取vip等级列表
    await this.props.getLevelList()
    this.setState({
      loading: false,
    })
    const { levelId } = this.props.user.userDetail

    this.props.getLevelDetail({
      id: '' + levelId || '',
    })
  }


  // 会员卡轮播图变化
  onSwiperChange = (e: TaroBaseEventOrig) => {
    this.setState({
      swiperIndex: e.detail.current,
    })
  }

  render() {
    const { swiperIndex, loading } = this.state

    const {
      userDetail: { avatarUrl, nick },
      userLevel: {
        lv = 0,
        name,
        potences,
      },
      levelList,
      userAmount: {
        totleConsumed,
      },
    } = this.props.user
    console.log(this.props.user.userLevel)
    if (loading) {
      return null
    }
    return (
      <View className="vip-center__my">
        {
          lv === 0 && <View className="no-data">亲爱的{nick}，您还不是本店会员</View>
        }
        {
          lv !== 0 && <View className="vip">
            <View className="userinfo" style={{ backgroundColor: '#181923' }}>
              <Image className="userinfo-bg" src={accountBg}></Image>
              <View className="content">
                <Image className="avatar" src={avatarUrl}></Image>
                <View className="info">
                  <View className="nickname">{nick}</View>
                  {lv !== 0 && <View className="vip-info">
                    <Image className="vip-icon" src={require(`@/assets/icon/vip${lv}_icon.png`)}></Image>
                    <View className={`vip-name vip${lv}`}>{name}</View>
                    <View className={`vip-level vip${lv}`}>Lv.{lv}</View>
                  </View>}
                </View>
              </View>
              {/* 会员卡轮播组件 */}
              <Swiper
                className="swiper-wrapper"
                indicatorDots={false}
                previousMargin={SWIPER_ITEM_MARGIN}
                nextMargin={SWIPER_ITEM_MARGIN}
                onChange={this.onSwiperChange}
                current={(lv - 1) < 0 ? 0 : (lv - 1)}
              >
                {levelList.map((level, index) => {
                  const { id } = level
                  // 会员等级小于当前卡会员等级一级以上
                  let progressWidth = '0'
                  if (lv >= level.lv) {
                    // 会员等级大于当前卡的等级
                    progressWidth = '100%'
                  } else if (level.lv - lv === 1) {
                    // 会员等级小于当前卡会员等级一级以内
                    progressWidth = `${(level.upgradeAmount - totleConsumed) / level.upgradeAmount * 100}%`
                  }

                  return <SwiperItem className="swiper-item" key={id}>
                    <View className={classNames('item-content', `vip${level.lv}`)}>
                      <Image
                        className={classNames('image', {
                          active: swiperIndex === index,
                        })}
                        src={require(`@/assets/img/vip${level.lv}_bg.png`)}
                        mode="aspectFill"
                      />
                      <View className="vip-names">
                        <Text className="vip-name">{level.name}</Text>
                        <Text className="vip-level">LV.{level.lv}</Text>
                      </View>
                      <View className="price-info">
                        <View className="user-consumed">
                          累计充值{level.upgradeAmount}可升级为该会员
                        </View>
                        {/* <View className="user-consumed">
                          当前消费
                          <Text className="price">{totleConsumed}</Text>
                          元
                        </View> */}
                        {/* 已经是当前会员 */}
                        {
                          (lv === level.lv) && <View className="level-consumed">
                            您已经成为本店{level.name}
                          </View>
                        }
                      </View>
                      <View className="vip-progress">
                        <View className="bg"></View>
                        <View className="current" style={{ width: progressWidth }}></View>
                        <View className="vip-level-steps">
                          <View className={classNames({
                            'step-gray': level.lv - 1 > lv,
                          })}
                          >
                            <Text className="step">Lv.{level.lv - 1}</Text>
                            {level.lv - 1 === lv && <Text>(当前等级)</Text>}
                          </View>
                          <View className={classNames({
                            'step-gray': level.lv > lv,
                          })}
                          >
                            <Text className="step">Lv.{level.lv}</Text>
                            {level.lv === lv && <Text>(当前等级)</Text>}
                          </View>
                        </View>
                      </View>
                    </View>
                  </SwiperItem>
                })}
              </Swiper>
            </View>

            {/* 会员权益 */}
            {
              potences && <View className="potences">
                <View className="title">
                  <View>您好，尊贵的{name}。</View>
                  <View>您将尊享本店以下会员权益：</View>
                </View>
                <View>
                  {
                    potences.map((potence: string, index: number) => <View
                      key={potence + index}
                      className="potence"
                    >{index + 1}、{potence}</View>)
                  }
                </View>
              </View>
            }
          </View>
        }
      </View>
    )
  }
}
