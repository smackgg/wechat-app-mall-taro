export default {
  pages: [
    'pages/index/index',
    'pages/authorize/index',
    'pages/account/index',
    // 'pages/account/extinfo',
    'pages/product-detail/index',
    // 'pages/product-detail/share',
    // 'pages/product-detail/reputations',
    // // 'pages/checkout/index',
    'pages/address-edit/index',
    'pages/address-select/index',
    // // 'pages/order-list/index',
    // // 'pages/order-detail/index',
    'pages/category/index',
    'pages/asset/index',
    // // 'pages/coupons/index',
    // // 'pages/score-shop/index',
    // // 'pages/reputation/index',
    'pages/shop-cart/index',
    'pages/recharge/index',
    // 'pages/entry/index',
    // 'pages/vip-center/index',
    // 'pages/vip-center/my',
    // 'pages/vip-center/potences',
    'pages/contact/index',
    'pages/wifi/index',
    'pages/location/index'
  ],
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
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '',
    navigationBarTextStyle: 'black'
  },
  navigateToMiniProgramAppIdList: ['wx60d176f873ca2d67', 'wxcefbc3693001e0d2']
}
