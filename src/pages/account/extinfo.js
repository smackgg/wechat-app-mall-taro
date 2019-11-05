import Taro, { Component } from '@tarojs/taro'
import { View, Picker, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { AtButton, AtInput } from 'taro-ui'
import jobCategory from '@/third-utils/jobCategory'
import { modifyUserInfo } from '@/services/user'
import { showToast, cError } from '@/utils'

import './extinfo.scss'

@connect(({ user: { userDetail } }) => ({
  userDetail,
}))
export default class ExtInfo extends Component {
  config = {
    navigationBarTitleText: '个人信息',
  }

  state = {
    form: {
    },
    jobCategory: [jobCategory],
    editing: false,
  }

  componentDidMount() {
    this.initFormData(this.props.userDetail)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userDetail !== this.props.userDetail) {
      this.initFormData(nextProps.userDetail)
    }
  }

  initFormData = userDetail => {
    const { ext } = userDetail
    this.setState({
      form: {
        ...ext,
      },
    })
  }

  // 表单变化
  handleChange = (key, e) => {
    this.setState({
      form: {
        ...this.state.form,
        [key]: e.target ? e.target.value : e,
      },
      editing: true,
    })
  }

  // 处理工作岗位变换
  handleJobChange = (index, e) => {
    let { form: { job }, form, jobCategory: jobs } = this.state
    // 从接口拉下来得数据，直接清空
    if (typeof job === 'string' || !job) {
      job = []
    }

    const { label, children } = jobs[index][e.target.value]
    job[index] = label
    if (children) {
      jobs[index + 1] = children
      jobs = jobs.slice(0, index + 2)
    } else {
      jobs = jobs.slice(0, index + 1)
    }

    this.setState({
      form: {
        ...form,
        job: job.slice(0, index + 1),
      },
      jobCategory: jobs,
      editing: true,
    })
  }

  // 薪资变化
  handleSalaryChange = e => {
    this.setState({
      form: {
        ...this.state.form,
        salary: this.salarys[e.target.value],
      },
      editing: true,
    })
  }

  // 表单提交
  onSubmit = async () => {
    const {
      birthday,
      mail,
      salary,
      name,
      job,
    } = this.state.form
    const { jobs } = this.state

    if (!birthday) {
      Taro.showToast({
        title: '请选择出生日期',
        icon: 'none',
      })
      return
    }

    if (!salary) {
      Taro.showToast({
        title: '请选择薪酬范围',
        icon: 'none',
      })
      return
    }

    if (!name) {
      Taro.showToast({
        title: '请填写真实姓名',
        icon: 'none',
      })
      return
    }

    if (!job || job.length < jobs.length) {
      Taro.showToast({
        title: '请选择职业岗位',
        icon: 'none',
      })
      return
    }

    const data = {
      birthday,
      mail,
      salary,
      name,
      job: typeof job === 'string' ? job : job.join('-'),
    }

    // 更新用户信息
    const [error] = await cError(modifyUserInfo({
      nick: this.props.userDetail.nick,
      extJsonStr: JSON.stringify(data),
    }))

    // 错误处理
    if (error) {
      Taro.showToast({
        title: '出错啦~请稍候重试',
        icon: 'none',
      })
      return
    }
    showToast({
      title: '修改成功~',
      icon: 'none',
      mask: true,
      complete: () => {
        // 跳转回之前的页面
        Taro.navigateBack()
      },
    })
  }

  salarys = [
    '10万以下',
    '10-30万',
    '30-50万',
    '50-100万',
    '100万以上',
  ]

  render() {
    const {
      userDetail: {
        nick,
        province,
        city,
      },
    } = this.props

    const {
      form: {
        birthday,
        mail,
        salary,
        name,
        job,
      },
      jobCategory: jobs,
      editing,
    } = this.state

    const isExtJob = typeof job === 'string'

    return (
      <View className="container">
        <AtInput
          name="nick"
          title="昵称"
          type="text"
          value={nick}
          disabled
        />
        <AtInput
          name="region"
          title="地区"
          type="text"
          value={`${province} ${city}`}
          disabled
        />
        <AtInput
          name="name"
          title="姓名"
          type="text"
          placeholder="请输入姓名"
          value={name}
          onChange={this.handleChange.bind(this, 'name')}
        />
        <AtInput
          name="mail"
          title="邮箱"
          type="text"
          placeholder="联系邮箱(非必填)"
          value={mail}
          onChange={this.handleChange.bind(this, ' mail')}
        />
        <View className="picker-item">
            <View className="label">出生日期</View>
          <Picker mode="date" onChange={this.handleChange.bind(this, 'birthday')}>
            <View className="picker">
              {birthday || <Text className="text">请选择日期</Text>}
            </View>
          </Picker>
        </View>

        <View className="picker-item">
          <View className="label">薪资水平</View>
          <Picker mode="selector" range={this.salarys} onChange={this.handleSalaryChange}>
            <View className="picker">
              {salary || <Text className="text">请选择薪资范围</Text>}
            </View>
          </Picker>
        </View>

        <View className="picker-item">
          <View className="label">职业</View>
          {
            jobs.map((jobItem, index) => <Picker key={index} mode="selector" range={jobItem} onChange={this.handleJobChange.bind(this, index)} rangeKey="label">
              <View className="picker">
                {
                  isExtJob && <Text className="text">{job}</Text>
                }
                {!isExtJob && (job[index] || <Text className="text">请选择</Text>)}
              </View>
            </Picker>)
          }
        </View>

        {/* submit button */}
        {editing && <AtButton className="button primary" type="primary" onClick={this.onSubmit}>确认修改</AtButton>}
      </View>
    )
  }
}

