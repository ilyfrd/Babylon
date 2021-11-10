<template>
  <div :id="id" style="flex: 1;width: 100%;height:auto;min-height:320px" />
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
    speed: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
    }
  },
  watch: {
    speed(val) {
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
        series: [{
          name: this.title,
          type: 'gauge',
          progress: {
            show: true
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}'
          },
          data: [{
            value: Math.round(this.speed * 100) / 100,
            name: this.title
          }]
        }]
      }
      myChart2.setOption(option2)
    }
  }
}
</script>
