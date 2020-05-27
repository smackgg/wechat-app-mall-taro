import React, { Component } from 'react'

import Taro from '@tarojs/taro'
import { View, Image, Button, ScrollView } from '@tarojs/components'
import { AtInputNumber } from 'taro-ui'
import { BottomBar } from '@/components'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { productPrice } from '@/services/goods'
import { ProductDetail as ProductDetailType } from '@/redux/reducers/goods'
import { addCart } from '@/redux/actions/user'
import { routes } from '@/utils/router'

import './index.scss'

type Props = {
  productId: string,
  productInfoProps: ProductDetailType,
  selectSkuProps: any,
  handleClose: () => any,
  buttonType: 1 | 2,
  addCart: typeof addCart,
}

type State = {
  selectSku: any
  productInfo: ProductDetailType
  amount: number
}

export default class SkuSelect extends Component<Props, State> {
  static propTypes = {
    productId: PropTypes.string.isRequired,
    productInfoProps: PropTypes.object.isRequired,
    handleClose: PropTypes.func.isRequired,
    buttonType: PropTypes.number.isRequired,
    addCart: PropTypes.func.isRequired,
  }

  static defaultProps = {
    basicInfo: {},
  }

  state = {
    selectSku: this.props.selectSkuProps || {},
    productInfo: this.props.productInfoProps || {},
    amount: 1, // 商品数量
  }

  componentDidMount() {
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

  padZero = (num: number) => (num >= 10 ? num : '0' + num) + ':00'


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
      url: routes.chekcout + '?orderType=buyNow',
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
    const { buttonType } = this.props
    const {
      selectSku: {
        stores,
      },
      selectSku,
      amount,
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
          </View>
        </View>
        {/* 规格参数 */}
        {properties && <View className="properties">
          {
            properties.map((propertie, index) => {
              return <View key={propertie.id} className="propertie">
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
                      >{child.name}</Button>
                    </View>)
                  }
                </View>
              </View>
            })
          }
        </View>}

        {/* 数量 */}
        <View className="amount">
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
      </ScrollView>

      <BottomBar>
        <Button
          className="submit-button"
          type="primary"
          disabled={stores === 0}
          onClick={this.handleSubmit}
        >{
            stores === 0
              ? '已售罄'
              : (buttonType === 1 ? '立即购买' : '加入购物车')
          }</Button>
      </BottomBar>
    </View>
  }
}

