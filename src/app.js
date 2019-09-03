import '@tarojs/async-await'
import Taro, { Component } from '@tarojs/taro'
import { Provider } from '@tarojs/redux'
import { getVipLevel, getSystemConfig } from '@/redux/actions/config'
import { checkToken } from '@/services/user'
import { getUserDetail } from '@/redux/actions/user'
import { requireBindMobile, showToast } from './utils'

import Index from './pages/entry'
import { store } from './redux/store'
import { UPDATE_GLOBAL_DATA } from './redux/actions/global'

import './app.scss'

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/authorize/index',
      'pages/account/index',
      'pages/account/extinfo',
      'pages/product-detail/index',
      'pages/product-detail/share-product',
      'pages/product-detail/reputations',
      'pages/checkout/index',
      'pages/edit-address/index',
      'pages/select-address/index',
      'pages/order-list/index',
      'pages/order-detail/index',
      'pages/category/index',
      'pages/asset/index',
      'pages/coupons/index',
      'pages/score-shop/index',
      'pages/reputation/index',
      'pages/shop-cart/index',
      'pages/recharge/index',
      'pages/entry/index',
      'pages/vip-center/index',
      'pages/vip-center/my',
      'pages/vip-center/potences',
      'pages/contact/index',
      'pages/wifi/index',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: '',
      navigationBarTextStyle: 'black',
    },
    tabBar: {
      color: '#333333',
      selectedColor: '#D6B44C',
      borderStyle: 'white',
      backgroundColor: '#fff',
      list: [
        {
          pagePath: 'pages/index/index',
          iconPath: 'assets/icon/home.jpg',
          selectedIconPath: 'assets/icon/home-selected.jpg',
          text: '商城首页',
        },
        {
          pagePath: 'pages/category/index',
          iconPath: 'assets/icon/category.jpg',
          selectedIconPath: 'assets/icon/category-selected.jpg',
          text: '分类',
        },
        {
          pagePath: 'pages/shop-cart/index',
          iconPath: 'assets/icon/shopcart.jpg',
          selectedIconPath: 'assets/icon/shopcart-selected.jpg',
          text: '购物车',
        },
        {
          pagePath: 'pages/account/index',
          iconPath: 'assets/icon/account.jpg',
          selectedIconPath: 'assets/icon/account-selected.jpg',
          text: '我的',
        },
      ],
    },
  }

  async componentWillMount () {
    // 检测版本更新
    const updateManager = Taro.getUpdateManager()
    updateManager.onUpdateReady(() => {
      Taro.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        },
      })
    })

    // 检测网络状况
    Taro.getNetworkType({
      success: (res) => {
        const networkType = res.networkType
        if (networkType === 'none') {
          // 更新断网状态
          this.updateNetworkStatus(false)
          showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000,
          })
        }
      },
    })

    // 监听网络状态
    Taro.onNetworkStatusChange(res => {
      if (!res.isConnected) {
        // 更新断网状态
        this.updateNetworkStatus(false)
        showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000,
          complete: () => {
            // 网络断开处理逻辑
            // this.goStartIndexPage()
          },
        })
      } else {
        this.updateNetworkStatus(true)
        Taro.hideToast()
      }
    })
  }

  async componentDidShow () {
    // 获取 vipLevel
    store.dispatch(getVipLevel())

    // 获取系统参数（店铺信息等
    store.dispatch(getSystemConfig({
      keys: [
        'index_video_1',
        'index_video_2',
        'recharge_amount_min',
        'ALLOW_SELF_COLLECTION',
        'concat_phone_number',
        'mall_name',
        'home_order_category_id',
        'wifi_ssid',
        'wifi_password',
        'mall_avatar',
      ].join(','),
    }))

    this.checkLogin().catch(() => {
      // 未登录
      this.goToLoginPage()
    })
  }

  checkLogin = () => new Promise(async (resolve, reject) => {
    try {
      const token = Taro.getStorageSync('token')
      // 本地没有登录 token
      if (!token) {
        return reject()
      }

      await this.checkSession()

      // 校验 token 是否有效
      const res = await checkToken()
      // token 失效，清除本地 token 重新授权
      if (res.code !== 0) {
        Taro.removeStorageSync('token')
        await this.showToastP({
          title: '登录失效，请重新授权~',
          icon: 'loading',
          duration: 1000,
        })
        return reject()
      }

      // 获取用户详情
      const userDetail = await store.dispatch(getUserDetail())

      // 强制用户绑定手机号
      if (requireBindMobile && !userDetail.mobile) {
        await this.showToastP({
          title: '需要授权并绑定手机号~',
          icon: 'none',
          duration: 2000,
        })
        return reject()
      }

      resolve()
    } catch (e) {
      reject(e)
    }
  })

  // 检查用户授权的 session
  checkSession = () => new Promise((resolve, reject) => {
    Taro.checkSession({
      success: resolve,
      fail: reject,
    })
  })

  showToastP = options => new Promise(resolve => {
    showToast({
      ...options,
      complete: resolve,
    })
  })

  componentDidHide () {}

  componentDidCatchError () {}

  // 更新网络状态
  updateNetworkStatus = async isConnected => {
    await store.dispatch({
      type: UPDATE_GLOBAL_DATA,
      data: {
        isConnected,
      },
    })
  }

  goToLoginPage = () => {
    // Taro.removeStorageSync('token')
    setTimeout(() => {
      Taro.navigateTo({
        url: "/pages/authorize/index",
      })
    }, 300)
  }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
