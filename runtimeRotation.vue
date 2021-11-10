<template>
  <div :id="id" style="flex: 1; height: auto; min-height: 400px" />
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default: ''
    },
    chartData: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      degree: 0
    }
  },
  watch: {
    chartData(val) {
      if (val < 0) {
        val += 360
      }
      // 转换，业务逻辑中0表示正东，逆时针
      // 本案例中，0表示正东，顺时针
      const temp = 360 - val
      this.degree = Math.round(temp * 100) / 100
      this.initChart()
    }
  },
  mounted() {
    this.initChart()
  },
  methods: {
    initChart() {
      // eslint-disable-next-line no-undef
      var myChart = echarts.init(document.getElementById(this.id))
      var option = {
        series: [
          {
            type: 'gauge',
            startAngle: 0,
            splitNumber: 8,
            endAngle: 360,
            min: 0,
            max: 360,
            center: ['50%', '50%'],
            detail: {
              fontSize: 22,
              valueAnimation: true,
              offsetCenter: [0, '-25%'],
              formatter: function(temp) {
                const value = Math.round(temp * 100) / 100
                let msg
                if (value > 0 && value < 90) {
                  msg = '东偏南' + value.toFixed(1) + '°'
                } else if (value > 90 && value < 180) {
                  msg = '西偏南' + Number(180 - value).toFixed(1) + '°'
                } else if (value > 180 && value < 270) {
                  msg = '西偏北' + Number(value - 180).toFixed(1) + '°'
                } else if (value > 270 && value < 360) {
                  msg = '东偏北' + Number(360 - value).toFixed(1) + '°'
                } else {
                  msg = '正' + ['东', '南', '西', '北'][value / 90]
                }
                return msg + '方向'
              }
            },
            axisLabel: {
              fontSize: 20,
              distance: -50,
              formatter: function(value) {
                if (value === 0) {
                  return '东'
                } else if (value === 45) {
                  return '东南'
                } else if (value === 90) {
                  return '南'
                } else if (value === 135) {
                  return '西南'
                } else if (value === 180) {
                  return '西'
                } else if (value === 225) {
                  return '西北'
                } else if (value === 270) {
                  return '北'
                } else if (value === 315) {
                  return '东北'
                }
              }
            },
            data: [
              {
                value: this.degree,
                name: '在地理坐标系下方向'
              }
            ]
          }
        ]
      }
      myChart.setOption(option)
    }
  }
}
</script>
