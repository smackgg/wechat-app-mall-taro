declare module '*.png'
declare module '*.gif'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'
declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.sass'
declare module '*.styl'

declare global {
    interface Window { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: Function }
}

// @ts-ignore
export declare const process: {
    env: {
        TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt'
        [key: string]: any
    }
}
