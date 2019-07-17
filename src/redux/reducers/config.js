import {
  GET_VIP_LEVEL_SUCCESS,
  GET_SYSTEM_CONFIG_SUCCESS,
  GET_BANNERS_SUCCESS,
  GET_PROVINCE_SUCCESS,
} from '../actions/config'

const INITIAL_STATE = {
  vipLevel: 0,
  mallName: '', // 商城名称
  rechargeAmountMin: undefined, // 充值最小金额
  allowSelfCollection: '', // 是否允许到店自提
  banners: {}, // banner
  provinces: [],
}

export default function config(state = INITIAL_STATE, action) {
  switch (action.type) {
    case GET_VIP_LEVEL_SUCCESS:
      return {
        ...state,
        vipLevel: action.data,
      }
    case GET_SYSTEM_CONFIG_SUCCESS:
      return {
        ...state,
        ...(action.data || {}),
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
        [key]: (data || []).map(item=> item.name),
        // 处理字母索引选择器数据
        [`${key}Indexs`]: Object.values(data.reduce((pre, item) => {
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
        }, {})),
      }
    }
    default:
      return state
  }
}
