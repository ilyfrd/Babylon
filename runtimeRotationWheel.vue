<template>
  <div :id="id" style="flex: 1; height: auto; min-height: 260px" />
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
      value: 0
    }
  },
  watch: {
    chartData(val) {
      // 业务逻辑中，-50到50，逆时针
      // 本案例中，0到1，顺时针
      if (val < -50) {
        val = -50
      }
      if (val > 50) {
        val = 50
      }
      const temp = (val + 50) / 100
      this.value = 1 - temp
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
        animation: false,
        series: [
          {
            type: 'gauge',
            startAngle: 270,
            endAngle: -90,
            min: 0,
            max: 1,
            splitNumber: 8,
            axisLine: {
              lineStyle: {
                width: 6,
                color: [
                  [0.25, '#FF6E76'],
                  [0.5, '#FDDD60'],
                  [0.75, '#58D9F9'],
                  [1, '#7CFFB2']
                ]
              }
            },
            pointer: {
              length: '24%',
              width: 12,
              itemStyle: {
                color: 'auto'
              }
            },
            axisTick: {
              length: 12,
              lineStyle: {
                color: 'auto',
                width: 2
              }
            },
            splitLine: {
              length: 20,
              lineStyle: {
                color: 'auto',
                width: 5
              }
            },
            axisLabel: {
              color: '#333',
              fontSize: 20,
              distance: -60,
              formatter: function(value) {
                if (value === 0.625) {
                  return '右'
                } else if (value === 0.375) {
                  return '左'
                }
              }
            },
            title: {
              offsetCenter: [0, '-30%'],
              color: '#333',
              fontSize: 16
            },
            detail: {
              offsetCenter: [0, '0%'],
              valueAnimation: true,
              formatter: function(value) {
                return ''
              },
              color: 'auto'
            },
            data: [
              {
                value: this.value,
                name: '方向盘转动'
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
