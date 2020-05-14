Taro 3.0 beta 版本

## scripts
```json
"script": {
    "build:weapp": "taro build --type weapp", // 微信小程序 build
    "build:swan": "taro build --type swan",
    "build:alipay": "taro build --type alipay",
    "build:tt": "taro build --type tt",
    "build:h5": "taro build --type h5",
    "build:rn": "taro build --type rn",
    "build:qq": "taro build --type qq",
    "build:quickapp": "taro build --type quickapp",
    "dev:weapp": "npm run build:weapp -- --watch", // 微信小程序 dev
    "dev:swan": "npm run build:swan -- --watch",
    "dev:alipay": "npm run build:alipay -- --watch",
    "dev:tt": "npm run build:tt -- --watch",
    "dev:h5": "npm run build:h5 -- --watch",
    "dev:rn": "npm run build:rn -- --watch",
    "dev:qq": "npm run build:qq -- --watch",
    "dev:quickapp": "npm run build:quickapp -- --watch",
    "lint": "eslint ./ --ext .js,.jsx,.ts,.tsx",
    "lint-fix": "npm run lint -- --fix"
}
```
