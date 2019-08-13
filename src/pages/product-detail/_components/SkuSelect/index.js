import Taro, { Component } from '@tarojs/taro'
import { View, Image, Button, ScrollView } from '@tarojs/components'
import { AtInputNumber } from 'taro-ui'
import { BottomBar } from '@/components'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { productPrice } from '@/services/goods'
import dateFormat from '@/utils/dateFormat'

import './index.scss'

export default class SkuSelect extends Component {
  static options = {
    addGlobalClass: true,
  }

  static propTypes = {
    productInfo: PropTypes.object,
    handleSubmit: PropTypes.func,
    handleClose: PropTypes.func,
    buttonType: PropTypes.string,
  }

  static defaultProps = {
    basicInfo: {},
  }

  constructor(props) {
    this.state = {
      selectSku: props.selectSkuProps || {},
      amount: 1, // 商品数量
    }

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectSkuProps !== this.props.selectSkuProps) {
      this.setState({
        selectSku: nextProps.selectSkuProps,
      })
    }
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
    const { productInfo, buttonType } = this.props

    const {
      selectSku: {
        stores,
      },
      selectSku,
      amount,
    } = this.state

    // 商品详情页数据未拉取
    if (!productInfo) {
      return null
    }

    const {
      basicInfo: {
        pic,
        tags,
      },
      properties,
    } = productInfo

    // 是否为预订
    const isReserve = tags && tags.includes('预订')

    return <View className="sku-wrapper">
        <ScrollView scrollY className="select-content">
          <View className="select_product-info">
            <Image mode="aspectFill" src={pic} class="product-image" />
            <View>
              <View className="price">￥{selectSku.price}</View>
              {selectSku.originalPrice !== selectSku.price && <View className="original-price">￥{selectSku.originalPrice}</View>}
              <View>库存：{stores}</View>
            </View>
          </View>
          {/* 规格参数 */}
          {properties && <View className="properties">
            {
              properties.map((propertie, index) => <View key={propertie.id}>
                <View className="propertie-name">
                  {propertie.name}
                </View>
                <View className="attributes">
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
              </View>)
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
