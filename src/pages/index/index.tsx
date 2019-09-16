import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd } from '@/redux/actions/counter'

import './index.less'

// #region ????
//
// ?? typescript ????????????? Props ??? Taro.Component ?? props ??
// ?????? connect ???????? interface ????? Taro.Component ??? props
// ??????????? IDE ?????
// ???????????
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

type PageStateProps = {
  counter: {
    num: number
  }
}

var aaa = 1

type PageDispatchProps = {
  add: () => void
  dec: () => void
  asyncAdd: () => any
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
  props: IProps;
}

@connect(({ counter }) => ({
    counter,
}), (dispatch) => ({
    add () {
        dispatch(add())
    },
    dec () {
        dispatch(minus())
    },
    asyncAdd () {
        dispatch(asyncAdd())
    },
}))
class Index extends Component {

    /**
   * ??config??????: Taro.Config
   *
   * ?? typescript ?? object ???????? Key ?????
   * ??? navigationBarTextStyle: 'black' ?????????? string
   * ????? navigationBarTextStyle: 'black' | 'white' ????, ????????
   */
    config: Config = {
        navigationBarTitleText: '??',
    }

    state = {
        a: 1,
    }

    componentWillReceiveProps (nextProps) {
        console.log(this.state.a)
    }

    componentWillUnmount () { }

    componentDidShow () {
        // console.log(this.state.a);
        this.fn('fds')
    }

    componentDidHide () { }

    public fn = (fsdf) => {
        console.log('b: ' + fsdf)
    }

    render () {
        return (
            <View className="index">
                <Button className="add_btn" onClick={this.props.add}>+</Button>
                <Button className="dec_btn" onClick={this.props.dec}>-</Button>
                <Button className="dec_btn" onClick={this.props.asyncAdd}>async</Button>
                <View><Text>{this.props.counter.num}</Text></View>
                <View><Text>Hello, World</Text></View>
            </View>
        )
    }
}

// #region ????
//
// ?????????????? Taro.Component ?????????? props ??
// ?????????? Ts ??????? JSX ??????
//
// #endregion

export default Index as ComponentClass<PageOwnProps, PageState>
