import React, { Component } from 'react'

import Taro from '@tarojs/taro'
import { View, Image, Button, ScrollView } from '@tarojs/components'
import { AtInputNumber } from 'taro-ui'
import { BottomBar } from '@/components'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { productPrice } from '@/services/goods'
import dateFormat from '@/utils/dateFormat'
import { ProductDetail as ProductDetailType, Properties } from '@/redux/reducers/goods'
import { addCart } from '@/redux/actions/user'

import { cError } from '@/utils'

import './index.scss'

type PageOwnProps = {
  productId: string,
  productInfoProps: ProductDetailType,
  selectSkuProps: any,
  handleClose: () => any,
  buttonType: 1 | 2,
  isReserve: boolean,
  addCart: typeof addCart,
}

type PageState = {
  selectSku: any
  productInfo: ProductDetailType
  amount: number
  reserveData?: {
    start: number
    end: number
  }
}

export default class SkuSelect extends Component<PageOwnProps, PageState> {
  static propTypes = {
    productId: PropTypes.string.isRequired,
    productInfoProps: PropTypes.object.isRequired,
    handleClose: PropTypes.func.isRequired,
    buttonType: PropTypes.number.isRequired,
    isReserve: PropTypes.bool.isRequired,
    addCart: PropTypes.func.isRequired,
  }

  static defaultProps = {
    basicInfo: {},
    isReserve: false,
  }

  state = {
    selectSku: this.props.selectSkuProps || {},
    productInfo: this.props.productInfoProps || {},
    amount: 1, // 商品数量
    reserveData: {
      start: -1,
      end: -1,
    },
  }

  componentDidMount() {
    this.initReserveData()
  }

  // 处理预约数据
  initReserveData = (pps?: Properties[]) => {
    const { productId, isReserve } = this.props
    if (!isReserve) {
      return
    }

    let properties = pps || this.state.productInfo.properties

    const { promiseList }: { promiseList: (ReturnType<typeof cError>)[] } = properties.reduce((pre: any, propertie: Properties, index: number) => {
      // 非时间段
      if (index !== properties.length - 1) {
        pre.attrs += propertie.id + ':' + (propertie.childsCurGoods.find(item => item.checked) || {}).id + ','
      } else {
        pre.skus = propertie.childsCurGoods.map(item => {
          const propertyChildIds = pre.attrs + propertie.id + ':' + item.id
          pre.promiseList.push(cError(productPrice({
            propertyChildIds,
            goodsId: +productId,
          })))
        })
      }

      return pre
    }, {
      skus: [],
      attrs: '',
      promiseList: [],
    })

    this.cancelReserveDateSelect()

    // 请求价格
    Promise.all(promiseList).then(results => {
      const reserveProps = properties[properties.length - 1]
      properties[properties.length - 1].childsCurGoods = reserveProps
        .childsCurGoods
        .map((item, index) => {
          const result = results[index]
          const [error, res] = result
          if (error) {
            return {
              ...item,
              stores: 0,
            }
          }

          // 防止数据覆盖
          delete res.data.id
          return ({
            ...item,
            ...res.data,
          })
        })
      properties[properties.length - 1].reserveTimes = this.getReserveTimes(reserveProps.childsCurGoods)

      this.setState({
        productInfo: {
          ...this.state.productInfo,
          properties,
        },
      })
    })
  }

  // 处理数量变更
  onNumberChange = (value: number) => {
    this.setState({
      amount: +value,
    })
  }

  // 用户点击选配属性
  onAttributeClick = async (index: number, attribute: {
    id: number,
    name: string,
  }) => {
    console.log(attribute)
    let {
      productInfo: { properties },
      productInfo,
      selectSku: { propertyChildIds },
    } = this.state
    const { productId } = this.props
    // 同规格 选中状态重置
    properties[index].childsCurGoods.forEach((child) => {
      child.checked = child.id === attribute.id
      return child
    })

    // 更新选中 propertyChildIds
    propertyChildIds = propertyChildIds
      .split(',')
      .map((id: number, i: number) => index === i ? `${properties[index].id}:${attribute.id}` : id)
      .join(',')
    const res = await productPrice({
      propertyChildIds,
      goodsId: +productId,
    })

    if (this.props.isReserve) {
      this.initReserveData(properties)
    }

    this.setState({
      selectSku: {
        ...res.data,
        propertyChildIds,
      },
      productInfo: {
        ...productInfo,
        properties,
      },
      amount: 1,
    })
  }

