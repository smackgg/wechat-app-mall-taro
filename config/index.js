'use strict'
const path = require('path')
const { theme } = require('../shopConfig')

var config = {
  alias: {
    '@': 'src/',
    '@root': './',
  },
  projectName: 'wechat-app-mall-taro',
  date: '2019-6-18',
  designWidth: 750,
  deviceRatio: {
    '640': 1.17,
    '750': 1,
    '828': 0.905,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: {
    babel: {
      sourceMap: true,
      presets: [['env', {
        modules: false,
      }]],
      plugins: ['transform-decorators-legacy', 'transform-class-properties', 'transform-object-rest-spread'],
    },
    sass: {
      resource: path.resolve(__dirname, '..', 'src/var.scss'),
      projectDirectory: path.resolve(__dirname, '..'),
      data: Object.keys(theme).reduce((str, key) => str += `${key}: ${theme[key]} !default;`, ''),
    },
  },
  defineConstants: {},
  copy: {
    patterns: [
      { from: './shopConfig.js', to: 'dist/shopConfig.js' },
    ],
  },
  weapp: {
    module: {
      postcss: {
        autoprefixer: {
          enable: true,
          config: {
            browsers: ['last 3 versions', 'Android >= 4.1', 'ios >= 8']
          },
        },
        pxtransform: {
          enable: true,
          config: {},
        },
        url: {
          enable: true,
          config: {
            limit: 10240, // 设定转换尺寸上限
          },
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    module: {
      postcss: {
        autoprefixer: {
          enable: true,
          config: {
            browsers: ['last 3 versions', 'Android >= 4.1', 'ios >= 8'],
          },
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
  },
}

module.exports = function (merge) {
  {
    return merge({}, config, require("./dev.js"))
  }
  return merge({}, config, require("./prod.js"))
}
