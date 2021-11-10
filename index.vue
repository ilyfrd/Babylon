<template>
  <div id="outside" class="normalBox" style="background: #33334C; min-height:500px; max-height: 700px; border-radius: 50px;width: 100%;height: 100%">
    <!-- <div
      id="test"
      style="width: 100px; heigth: 20px; background: #ccc;"
      class="cover"
    /> -->
    <canvas id="renderCanvas" class="canvas" :height="canvasOutheight" :style="{maxHeight: canvasOutheight}" />
  </div>
</template>

<script>
// 备注：
// this.carMeta.bottom_center.x/y/z, this.carMeta.size.x/y/z，获取到底部中心点和长宽高
// 目前没有海拔信息，长宽高一点，即用bottom_center.x/y即可
import {
  Engine,
  Scene,
  Vector3,
  Color3,
  Color4,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  PointsCloudSystem
} from '@babylonjs/core/Legacy/legacy'
import {
  convertToClientLocation,
  switchPosition,
  switchRotation
} from './renderer/utils.js'
import {
  constructArcRotateCamera,
  updateArcRotateCamera
} from './renderer/arcRotateCamera.js'
import {
  constructFreeCamera
} from './renderer/freeCamera.js'
import {
  constructVtsMap
} from './renderer/vtsMap.js'
import {
  constructBackground
} from './renderer/background.js'
import {
  constructDestinationPoint
} from './renderer/destinationPoint.js'
import {
  constructTestCar,
  updateTestCar
} from './renderer/testCar.js'
import {
  prepareKeyframeDatasForTestee,
  prepareKeyframeDatasForNpcList,
  interpolateForVehicle,
  interpolateForNpcList
} from './renderer/interpolation.js'
import {
  flashTrafficLight,
  prepareResources,
  handleTrafficLightGroupsMessage
} from './renderer/trafficLight.js'
import {
  updatePlanPath
} from './renderer/planPath.js'
import { DefaultOffset } from '../../../utils'

import {
  showWorldAxis
} from './renderer/worldCoordinateSystem.js'



