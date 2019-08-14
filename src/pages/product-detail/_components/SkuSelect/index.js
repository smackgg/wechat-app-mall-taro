import Taro, { Component } from '@tarojs/taro'
import { View, Image, Button, ScrollView } from '@tarojs/components'
import { AtInputNumber } from 'taro-ui'
import { BottomBar } from '@/components'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { productPrice } from '@/services/goods'
import dateFormat from '@/utils/dateFormat'
import { valueEqual } from '@/utils'

import './index.scss'

export default class SkuSelect extends Component {
  static options = {
    addGlobalClass: true,
  }

  static propTypes = {
    productInfoProps: PropTypes.object,
    handleSubmit: PropTypes.func,
    handleClose: PropTypes.func,
    buttonType: PropTypes.number,
    isReserve: PropTypes.bool,
  }

  static defaultProps = {
    basicInfo: {},
    isReserve: false,
  }

  constructor(props) {
    this.state = {
      selectSku: props.selectSkuProps || {},
      productInfo: props.productInfoProps || {},
      amount: 1, // 商品数量
      reserveAttrs: {
        start: 0,
        end: 1,
      },
    }
  }

  componentDidMount() {
    this.initReserveData()
  }

  componentWillReceiveProps(nextProps) {
    if (valueEqual(nextProps.selectSkuProps, this.props.selectSkuProps)) {
      this.setState({
        selectSku: nextProps.selectSkuProps,
      })
    }
    if (valueEqual(nextProps.productInfoProps, this.props.productInfoProps)) {
      this.setState({
        productInfo: nextProps.productInfoProps,
      }, () => this.initReserveData())
    }
  }

  // 处理预约数据
  initReserveData = () => {
    const { productId, isReserve } = this.props
    if (!isReserve) {
      return
    }

    let {
      productInfo: { properties },
    } = this.state

    const { promiseList } = properties.reduce((pre, propertie, index) => {
      // 非时间段
      if (index !== properties.length - 1) {
        pre.attrs += propertie.childsCurGoods.find(item => item.checked).id + ','
      } else {
        pre.skus = propertie.childsCurGoods.map(item => {
          const propertyChildIds = pre.attrs + item.id
          pre.promiseList.push(productPrice({
            propertyChildIds,
            goodsId: productId,
          }))
        })
      }

      return pre
    }, {
      skus: [],
      attrs: '',
      promiseList: [],
    })

    Promise.all(promiseList).then(results => {
      properties[properties.length - 1].childsCurGoods = properties[properties.length - 1].childsCurGoods.map((item, index) => {
        console.log(results[index].data)
        return ({
          ...item,
          ...results[index].data,
        })
      })
      console.log(properties, 222)
      this.setState({
        productInfo: {
          ...this.state.productInfo,
          properties,
        },
      })
    })
  }

  // 处理数量变更
  onNumberChange = value => {
    this.setState({
      amount: +value,
    })
  }

  // 用户点击选配属性
  onAttributeClick = async (index, attribute) => {
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
      .map((id, i) => index === i ? attribute.id : id)
      .join(',')

    const res = await productPrice({
      propertyChildIds,
      goodsId: productId,
    })

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
  onReserveAttributeClick = async (index, attribute) => {
    console.log(index, attribute)
    const { reserveAttrs: { start, end } } = this.state
    console.log(this.state.reserveAttrs)
    // 重新选择开始时间
    if (start >= 0 && end >= 0) {
      this.setState({
        reserveAttrs: {
          start: index,
          end: -1,
        },
      })
    }
    // 选择结束时间
    if (start >= 0 && end < 0) {
      this.setState({
        reserveAttrs: {
          start,
          end: index,
        },
      })
    }
  }

  // 获取预约对应时间
  getReserveDate = attr => {
    const now = Date.now()
    let date = ''
    switch (attr) {
      case '今天':
        date = now
        break
      case '明天':
        date = now + 24 * 60 * 60 * 1000
        break
      case '后天':
        date = now + 24 * 60 * 60 * 1000 * 2
        break
      default:
        break
    }
    return date && dateFormat(date, 'MM月dd日')
  }

  // 获取预约对应时间段
  getReserveTimes = childsCurGoods => {
    console.log(childsCurGoods)
    return childsCurGoods.reduce((times, child) => {
      const [start, end] = child.name.split('~')
      times.push({
        start,
        end,
        child,
      })
      return times
    }, [])
    // return date && dateFormat(date, 'MM月dd日')
  }


  // 处理用户点击提交按钮逻辑
  handleSubmit = () => {
    const { buttonType } = this.props
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
  buildCartInfo = () => {
    const {
      selectSku: {
        propertyChildIds,
        propertyChildNames,
        price,
        score,
      },
      amount,
    } = this.state
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
      price,
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
      reserveAttrs: {
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
            <Image mode="aspectFill" src={pic} class="product-image" />
            <View>
              <View className="price">￥{selectSku.price}</View>
              {selectSku.originalPrice !== selectSku.price && <View className="original-price">￥{selectSku.originalPrice}</View>}
              {!isReserve && <View>库存：{stores}</View>}
            </View>
          </View>
          {/* 规格参数 */}
          {properties && <View className="properties">
            {
              properties.map((propertie, index) => {
                let reserveTimes
                const isReserveTime = isReserve && /时间/.test(propertie.name)
                if (isReserveTime) {
                  reserveTimes = this.getReserveTimes(propertie.childsCurGoods)
                  console.log(propertie.childsCurGoods, '----------')
                }
                return <View key={propertie.id}>
                  <View className="propertie-name">
                    {propertie.name}
                  </View>
                  {/* 非预约 */}
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
                    isReserveTime && <View className="attributes">
                      {
                        reserveTimes.map((child, i) => <View key={child.id} className="reserve-attribute">
                          <View
                            className={classNames('reserve-attribute-button', {
                              'checked': start === i || end === i,
                            })}
                            onClick={this.onReserveAttributeClick.bind(this, i, child)}
                          >
                            <View>{child.start}</View>
                            {
                              start === i && <View className="reserve-time-tip">开始时间</View>
                            }
                            {
                              end === i && <View className="reserve-time-tip">结束时间</View>
                            }
                          </View>
                        </View>)
                      }
                    </View>
                  }
                </View>
              })
            }
          </View>}

          {/* 数量 */}
          <View className="amount">
            <View>数量</View>
            <AtInputNumber
              min={1}
              max={stores}
              step={1}
              value={amount}
              onChange={this.onNumberChange}
            />
          </View>
        </ScrollView>

        {/* 预订按钮 */}
        <BottomBar>
          <Button
            className="submit-button"
            type="primary"
            disabled={stores === 0}
            onClick={this.handleSubmit}
          >{stores === 0
            ? (isReserve ? '已订满' : '已售罄')
            : (buttonType === 1
              ? (isReserve ? '立即预订' : '立即购买')
              : '加入购物车')}</Button>
        </BottomBar>
      </View>
  }
}
