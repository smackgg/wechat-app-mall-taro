
import Taro from '@tarojs/taro'
import { AnyAction } from 'redux'

import {
  GET_VIP_LEVEL_SUCCESS,
  GET_SYSTEM_CONFIG_SUCCESS,
  GET_BANNERS_SUCCESS,
  GET_PROVINCE_SUCCESS,
} from '../actions/config'

const rechargeAmountMin = Taro.getStorageSync('recharge_amount_min') || 0
const allowSelfCollection = !!Taro.getStorageSync('ALLOW_SELF_COLLECTION')

interface InitialState {
  vipLevel: number,
  systemConfig: { [key: string]: string },
  index_video_1: string, // 首页封面视频（短）
  index_video_2: string, // 首页封面视频 (长)
  mallName: string, // 商城名称
  rechargeAmountMin: number, // 充值最小金额
  // recharge_amount_min
  // ALLOW_SELF_COLLECTION
  allowSelfCollection: boolean, // 是否允许到店自提
  banners: { [key: string]: any }, // banner
  provinces: any[],
  citys: any[],
  districts: any[],
}

const INITIAL_STATE: InitialState = {
  vipLevel: 0,
  systemConfig: {},
  index_video_1: '', // 首页封面视频（短）
  index_video_2: '', // 首页封面视频 (长)
  mallName: '', // 商城名称
  rechargeAmountMin, // 充值最小金额
  // recharge_amount_min
  // ALLOW_SELF_COLLECTION
  allowSelfCollection, // 是否允许到店自提
  banners: {}, // banner
  provinces: [],
  citys: [],
  districts: [],
}

const REMOVE_PROVINCE = ['澳门特别行政区', '台湾省', '香港特别行政区']

export default function config(state = INITIAL_STATE, action: AnyAction): InitialState {
  switch (action.type) {
    case GET_VIP_LEVEL_SUCCESS:
      return {
        ...state,
        vipLevel: action.data,
      }
    case GET_SYSTEM_CONFIG_SUCCESS:
      return {
        ...state,
        systemConfig: (action.data || []).reduce((pre: { [key: string]: string }, item: {
          value: string,
          remark: string,
          key: string,
        }) => {
          const { key } = item
          pre[key] = item.value
          if (key === 'ALLOW_SELF_COLLECTION' || key === 'recharge_amount_min') {
            Taro.setStorage({
              key,
              data: item.value,
            })
          }
          return pre
        }, {}),
      }
    case GET_BANNERS_SUCCESS:
      return {
        ...state,
        banners: {
          [action.key]: action.data,
        },
      }
    case GET_PROVINCE_SUCCESS: {
      const { key, data } = action
      return {
        ...state,
        // 处理字母索引选择器数据
        [key]: Object.values(data.reduce((pre: typeof data, item: { name: string, firstLetter: string }) => {
          if (REMOVE_PROVINCE.includes(item.name)) {
            return pre
          }
          const firstLetter = item.firstLetter.toLocaleUpperCase()
          const nItem = {
            ...item,
            key: key.slice(0, key.length - 1),
          }
          if (!pre[firstLetter]) {
            pre[firstLetter] = {
              title: firstLetter,
              key: firstLetter,
              items: [nItem],
            }
          } else {
            pre[firstLetter].items.push(nItem)
          }
          return pre
        }, {})).sort((a: any, b: any) => a.title > b.title ? 1 : -1),
      }
    }
    default:
      return state
  }
}
