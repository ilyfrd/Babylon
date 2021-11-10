<template>
  <div :id="id" style="flex: 1;width: 100%;height:auto;min-height:400px" />
</template>

<script>

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
    unit: {
      type: String,
      default: ''
    },
    speedList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      xList: [],
      yList: []
    }
  },
  watch: {
    speedList(val) {
      const xList = []
      const yList = []
      for (const item of val) {
        xList.push(item.x)
        yList.push(this.id === 'angularZ' ? Math.round(item.y * 100) / 100 : 3.6 * Number(item.y)) // 速度转换成km/h
      }
      this.xList = xList
      this.yList = yList
      setTimeout(() => {
        this.initChart()
      }, 200)
    }
  },
  mounted() {
    if (!this.id) {
      return
    }
    this.initChart()
  },
  methods: {
    initChart() {
      // eslint-disable-next-line no-undef
      var myChart = echarts.init(document.getElementById(this.id))
      var option = {
        title: {
          text: this.title
        },
        xAxis: {
          type: 'category',
          data: this.xList,
          name: 't'
        },
        yAxis: {
          type: 'value',
          name: this.unit,
          max: this.id === 'angularZ' ? 'dataMax' : 40
        },
        series: [{
          data: this.yList,
          showSymbol: false,
          type: 'line',
          smooth: true
        }]
      }
      myChart.setOption(option)
    }
  }
}
</script>
