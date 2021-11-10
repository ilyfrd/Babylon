<template>
  <div style="display: flex; position: relative;">
    <SubLine
      id="speedCurList"
      title="瞬时速度变化曲线"
      :speed-list="speedCurList"
      unit="km/h"
    />
    <div style="flex: 1; position: relative">
      <SubLine
        id="speedAvgList"
        title="窗口平均速度变化曲线"
        :speed-list="speedAvgList"
        unit="km/h"
      />
      <div style="position: absolute; top: 5px; right: 5px">
        <span style="font-size: 14px">时间窗口:</span>
        <el-select v-model="value" size="mini" placeholder="请选择时间窗口" style="width:80px" @change="change">
          <el-option
            v-for="item in timeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
    </div>
    <SubLine
      id="angularZ"
      title="实时角速度变化曲线"
      :speed-list="angularZ"
      unit="弧度/s"
    />
    <ScrollLineChart
      v-show="flag"
      id="allLineDataRuntime"
      :line-data="allLineData"
      style="background:rgba(255, 255, 255, 1); border: #000 solid 1px; border-radius:50px; z-index:999; position:absolute; left:0; bottom:0;  width: 100%; height: 400px; min-height: 400px; padding-right:400px"
    />
    <div v-if="flag" id="main2" style="background:rgba(0,0,0,0.618); border-radius:50px; z-index:999; position:absolute; right:0; bottom:0;  width: 400px; height: 400px; min-height: 400px" />
  </div>
</template>

<script>
// import { WsScoreUrl } from '@/utils'
import SubLine from './subLine'
import ScrollLineChart from '../components/ScrollLineChart'
import { changeSpeedAvgSpan, getTaskAllLineData } from '@/api'

export default {
  components: {
    SubLine,
    ScrollLineChart
  },
  props: {
    sessionId: {
      type: String,
      default: ''
    },
    testCar: {
      type: String,
      default: ''
    },
    carSpeedList: {
      type: Object,
      default: () => {}
    },
    scoreData: {
      type: Object,
      default: () => {}
    },
    fieldId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      speedCurList: [],
      speedAvgList: [],
      angularZ: [],
      value: 3,
      timeOptions: [
        {
          label: '3秒',
          value: 3
        },
        {
          label: '5秒',
          value: 5
        },
        {
          label: '10秒',
          value: 10
        }
      ],
      flag: true,
      scoreDataTmp: {},
      allLineData: []
    }
  },
  watch: {
    sessionId(val) {
      this.value = 3
      this.flag = false
      // if (!this.websock) {
      //   this.initWebSocket()
      // } else {
      //   this.scoreData = {
      //     economyScore: 100,
      //     efficiencyScore: 100,
      //     fitnessScore: 100,
      //     predictabilityScore: 100,
      //     safetyScore: 100,
      //     stabilityScore: 100
      //   }
      //   this.websocketonopen()
      // }
    },
    scoreData(val) {
      if (val && JSON.stringify(val) !== '{}') {
        this.flag = true
        setTimeout(() => {
          this.scoreDataTmp = val
          this.initChart()
          // 获取完整数据
          this.getTaskAllLine()
        }, 100)
      }
    },
    carSpeedList(val) {
      this.speedCurList = val.speedCur
      this.speedAvgList = val.speedAvg
      this.angularZ = val.angularZ
    }
  },
  mounted() {
  },
  destroyed() {
    // this.websock && this.websock.close()
  },
  methods: {
    // 接收ws部分，part 1
    // initWebSocket() {
    //   if (this.sessionId && this.testCar) {
    //     // 初始化weosocket
    //     const wsuri = WsScoreUrl
    //     this.websock = new WebSocket(wsuri)
    //     this.websock.onmessage = this.websocketonmessage
    //     this.websock.onopen = this.websocketonopen
    //     this.websock.onerror = this.websocketonerror
    //     this.websock.onclose = this.websocketclose
    //   }
    // },
    // websocketonopen() {
    //   // 连接建立之后执行send方法发送数据
    //   const actions = {
    //     sessionId: this.sessionId,
    //     roleId: this.testCar
    //   }
    //   this.websocketsend(JSON.stringify(actions))
    // },
    // websocketonerror() {
    //   // 连接建立失败重连
    //   console.log('ws创建失败')
    // },
    // websocketonmessage(e) {
    //   // 数据接收
    //   if (!e.data || e.data === 'null') {
    //     return
    //   }
    //   this.scoreData = JSON.parse(e.data)
    //   this.initChart()
    // },
    // websocketsend(Data) {
    //   // 数据发送
    //   this.websock.send(Data)
    // },
    // websocketclose(e) {
    //   // 关闭
    //   console.log('断开连接', e)
    // },
    // part 2
    initChart() {
      if (!this.flag) {
        return
      }
      const {
        economyScore = 0,
        efficiencyScore = 0,
        fitnessScore = 0,
        predictabilityScore = 0,
        safetyScore = 0,
        stabilityScore = 0
      } = this.scoreDataTmp
      const option = {
        title: {
          text: '各指标得分情况',
          left: '50px',
          textStyle: {
            color: '#fff'
          }

        },
        tooltip: {},
        radar: {
          // shape: 'circle',
          name: {
            textStyle: {
              color: '#fff',
              backgroundColor: '#999',
              borderRadius: 3,
              padding: [3, 5]
            }
          },
          indicator: [
            { name: '经济性', max: 100 },
            { name: '效率', max: 100 },
            { name: '舒适性', max: 100 },
            { name: '预见性', max: 100 },
            { name: '安全性', max: 100 },
            { name: '稳定性', max: 100 }
          ]
        },
        series: [
          {
            name: '性能得分',
            type: 'radar',
            areaStyle: {},
            data: [
              {
                value: [
                  economyScore,
                  efficiencyScore,
                  fitnessScore,
                  predictabilityScore,
                  safetyScore,
                  stabilityScore
                ],
                name: '任务'
              }
            ]
          }
        ]
      }
      // 基于准备好的dom，初始化echarts实例
      // eslint-disable-next-line no-undef
      var myChart = echarts.init(document.getElementById('main2'))
      myChart.setOption(option)
    },
    // part3
    change() {
      changeSpeedAvgSpan(this.sessionId, this.testCar, this.value, this.fieldId)
    },
    // part4 获取数据
    async getTaskAllLine() {
      if (!this.sessionId || !this.testCar) {
        return
      }
      const params = {
        pageNo: 1,
        pageSize: 10,
        samplingInterval: 1
      }
      const res = await getTaskAllLineData(this.sessionId, this.testCar, params)
      const count = res.data.total
      const samplingInterval = count > 1000 ? Math.round(count / 1000) : 1
      // 二次请求
      params.samplingInterval = samplingInterval
      params.pageSize = 1000
      const res2 = await getTaskAllLineData(this.sessionId, this.testCar, params)
      this.allLineData = res2.data.data || []
    }
  }
}
</script>
