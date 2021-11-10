<template>
  <div :id="id" style="flex: 1; width: 100%; height: auto; min-height: 320px" />
</template>

<script>
// import { getSyncData, setSyncData } from '@/utils'
export default {
  props: {
    id: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    speed: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      speedCur: 0,
      speedAvg: 0, // 弃用
      acc: 0,
      angularAcc: 0
    }
  },
  watch: {
    async speed(val) {
      const { speedCur, acc, angularAcc } = val
      // if (speedAvg === undefined) {
      //   const speedAvgCache = await getSyncData('speedAvg')
      //   this.speedAvg = speedAvgCache
      // } else {
      //   this.speedAvg = 3.6 * speedAvg
      //   setSyncData('speedAvgCache', this.speedAvg)
      // }
      this.speedCur = 3.6 * speedCur
      this.acc = acc // 1m/s等到3.6km/h
      this.angularAcc = angularAcc || 0
      this.initChart()
    }
  },
  mounted() {
    this.initChart()
  },
  methods: {
    initChart() {
      // eslint-disable-next-line no-undef
      var myChart2 = echarts.init(document.getElementById(this.id))
      var option2 = {
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%'
        },
        animation: false,
        series: [
          {
            center: ['24%', '35%'],
            radius: '70%',
            type: 'gauge',
            startAngle: -120,
            endAngle: -345,
            min: -10,
            max: 10,
            splitNumber: 10,
            z: 2,
            title: {
              offsetCenter: [0, '-30%'],
              fontSize: 16
            },
            detail: {
              valueAnimation: false,
              formatter: '{value} 弧度/s²',
              fontSize: 18
            },
            data: [
              {
                value: Math.round(this.angularAcc * 100) / 100,
                name: '角速度加速度'
              }
            ]
          },
          {
            center: ['50%', '65%'],
            min: 0,
            max: 60,
            splitNumber: 12,
            z: 1,
            type: 'gauge',
            title: {
              offsetCenter: [0, '-30%'],
              fontSize: 16
            },
            progress: {
              show: true
            },
            detail: {
              valueAnimation: false,
              formatter: '{value} km/h',
              fontSize: 20
            },
            data: [
              {
                value: Math.round(this.speedCur * 100) / 100,
                name: '瞬时速度'
              }
            ]
          },
          {
            center: ['76%', '35%'],
            radius: '70%',
            type: 'gauge',
            startAngle: 165,
            endAngle: -60,
            min: -20,
            max: 30,
            splitNumber: 5,
            z: 3,
            title: {
              offsetCenter: [0, '-30%'],
              fontSize: 16
            },
            detail: {
              formatter: '{value} m/s²',
              fontSize: 18
            },
            data: [
              {
                value: Math.round(this.acc * 100) / 100,
                name: '加速度'
              }
            ]
          }
        ]
      }
      myChart2.setOption(option2)
    }
  }
}
</script>
