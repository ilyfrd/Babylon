<template>
  <div :id="id" style="flex: 1; height: auto; min-height: 80px; opacity: 0.6" />
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default: ''
    },
    chartData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      pedal: 0,
      brake: 0
    }
  },
  watch: {
    chartData(val) {
      const { pedal, brake } = val
      this.pedal = pedal * 100
      this.brake = brake * 100
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
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: 0,
          right: '30px',
          bottom: 0,
          top: '10px',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          position: 'top',
          min: 0,
          max: 100,
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'category',
          data: ['油门', '刹车'],
          color: '#fff'
        },
        axisLabel: {
          color: '#fff'
        },
        series: [
          {
            type: 'bar',
            data: [
              {
                value: this.pedal,
                itemStyle: {
                  color: '#FDDD60'
                }
              },
              {
                value: this.brake,
                itemStyle: {
                  color: '#FF6E76'
                }
              }
            ],
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(180, 180, 180, 0.2)'
            }
          }
        ]
      }
      myChart.setOption(option)
    }
  }
}
</script>