export default {
  name: 'LeftUp',
  props: {
    mockFlag: {
      type: Number,
      default: 0
    },
    carMeta: {
      type: Object,
      default: () => {}
    },
    mapMeta: {
      type: Object,
      default: () => {}
    },
    npcList: {
      type: Array,
      default: () => []
    },
    lightList: {
      type: Array,
      default: () => []
    },
    trajectoryPoints: {
      type: Array,
      default: () => []
    },
    destPosition: {
      type: Object,
      default: () => {}
    },
    carRotation: {
      type: Object,
      default: () => {}
    },
    cameraMode: {
      type: Number,
      default: 1
    },
    cameraSpeed: {
      type: Number,
      default: 40
    },
    resetCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      sceneIns: null,
      freeCameraIns: null,
      arcRotateCameraIns: null,
      canvas: null,
      destinationMarker: null,
      canvasOutheight: 600,
      testeeData: {
        testCar: null, // 测试车
        height: 0,
        serverBeginTime: 0,
        clientBeginTime: 0,
        clientDelayReadTime: 1000,
        dataReady: false,
        keyframeDatas: [],
        interpedLocation: null,
        interpedRotation: null,
        localTrajectoryData: []
      },
      npcMap: new Map(),
      cameraChanged: false,
      flag: false,
      trafficLightAssemblyMap: new Map(),
      roadLine: [],
      offset: {},
      pathPoints: []
    }
  },
  watch: {
    carMeta(val) {
      if (val.size && !this.testeeData.testCar && !this.flag) {
        this.flag = true
        // 如果测试车实例不存在，且长宽高数据已到位，则去画车
        setTimeout(() => {
          constructTestCar(this, this.offset)
        }, 150)
        this.testeeData.height = val.size.z
        this.testeeData.localTrajectoryData = val.localTrajectoryData
      }
      this.testeeData.bottom_center = val.bottom_center
      prepareKeyframeDatasForTestee(this, val)
    },
    mapMeta(val) {
      this.roadLine = val
      this.offset = val.offset || DefaultOffset
      setTimeout(() => {
        constructVtsMap(this, this.roadLine)
        constructDestinationPoint(this, this.destPosition, this.offset)
        console.log(this.lightList.length, val)
        handleTrafficLightGroupsMessage(this, this.lightList, val)
      }, 200)
    },
    npcList(val) {
      prepareKeyframeDatasForNpcList(this, val)
    },
    lightList(val) {
      // console.log(val, 'traffic light')
    },
    trajectoryPoints(val) {
      this.pathPoints = [].concat(val)
    },
    // destPosition(val) {
    //   setTimeout(() => {
    //     constructDestinationPoint(this, val, this.offset)
    //   }, 500)
    // },
    cameraMode(val) {
      // 相机模式改变，同GUI
      if (val === 2) { // 切换到arcRotateCameraIns
        updateArcRotateCamera(this)

        this.sceneIns.activeCamera = this.arcRotateCameraIns
      } else { // 切换到freeCameraIns
        this.freeCameraIns.position = this.arcRotateCameraIns.position
        this.freeCameraIns.target = this.arcRotateCameraIns.lockedTarget.position

        this.arcRotateCameraIns.lockedTarget = null

        this.sceneIns.activeCamera = this.freeCameraIns
      }
    },
    cameraSpeed(val) {
      // freeCamera速度改变，同GUI
      this.freeCameraIns.speed = val
    },
    resetCount(val) {
      if (val) {
        for (const npc of this.npcMap.values()) {
          npc.npcMesh && npc.npcMesh.dispose()
        }
        this.npcMap = new Map()
      }
    }
  },
  async mounted() {
    this.canvasOutheight = document.getElementById('outside').offsetHeight
    console.log('canvasOutheight', this.canvasOutheight)
    this.initCanvas()
  },
  methods: {
    initCanvas() {
      var canvas = document.getElementById('renderCanvas') // 得到canvas对象的引用
      this.canvas = canvas
      var engine = new Engine(canvas, true) // 初始化 BABYLON 3D engine
      var scene = new Scene(engine) // Call the createScene function
      this.sceneIns = scene // 保存到全局，供其它函数引用
      scene.onPointerDown = function(evt, pickResult) {
        const { hit, pickedMesh, pickedPoint } = pickResult
        if (hit) {
          const { id, name } = pickedMesh
          const { _x, _y, _z } = pickedPoint
          console.log(id, name, _x, _y, _z)
        }
      }
      new HemisphericLight('', new Vector3(1, 1, 0), scene)

      showWorldAxis(this)
      
      constructBackground(this)

      constructFreeCamera(this)
      constructArcRotateCamera(this)

      prepareResources(this)

      const capturedThis = this

      scene.registerBeforeRender(function() {
        if (capturedThis.destinationMarker) {
          capturedThis.destinationMarker.rotation.z += 0.1
        }
      })

      // 最后一步调用engine的runRenderLoop方案，执行scene.render()，让我们的3d场景渲染起来
      engine.runRenderLoop(function() {
        capturedThis.updateScene()
        // flashTrafficLight(capturedThis)
        scene.render()
      })

      this.registerEventResponseAction(scene, canvas)
    },
    registerEventResponseAction(scene, canvas) {
      const capturedThis = this

      // 按下鼠标左键，切换到arcRotateCameraIns；释放鼠标左键，切换回freeCameraIns
      canvas.onpointerdown = (e) => {
        const event = e || window.event
        if (event.button === 0) { // 按下鼠标左键
          if (capturedThis.sceneIns.activeCamera === capturedThis.freeCameraIns) {
            capturedThis.arcRotateCameraIns.position = capturedThis.freeCameraIns.position
            capturedThis.arcRotateCameraIns.target = capturedThis.freeCameraIns.target
            capturedThis.arcRotateCameraIns.rebuildAnglesAndRadius()

            capturedThis.sceneIns.activeCamera = capturedThis.arcRotateCameraIns

            capturedThis.cameraChanged = true
          }
        }
      }

      canvas.onpointerup = (e) => {
        var event = e || window.event
        if (event.button === 0) { // 释放鼠标左键
          if (capturedThis.cameraChanged) {
            capturedThis.freeCameraIns.position = capturedThis.arcRotateCameraIns.position
            capturedThis.freeCameraIns.target = capturedThis.arcRotateCameraIns.target

            capturedThis.sceneIns.activeCamera = capturedThis.freeCameraIns

            capturedThis.cameraChanged = false
          }
        }
      }

      // canvas中的鼠标事件禁止
      window.onmousewheel = document.onmousewheel = (e) => {
        if (e.srcElement.id === 'renderCanvas') {
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.overflow = 'auto'
        }
      }

      canvas.addEventListener('click', function(event) {
        var x = event.pageX
        var y = event.pageY
        console.log(x, y)
      })
      // canvas.addEventListener('mousemove', function(event) {
      //   const { left, top } = getDomPosition(document.getElementById('outside'))
      //   var x = event.pageX - left + 10
      //   var y = event.pageY - top + 10
      //   var dom = document.getElementById('test')
      //   dom.innerHTML = 'npc车'
      //   dom.style.left = x + 'px'
      //   dom.style.top = y + 'px'
      // })

      canvas.oncontextmenu = (e) => {
        var event = e || window.event
        console.log(event)
        return false // 屏蔽浏览器自带的右键菜单
      }

      // hide/show the Inspector
      window.addEventListener('keydown', ev => {
        // Shift+Ctrl+Alt+I
        if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
          if (scene.debugLayer.isVisible()) {
            scene.debugLayer.hide()
          } else {
            scene.debugLayer.show()
          }
        }
      })
    },
    updateScene() {
      if (this.testeeData.testCar) {
        if (this.testeeData.dataReady) {
          this.testeeData.testCar.visibility = true
        }

        interpolateForVehicle(this.testeeData)
        updateTestCar(this, this.offset)
        // //   // 模拟规划路径
        //   const { x, y } = this.testeeData.bottom_center
        //   const { _x, _y, _z } = convertToClientLocation(new BABYLON.Vector3(x, y, 0), this.offset)
        //   const num = 50
        //   const pathPoints2 = []
        //   for (let i = 0; i < num; i++) {
        //     const currentPoint = new Vector3(_x, _y + Math.sin(1.0 * i / num) * num, -1)
        //     pathPoints2.push(currentPoint)
        //   }
        //   // console.log('2222222222', this.pathPoints, pathPoints2)
        if (this.offset.x) {
          updatePlanPath(this, this.pathPoints)
        }
      }

      if (this.npcMap.size > 0) {
        interpolateForNpcList(this.npcMap)
        this.updateNpcList()
      }
    },
    updateNpcList() {
      for (const npcData of this.npcMap.values()) {
        if (!npcData.npcMesh) {
          continue
        }
        if (npcData.dataReady) {
          npcData.npcMesh.visibility = true
          if (npcData.directionArray) {
            npcData.directionArray.visibility = true
          }
        }
        if (npcData.interpedLocation) {
          npcData.npcMesh.position = convertToClientLocation(npcData.interpedLocation, this.offset)
          npcData.npcMesh.position.addInPlace(new Vector3(0, 0, npcData.height / 2.0))
        }
        if (npcData.interpedRotation) {
          let babylonRotation = switchRotation(npcData.interpedRotation)
          npcData.npcMesh.rotation.z = babylonRotation.z
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.canvas {
  width: 100%;
  height: 100%;
  min-height: 300px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  border-radius: 50px;
  // border: #ccc solid 1px;
  cursor: all-scroll;
}
.cover {
  position: absolute;
  width: 30px;
  height: 60px;
  z-index: 9999;
}
</style>