  // 预约时间点击处理
  onReserveAttributeClick = async (index: number, child: any, disabled: boolean, reserveTimes: any) => {

    if (disabled) {
      Taro.showToast({
        title: '当前时间不可选',
        icon: 'none',
      })
      return
    }
    const { reserveData: { start, end } } = this.state
    let reserveData = { start, end }
    // 不能重复点击按钮
    if (start === index || end === index) {
      return
    }
    // 重新选择开始时间
    if (
      (start < 0 && end < 0)
      || (start >= 0 && end >= 0)
    ) {
      reserveData = {
        start: index,
        end: -1,
      }
    }
    // 选择结束时间
    if (start >= 0 && end < 0) {
      if (index < start) {
        // 点击的位置在开始之前
        reserveData = {
          start: index,
          end: -1,
        }
      } else {
        // 筛选点击的范围内是否有不可购买时间
        if (reserveTimes.slice(start + 1, index).some((item: any) => !item.endClickable)) {
          Taro.showToast({
            title: '存在不可选时间',
            icon: 'none',
          })
          return
        }

        reserveData = {
          start,
          end: index,
        }
      }
    }

    this.setState({
      reserveData,
    })
  }

  // 取消勾选
  cancelReserveDateSelect = () => {
    this.setState({
      reserveData: {
        start: -1,
        end: -1,
      },
    })
  }

  // 获取预约对应时间
  getReserveDate = (attr: string) => {
    const now = Date.now()

    let date = now

    if (attr.includes('今天')) {
      date = now
    } else if (attr.includes('明天')) {
      date = now + 24 * 60 * 60 * 1000
    } else if (attr.includes('后天')) {
      date = now + 24 * 60 * 60 * 1000 * 2
    }

    return date && dateFormat(date, 'MM月dd日')
  }

  padZero = (num: number) => (num >= 10 ? num : '0' + num) + ':00'
  // 获取预约对应时间段
  getReserveTimes = (childsCurGoods: any) => {
    const childsMap = {}
    childsCurGoods.forEach((child: any) => {
      const [start, end] = child.name.split('~')
      if (!childsMap[start]) {
        childsMap[start] = {}
      }
      if (!childsMap[end]) {
        childsMap[end] = {}
      }

      childsMap[start].startClickable = child.stores > 0
      childsMap[start].data = child
      childsMap[end].endClickable = child.stores > 0
    })

    // 初始化时间 map 表
    return (new Array(25)).fill(0).reduce((times, item, index) => {
      let startClickable = false
      let endClickable = false
      let data = {}
      const time = this.padZero(index)
      if (childsMap[time]) {
        startClickable = childsMap[time].startClickable
        endClickable = childsMap[time].endClickable
        data = childsMap[time].data
      }
      times.push({
        start: time,
        startClickable,
        endClickable,
        data,
      })
      return times
    }, [])
  }

  handleReserveSubmit = () => {
    const { reserveData: { start, end }, productInfo: { properties }, selectSku: { propertyChildNames } } = this.state
    if (start < 0) {
      Taro.showModal({
        title: '提示',
        content: '请先选择开始时间',
        showCancel: false,
      })
      return
    }

    if (end < 0) {
      Taro.showModal({
        title: '提示',
        content: '请选择结束时间',
        showCancel: false,
      })
      return
    }

    // 组建立即购买信息
    const productList = properties[properties.length - 1]
      .reserveTimes
      .slice(start, end)
      .map(item => this.buildCartInfo(item.data, 1))

    const reserveDate = this.getReserveDate(propertyChildNames)

    this.props.addCart({
      type: 'buynow',
      productInfo: productList,
    })

    // 关闭弹窗
    this.props.handleClose()
    // 跳转到结算页
    Taro.navigateTo({
      url: `/pages/checkout/index?orderType=buyNow&reserveDate=${reserveDate}`,
    })
  }

  // 处理用户点击提交按钮逻辑
  handleSubmit = () => {
    const { buttonType, isReserve } = this.props

    if (isReserve) {
      this.handleReserveSubmit()
      return
    }

    buttonType === 1
      ? this.buyNow()
      : this.addToCart()
  }

  // 立即购买
  buyNow = () => {
    const { amount } = this.state
    if (amount < 1) {
      Taro.showModal({
        title: '提示',
        content: '购买数量不能为0~',
        showCancel: false,
      })
      return
    }

    // 组建立即购买信息
    const productInfo = this.buildCartInfo()
    this.props.addCart({
      type: 'buynow',
      productInfo,
    })

    // 关闭弹窗
    this.props.handleClose()
    // 跳转到结算页
    Taro.navigateTo({
      url: '/pages/checkout/index?orderType=buyNow',
    })
  }

