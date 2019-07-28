import Taro, { Component } from '@tarojs/taro'
import { View, Canvas, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { getProductDetail } from '@/redux/actions/goods'
import { AtButton } from 'taro-ui'
import { wxaQrcode } from '@/services/wechat'
import { priceToFloat, cError } from '@/utils'
import './share-product.scss'

// 获取屏幕设备信息

const { windowWidth, pixelRatio } = Taro.getSystemInfoSync()

const ratio = windowWidth / 375
// 在 dom 中展示 canvas 的宽度
// canvas 750下画布大小
const CANVAS_BASE_WIDTH = 300

// 真实的 canvas 大小
const CANVAS_WIDTH = ratio * CANVAS_BASE_WIDTH

@connect(
  ({ goods }) => ({
    productDetail: goods.productDetail,
  }),
  dispatch => ({
    getProductDetail: data => dispatch(getProductDetail(data)),
  }),
)

export default class ShareProduct extends Component {

  config = {
    navigationBarTitleText: '生成商品海报',
  }

  state = {
    canvasStyle: {
      width: CANVAS_WIDTH,
      height: 300,
    },
  }

  async componentDidShow() {
    Taro.showLoading({
      mask: true,
      title: '合成中...',
    })
    const { id } = this.$router.params
    this.productId = id

    // 获取商品详情数据
    await this.props.getProductDetail({
      productId: id,
    })

    this.draw()
  }

  // 画图
  draw = async () => {
    const {
      basicInfo: {
        pic,
        name,
        characteristic,
        amountReal,
        minPrice,
        minScore,
      },
    } = this.props.productDetail[this.productId]

    // 获取图片信息
    const [productImgInfo, qrcodeImgInfo] = await Promise.all([
      this.getImageInfo(pic),
      this.getQrImgInfo(),
    ])

    // product image 宽高
    const pW = CANVAS_WIDTH
    const pH = (pW / productImgInfo.width) * productImgInfo.height
    // product image margin

    // canvas 高度
    let canvasHeight = pH

    // 图片高度
    const top1 = canvasHeight

    // 商品名高度
    const top2 = top1 + 30 * ratio

    // 描述高度
    const top3 = top2 + 20 * ratio

    // 金额高度
    const top4 = top3 + 35 * ratio

    // 总高度
    canvasHeight = top4 + 20 * ratio

    const ctx = Taro.createCanvasContext('canvas')

    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, CANVAS_WIDTH, canvasHeight)

    // 绘制商品图片
    ctx.drawImage(productImgInfo.path, 0, 0, pW, pH)

    // 绘制二维码
    // product image 宽高
    const qW = 60 * ratio
    const qH = (qW / qrcodeImgInfo.width) * qrcodeImgInfo.height

    ctx.drawImage(qrcodeImgInfo.path, 215 * ratio, top1 + 10 * ratio, qW, qH)

    // 绘制二维码描述
    ctx.setFontSize(10 * ratio)
    ctx.fillStyle = '#000000'
    ctx.fillStyle = '#999999'
    ctx.setTextAlign('left')
    ctx.fillText('识别二维码查看商品', 198 * ratio, top1 + 85 * ratio)

    // 绘制商品名
    // canvasHeight += 30 * ratio
    ctx.setFontSize(16 * ratio)
    ctx.fillStyle = '#000000'
    ctx.setTextAlign('left')
    const productName = this.sliceText(nam, 13)
    ctx.fillText(productName, 10 * ratio, top2)

    // 绘制商品描述
    // canvasHeight += 20 * ratio
    ctx.setFontSize(10 * ratio)
    ctx.fillStyle = '#999999'
    ctx.setTextAlign('left')
    const productChar = this.sliceText(characteristic, 18)
    ctx.fillText(productChar, 10 * ratio, top3)

    // 绘制商品价格
    // 金额信息
    let amountMsg = `￥${minPrice}`
    // 积分
    if (minScore > 0) {
      if (amountReal === 0) {
        amountMsg = `${minScore}积分`
      } else {
        amountMsg += ` + ${minScore}积分`
      }
    }
    // canvasHeight += 35 * ratio
    ctx.setFontSize(20 * ratio)
    ctx.fillStyle = '#FF4949'
    ctx.setTextAlign('left')
    ctx.fillText(amountMsg, 10 * ratio, top4)

    this.setState({
      canvasStyle: {
        ...this.state.canvasStyle,
        height: canvasHeight,
      },
    })
    ctx.stroke()
    setTimeout(() => {
      Taro.hideLoading()
      ctx.draw()
    }, 1000)
  }

  // 截取字符串
  sliceText = (text, length) => text.length > length ? `${text.slice(0, length)}...` : text

  // 处理二维码信息
  getQrImgInfo = async () => {
    const [error, res] = await cError(wxaQrcode({
      scene: `${this.productId},${Taro.getStorageSync('uid')}`,
      page: 'pages/product-detail/index',
      is_hyaline: true,
      expireHours: 1,
    }))

    if (error) {
      Taro.showToast({
        title: res.msg,
        icon: 'none',
        duration: 2000,
      })
      return
    }

    // 测试数据
    res.data = 'http://my-home-static.smackgg.cn/gh_4e90d1e6fa97_860.jpg'
    const qrcodeImgInfo = await this.getImageInfo(res.data)
    return qrcodeImgInfo
  }

  // 保存到手机相册
  saveToMobile = () => {
    const { canvasStyle: { width, height } } = this.state
    Taro.canvasToTempFilePath({
      canvasId: 'canvas',
      destWidth: width * pixelRatio,
      destHeight: height * pixelRatio,
      success: res => {
        // pixelRatio
        let tempFilePath = res.tempFilePath
        Taro.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: () => {
            Taro.showModal({
              content: '图片已保存到手机相册',
              showCancel: false,
              confirmText: '知道了',
              confirmColor: '#333',
            })
          },
          fail: () => {
            Taro.showToast({
              title: '保存失败, 请重试',
              icon: 'none',
              duration: 2000,
            })
          },
        })
      },
    })
  }

  // 获取图片信息
  getImageInfo = async url => new Promise(resolve => {
    Taro.getImageInfo({
      src: url,
      success: resolve,
      fail: resolve,
    })
  })

  render() {
    const { canvasStyle: { width, height } } = this.state
    const styles = {
      width: `${width}px`,
      height: `${height}px`,
    }
    return (
      <View className="container">
        <View className="canvas-wrapper" style={styles}>
          <Canvas className="canvas" style={styles} canvasId="canvas"></Canvas>
        </View>
        <AtButton className="button primary" type="primary" onClick={this.saveToMobile}>保存到手机相册</AtButton>
      </View>
    )
  }
}

