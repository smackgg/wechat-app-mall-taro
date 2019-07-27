module.exports = {
  version: "6.8.1",
  note: '开票申请页面增加转发、可设置扩展属性',
  subDomain: "hsjcy", // https://admin.it120.cc 登录后台首页的专属域名
  appid: "wxa46b09d413fbcaff", // 您的小程序的appid，购物单功能需要使用
  shareProfile: '百款精品商品，总有一款适合您', // 首页转发的时候话术
  requireBindMobile: true, // 是否强制绑定手机号码才能使用
  theme: {
    // 整站主题色
    '$color-brand': '#d6b44c',
    '$color-brand-light': '#e0c779',
    '$color-brand-dark': '#ab903d',

    // 会员中心、登录页面主题色
    '$color-brand2': '#181923',
    // '$color-brand-light': '#52535a',
    // '$color-brand-dark': '#13141c',
  }, // 主题颜色 详情见 https://nervjs.github.io/taro-ui-theme-preview/
}