  // 加购物车（本地缓存）
  addToCart = () => {
    // 组建购物车
    const productInfo = this.buildCartInfo()

    this.props.addCart({
      productInfo,
    })

    // 关闭弹窗
    this.props.handleClose()

    Taro.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000,
    })
  }

  // 组建购物车信息 type=0 立即购买 type=1 购物车
  buildCartInfo = (selectSku = this.state.selectSku, amount = this.state.amount) => {

    const {
      propertyChildIds,
      propertyChildNames,
      price,
      score,
    } = selectSku

    const {
      basicInfo: {
        id,
        pic,
        name,
        logisticsId,
        weight,
      },
      logistics,
    } = this.state.productInfo

    // 商品信息
    const productInfo = {
      goodsId: id,
      pic,
      name,
      propertyChildIds,
      price,
      label: propertyChildNames,
      score,
      left: '',
      active: true,
      number: +amount,
      logisticsType: logisticsId,
      logistics,
      weight,
    }

    return productInfo
  }

  render() {
    const { buttonType, isReserve } = this.props
    const {
      selectSku: {
        stores,
      },
      selectSku,
      amount,
      reserveData: {
        start,
        end,
      },
      productInfo,
    } = this.state

    // 商品详情页数据未拉取
    if (!productInfo || !productInfo.basicInfo) {
      return null
    }

    const {
      basicInfo: {
        pic,
      },
      properties,
    } = productInfo

    return <View className="sku-wrapper">
      <ScrollView scrollY className="select-content">
        <View className="select_product-info">
          <Image mode="aspectFill" src={pic} className="product-image" />
          <View>
            <View className="price">￥{selectSku.price}</View>
            {isReserve && <View className="reserve-tip">[订金/每小时]</View>}
            {!isReserve && selectSku.originalPrice !== selectSku.price && <View className="original-price">￥{selectSku.originalPrice}</View>}
            {!isReserve && <View>库存：{stores}</View>}
          </View>
        </View>
        {/* 规格参数 */}
        {properties && <View className="properties">
          {
            properties.map((propertie, index) => {
              const isReserveTime = isReserve && /时间/.test(propertie.name)

              return <View key={propertie.id} className="propertie">
                <View className="propertie-name">
                  {propertie.name}
                </View>
                {
                  isReserveTime && start > 0 && <View className="cancel-reservetime text-color-blue" onClick={this.cancelReserveDateSelect}>
                    取消
                  </View>
                }
                {/* 非预约时间 */}
                {
                  !isReserveTime && <View className="attributes">
                    {
                      propertie.childsCurGoods.map(child => <View key={child.id} className="attribute">
                        <Button
                          size="mini"
                          className={classNames('attribute-button', child.checked ? 'primary' : 'secondary')}
                          onClick={this.onAttributeClick.bind(this, index, child)}
                        >{child.name}{isReserve && this.getReserveDate(child.name) ? `(${this.getReserveDate(child.name)})` : ''}</Button>
                      </View>)
                    }
                  </View>
                }
                {/* 预约 */}
                {
                  isReserveTime && propertie.reserveTimes && <View className="attributes">
                    {
                      propertie.reserveTimes.map((child, i) => {
                        let disabled = false
                        // 都没有选择的时候 || 两个都选中的时候
                        if (
                          (start < 0 && end < 0)
                          || (start >= 0 && end >= 0)
                        ) {
                          disabled = !child.startClickable
                        }
                        // 选择第二个参数的时候
                        if (start >= 0 && end < 0) {
                          disabled = !child.endClickable || (i < start)
                        }

                        return <View key={child.id} className="reserve-attribute">
                          <View
                            className={classNames('reserve-attribute-button', {
                              'checked': start === i || end === i,
                              'active': i > start && i < end,
                              'disabled': disabled,
                            })}
                            onClick={() => {
                              this.onReserveAttributeClick(i, child, disabled, propertie.reserveTimes)
                            }}
                          >
                            <View>{child.start}</View>
                            {
                              child.data?.id && <View className="reserve-price">{child.data.stores > 0 ? `￥${child.data.price}` : '已订满'}</View>
                            }
                            {
                              start === i && <View className="reserve-time-tip">开始时间</View>
                            }
                            {
                              end === i && <View className="reserve-time-tip">结束时间</View>
                            }
                          </View>
                        </View>
                      })
                    }
                  </View>
                }
              </View>
            })
          }
        </View>}

        {/* 数量 */}
        {
          !isReserve && <View className="amount">
            <View>数量</View>
            <AtInputNumber
              type="number"
              min={1}
              max={stores}
              step={1}
              value={amount}
              onChange={this.onNumberChange}
            />
          </View>
        }
      </ScrollView>

      {/* 预订按钮 */}
      <BottomBar>
        <Button
          className="submit-button"
          type="primary"
          disabled={!isReserve && stores === 0}
          onClick={this.handleSubmit}
        >{
            isReserve
              ? '立即预订'
              : stores === 0
                ? '已售罄'
                : (buttonType === 1
                  ? '立即购买'
                  : '加入购物车')}</Button>
      </BottomBar>
    </View>
  }
}

