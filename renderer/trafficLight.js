import {
  Vector3,
  Vector4,
  Color3,
  Angle,
  MeshBuilder
} from '@babylonjs/core/Legacy/legacy'
import * as BABYLON from '@babylonjs/core/Legacy/legacy'

import {
  convertToClientLocation,
  switchPosition,
  switchRotation
} from './utils.js'

var trafficLightMap = new Map()
var trafficLightPoleMap = new Map()

const ETrafficLightType =
{
  TLT_MONTOR_VEHICLE_OMNI: 1, // 机动车信号灯,无方向
  TLS_MONTOR_VEHICLE_STRAIGHT: 2, // 机动车直行车灯
  TLS_MONTOR_VEHICLE_LEFT: 3, // 机动车左转灯
  TLS_MONTOR_VEHICLE_RIGHT: 4, // 机动车右转灯
  TLS_MONTOR_VEHICLE_STRAIGHT_LEFT: 5, // 机动车直行-左转灯
  TLS_MONTOR_VEHICLE_STRAIGHT_RIGHT: 6, // 机动车直行-右转灯
  TLS_MONTOR_VEHICLE_LEFT_TURN_AROUND: 7, // 机动车左转-掉头灯
  TLS_MONTOR_VEHICLE_TURN_AROUND: 8, // 机动车掉头灯
  TLS_NON_MOTOR_VEHICLE: 9, // 非机动车灯
  TLS_PEDESTRIAN: 10 // 人行横道车灯
}

const ETrafficLightColorState =
{
  TLS_Black: 0,
  TLS_Red: 1, // 红灯常亮状态
  TLS_Red_Flash: 2, // 红灯闪烁状态
  TLS_Green: 4,
  TLS_Green_Flash: 8,
  TLS_Yellow: 16,
  TLS_Yellow_Flash: 32,
  TLS_Broken: 63
}

// 红绿黄信号灯
const montorVehicleOmniRedMat = null
const montorVehicleOmniYellowMat = null
const montorVehicleOmniGreenMat = null

let montorVehicleStraightRedMat = null // 直行红色材质
let montorVehicleStraightYellowMat = null // 直行黄色材质
let montorVehicleStraightGreenMat = null // 直行绿色材质

let montorVehicleLeftRedMat = null
let montorVehicleLeftYellowMat = null
let montorVehicleLeftGreenMat = null

let montorVehicleRightRedMat = null
let montorVehicleRightYellowMat = null
let montorVehicleRightGreenMat = null

const montorVehicleStraightLeftRedMat = null
const montorVehicleStraightLeftYellowMat = null
const montorVehicleStraightLeftGreenMat = null

const montorVehicleStraightRightRedMat = null
const montorVehicleStraightRightYellowMat = null
const montorVehicleStraightRightGreenMat = null

const montorVehicleLeftTurnAroundRedMat = null
const montorVehicleLeftTurnAroundYellowMat = null
const montorVehicleLeftTurnAroundGreenMat = null

const montorVehicleTurnAroundRedMat = null
const montorVehicleTurnAroundYellowMat = null
const montorVehicleTurnAroundGreenMat = null

const nonMotorVehicleRedMat = null
const nonMotorVehicleYellowMat = null
const nonMotorVehicleGreenMat = null

const pedestrianRedMat = null
const pedestrianYellowMat = null
const pedestrianGreenMat = null

let lightOffMat = null

// 倒计时信号灯
const redZeroMat = null
const redOneMat = null
const redTwoMat = null
const redThreeMat = null
const redFourMat = null
const redFiveMat = null
const redSixMat = null
const redSevenMat = null
const redEightMat = null
const redNineMat = null

const yellowZeroMat = null
const yellowOneMat = null
const yellowTwoMat = null
const yellowThreeMat = null
const yellowFourMat = null
const yellowFiveMat = null
const yellowSixMat = null
const yellowSevenMat = null
const yellowEightMat = null
const yellowNineMat = null

const greenZeroMat = null
const greenOneMat = null
const greenTwoMat = null
const greenThreeMat = null
const greenFourMat = null
const greenFiveMat = null
const greenSixMat = null
const greenSevenMat = null
const greenEightMat = null
const greenNineMat = null

const numberOffMat = null

const timingLightTextures = [
  [redZeroMat, redOneMat, redTwoMat, redThreeMat, redFourMat, redFiveMat, redSixMat, redSevenMat, redEightMat, redNineMat],
  [yellowZeroMat, yellowOneMat, yellowTwoMat, yellowThreeMat, yellowFourMat, yellowFiveMat, yellowSixMat, yellowSevenMat, yellowEightMat, yellowNineMat],
  [greenZeroMat, greenOneMat, greenTwoMat, greenThreeMat, greenFourMat, greenFiveMat, greenSixMat, greenSevenMat, greenEightMat, greenNineMat]
]

const lastFlashTime = 0

export function prepareResources(This) {
  const constructMaterial = function(textureUrl) {
    const mat = new BABYLON.StandardMaterial('', This.sceneIns)

    const texture = new BABYLON.Texture(textureUrl, This.sceneIns)
    texture.level = 3 // 控制信号显示的亮度。

    // 该材质要设为自发光材质，所以设置了emissiveTexture成员变量。这里之所以还设置了diffuseTexture成员变量，是为了让透明度起作用。
    mat.diffuseTexture = texture
    mat.diffuseTexture.hasAlpha = true // 用于显示信号的纹理图片带有透明度，非信号图案部分是完全透明的。
    mat.useAlphaFromDiffuseTexture = true // 让透明度起作用。
    mat.disableLighting = true // 该材质不要受光源影响，该材质将设置为自发光材质。

    mat.emissiveTexture = texture // 该材质设置为自发光材质。

    return mat
  }

  montorVehicleStraightRedMat = constructMaterial('/common/trafficLight/Red_Ahead.png')
  montorVehicleStraightYellowMat = constructMaterial('/common/trafficLight/Yellow_Ahead.png')
  montorVehicleStraightGreenMat = constructMaterial('/common/trafficLight/Green_Ahead.png')

  montorVehicleLeftRedMat = constructMaterial('/common/trafficLight/Red_Left.png')
  montorVehicleLeftYellowMat = constructMaterial('/common/trafficLight/Yellow_Left.png')
  montorVehicleLeftGreenMat = constructMaterial('/common/trafficLight/Green_Left.png')

  montorVehicleRightRedMat = constructMaterial('/common/trafficLight/Red_Right.png')
  montorVehicleRightYellowMat = constructMaterial('/common/trafficLight/Yellow_Right.png')
  montorVehicleRightGreenMat = constructMaterial('/common/trafficLight/Green_Right.png')

  lightOffMat = constructMaterial('/common/trafficLight/Black.png') // 用于信号灯背面的材质，信号灯背面看起来是全黑的。
}

// 绘制交通信号灯杆
export function constructTrafficLightPole(id, vtsMap) {
  const height = 6 // 电线杆竖杆高度
  const width = 6 // 电线杆横杆宽度
  const footZ = 6 // 因为vts map中也会定义一个heigh，此footZ用于调整pole mesh height与vts map height的落差
  const trafficLightPolePoints = [new Vector3(0, 0, footZ), new Vector3(0, 0, footZ - height), new Vector3(0, width, footZ - height)]

  const trafficLightPoleOptions = {
    points: trafficLightPolePoints
  }

  const trafficLightPole = MeshBuilder.CreateLines('', trafficLightPoleOptions)
  trafficLightPole.color = Color3.Black()

  console.log(id, vtsMap, vtsMap.trafficLightPole)
  const PoleInfo = vtsMap.trafficLightPole[id]
  if (PoleInfo != undefined) { // 设置电线杆的位置和朝向
    trafficLightPole.position = switchPosition(new Vector3(PoleInfo.x, PoleInfo.y, PoleInfo.z))
    trafficLightPole.rotation = switchRotation(new Vector3(PoleInfo.roll, PoleInfo.pitch, PoleInfo.yaw))
  }

  return trafficLightPole
}

// 绘制交通信号灯
export function constructTrafficLight(This, parameters, vtsMap) {
  // 创建红绿灯
  const trafficLight = {}

  // 一组信号灯有横排/竖排两种，信号灯数量有2个一组或者3个一组。
  let lightNum = 0
  let isHorizontal = false
  console.log(parameters.modelName, 'parameters.modelName')

  if (parameters.modelName === 'threeLight_horizontal') {
    lightNum = 3
    isHorizontal = true
  } else if (parameters.modelName === 'threeLight_vertical') {
    lightNum = 3
    isHorizontal = false
  } else if (parameters.modelName === 'twoLight_horizontal') {
    lightNum = 2
    isHorizontal = true
  } else if (parameters.modelName === 'twoLight_vertical') {
    lightNum = 2
    isHorizontal = false
  }

  switch (parameters.trafficLightType) {
    case ETrafficLightType.TLT_MONTOR_VEHICLE_OMNI:
      trafficLight.materials = [
        [montorVehicleOmniRedMat, lightOffMat], // 当该信号灯变成红色状态时，使用第一个材质，变成其它状态时使用第二个材质。
        [montorVehicleOmniYellowMat, lightOffMat], // 当该信号灯变成黄色状态时，使用第一个材质，变成其它状态时使用第二个材质。
        [montorVehicleOmniGreenMat, lightOffMat] // 当该信号灯变成绿色状态时，使用第一个材质，变成其它状态时使用第二个材质。
      ]
      break
    case ETrafficLightType.TLS_MONTOR_VEHICLE_STRAIGHT:
      trafficLight.materials = [
        [montorVehicleStraightRedMat, lightOffMat],
        [montorVehicleStraightYellowMat, lightOffMat],
        [montorVehicleStraightGreenMat, lightOffMat]
      ]
      break
    case ETrafficLightType.TLS_MONTOR_VEHICLE_LEFT:
      trafficLight.materials = [
        [montorVehicleLeftRedMat, lightOffMat],
        [montorVehicleLeftYellowMat, lightOffMat],
        [montorVehicleLeftGreenMat, lightOffMat]
      ]
      break
    case ETrafficLightType.TLS_MONTOR_VEHICLE_RIGHT:
      trafficLight.materials = [
        [montorVehicleRightRedMat, lightOffMat],
        [montorVehicleRightYellowMat, lightOffMat],
        [montorVehicleRightGreenMat, lightOffMat]
      ]
      break
    case ETrafficLightType.TLS_MONTOR_VEHICLE_STRAIGHT_LEFT:
      trafficLight.materials = [
        [montorVehicleStraightLeftRedMat, lightOffMat],
        [montorVehicleStraightLeftYellowMat, lightOffMat],
        [montorVehicleStraightLeftGreenMat, lightOffMat]
      ]
      break
    case ETrafficLightType.TLS_MONTOR_VEHICLE_STRAIGHT_RIGHT:
      trafficLight.materials = [
        [montorVehicleStraightRightRedMat, lightOffMat],
        [montorVehicleStraightRightYellowMat, lightOffMat],
        [montorVehicleStraightRightGreenMat, lightOffMat]
      ]
      break
    case ETrafficLightType.TLS_MONTOR_VEHICLE_LEFT_TURN_AROUND:
      trafficLight.materials = [
        [montorVehicleLeftTurnAroundRedMat, lightOffMat],
        [montorVehicleLeftTurnAroundYellowMat, lightOffMat],
        [montorVehicleLeftTurnAroundGreenMat, lightOffMat]
      ]
      break
    case ETrafficLightType.TLS_MONTOR_VEHICLE_TURN_AROUND:
      trafficLight.materials = [
        [montorVehicleTurnAroundRedMat, lightOffMat],
        [montorVehicleTurnAroundYellowMat, lightOffMat],
        [montorVehicleTurnAroundGreenMat, lightOffMat]
      ]
      break
    case ETrafficLightType.TLS_NON_MOTOR_VEHICLE:
      trafficLight.materials = [
        [nonMotorVehicleRedMat, lightOffMat],
        [nonMotorVehicleYellowMat, lightOffMat],
        [nonMotorVehicleGreenMat, lightOffMat]
      ]
      break
    case ETrafficLightType.TLS_PEDESTRIAN:
      trafficLight.materials = [
        [pedestrianRedMat, lightOffMat],
        [pedestrianYellowMat, lightOffMat],
        [pedestrianGreenMat, lightOffMat]
      ]
      break
  }

  // 我们使用的纹理图片是2048*1024像素的，左半部分用于渲染信号灯的前面，右半部分用于渲染信号灯的后面。
  const sideLength = 0.5
  const front = new Vector4(0, 0, 0.5, 1) // 从纹理图片的左半部分采样。
  const back = new Vector4(0.5, 0, 1, 1) // 从纹理图片的右半部分采样。
  const lightOptions = {
    width: sideLength,
    height: sideLength,
    frontUVs: front,
    backUVs: back,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE // 双面渲染，就是前后面都可见。
  }

  const trafficLightDistance = 0.5 // 同组信号灯（一个组有2个或者3个信号灯）之间的间距。

  let trafficLightPosition = new Vector3()
  let trafficLightRotation = new Vector3()
  const trafficLightInfo = vtsMap.trafficLight[parameters.id]
  if (trafficLightInfo != undefined) { // 设置信号灯的位置和朝向
    trafficLightPosition = switchPosition(new Vector3(trafficLightInfo.x, trafficLightInfo.y, trafficLightInfo.z))
    trafficLightRotation = switchRotation(new Vector3(trafficLightInfo.roll, trafficLightInfo.pitch, trafficLightInfo.yaw))
  }

  const trafficLightRoot = new BABYLON.TransformNode('')
  trafficLightRoot.position = trafficLightPosition
  trafficLightRoot.rotation = trafficLightRotation

  const localRotation = new Vector3(0, Angle.FromDegrees(90).radians(), Angle.FromDegrees(-90).radians())

  console.log(lightNum, 'lightNum')
  switch (lightNum) {
    case 3:
      {
        const redLight = MeshBuilder.CreatePlane('', lightOptions)
        redLight.parent = trafficLightRoot
        redLight.material = trafficLight.materials[0][0]

        const yellowLight = MeshBuilder.CreatePlane('', lightOptions)
        yellowLight.parent = trafficLightRoot
        yellowLight.material = trafficLight.materials[1][0]

        const greenLight = MeshBuilder.CreatePlane('', lightOptions)
        greenLight.parent = trafficLightRoot
        greenLight.material = trafficLight.materials[2][0]

        redLight.rotation = localRotation
        yellowLight.rotation = localRotation
        greenLight.rotation = localRotation

        if (isHorizontal) { // 红灯和绿灯摆放在黄灯的两侧，间隔trafficLightDistance 。
          redLight.position = new Vector3(0, trafficLightDistance, 0)
          greenLight.position = new Vector3(0, -trafficLightDistance, 0)
        } else {
          redLight.position = new Vector3(0, 0, -trafficLightDistance)
          greenLight.position = new Vector3(0, 0, trafficLightDistance)
        }

        trafficLight.lightMeshes = [redLight, yellowLight, greenLight]
      }
      break
    case 2:
      {
        const redLight = MeshBuilder.CreatePlane('', lightOptions)
        redLight.parent = trafficLightRoot
        redLight.material = trafficLight.materials[0][0]

        const greenLight = MeshBuilder.CreatePlane('', lightOptions)
        greenLight.parent = trafficLightRoot
        greenLight.material = trafficLight.materials[2][0]

        redLight.rotation = localRotation
        greenLight.rotation = localRotation

        if (isHorizontal) {
          greenLight.position = new Vector3(0, -trafficLightDistance, 0)
        } else {
          greenLight.position = new Vector3(0, 0, trafficLightDistance)
        }

        trafficLight.lightMeshes = [redLight, null, greenLight]
      }
      break
  }

  trafficLight.id = parameters.id
  trafficLight.trafficLightColorState = parameters.trafficLightColorState
  trafficLight.currentActiveLightIndex = -1 // 用于指示当前红黄绿哪个灯是亮的。
  trafficLight.lightNum = lightNum

  // 合并红绿灯、倒计时灯
  const trafficLightAssembly = {}
  trafficLightAssembly.trafficLight = trafficLight
  // trafficLightAssembly.timingLight = constructTimingLight(This, trafficLightPosition, trafficLightRotation)

  return trafficLightAssembly
}

// 创建倒计时灯，目前该功能尚未投入使用
function constructTimingLight(This, trafficLightPosition, trafficLightRotation) {
  const timingLight = {}

  const sideLength = 10
  const front = new Vector4(0, 0, 0.5, 1)
  const back = new Vector4(0.5, 0, 1, 1)
  const lightOptions = {
    width: sideLength / 2,
    height: sideLength,
    frontUVs: front,
    backUVs: back
  }
  const unitBitNum = MeshBuilder.CreatePlane('', lightOptions)
  const unitBitNumMat = new BABYLON.StandardMaterial('', This.sceneIns)
  unitBitNumMat.diffuseTexture = timingLightTextures[0][0]
  unitBitNum.material = unitBitNumMat //倒计时个位数所用的材质

  const tenBitNum = MeshBuilder.CreatePlane('', lightOptions)
  const tenBitNumMat = new BABYLON.StandardMaterial('', This.sceneIns)
  tenBitNumMat.diffuseTexture = timingLightTextures[0][0]
  tenBitNum.material = tenBitNumMat //倒计时十位数所用的材质

  timingLight.lightMeshes = [tenBitNum, unitBitNum]

  tenBitNum.position = trafficLightPosition
  tenBitNum.position.z += 5
  tenBitNum.rotation = trafficLightRotation

  tenBitNum.addChild(unitBitNum)
  unitBitNum.position = new Vector3(-sideLength / 2, 0, 0)

  return timingLight
}

// 设置倒计时信号灯剩余秒数
export function setRemainingSeconds(trafficLightAssembly, seconds) {
  const unitBitNumber = seconds % 10
  const tenBitNumber = seconds / 10
  const colorIndex = trafficLightAssembly.trafficLight.currentActiveLightIndex

  trafficLightAssembly.timingLight.lightMeshes[1].material.diffuseTexture = timingLightTextures[colorIndex][unitBitNumber] // 个位
  if (tenBitNumber > 0) {
    trafficLightAssembly.timingLight.lightMeshes[0].material.diffuseTexture = timingLightTextures[colorIndex][tenBitNumber] // 十位
  } else {
    trafficLightAssembly.timingLight.lightMeshes[0].material.diffuseTexture = numberOffMat
  }
}

// 设置交通信号灯颜色状态
export function setTrafficLightColorState(trafficLightAssembly, trafficLightColorState) {
  const trafficLight = trafficLightAssembly.trafficLight
  trafficLight.trafficLightColorState = trafficLightColorState

  switch (trafficLight.lightNum) {
    case 3:
      {
        switch (trafficLightColorState) {
          case ETrafficLightColorState.TLS_Red:
          case ETrafficLightColorState.TLS_Red_Flash:
            trafficLight.currentActiveLightIndex = 0
            break
          case ETrafficLightColorState.TLS_Yellow:
          case ETrafficLightColorState.TLS_Yellow_Flash:
            trafficLight.currentActiveLightIndex = 1
            break
          case ETrafficLightColorState.TLS_Green:
          case ETrafficLightColorState.TLS_Green_Flash:
            trafficLight.currentActiveLightIndex = 2
            break

          case ETrafficLightColorState.TLS_Black:
            trafficLight.currentActiveLightIndex = -1
            break
        }
      }
      break
    case 2:
      {
        switch (trafficLightColorState) {
          case ETrafficLightColorState.TLS_Red:
          case ETrafficLightColorState.TLS_Red_Flash:
            trafficLight.currentActiveLightIndex = 0
            break
          case ETrafficLightColorState.TLS_Green:
          case ETrafficLightColorState.TLS_Green_Flash:
            trafficLight.currentActiveLightIndex = 2
            break

          case ETrafficLightColorState.TLS_Black:
            trafficLight.currentActiveLightIndex = -1
            break
        }
      }
      break
  }
  console.log(trafficLight,'555')

  for (let index = 0; index < trafficLight.lightMeshes.length; index++) {
    if (index == trafficLight.currentActiveLightIndex) {
      trafficLight.lightMeshes[index].material = trafficLight.materials[index][0] //启用点亮状态的材质。
    } else {
      const light = trafficLight.lightMeshes[index]
      if (light) {
        light.material = trafficLight.materials[index][1] // 启用熄灭状态的材质。
      }
    }
  }
}

// 信号灯闪烁，目前该部分功能尚未投入使用。
export function flashTrafficLight(This) {
  const shouldChange = Date.getTime() - lastFlashTime > 500 // 每隔0.5秒闪烁一次。
  if (shouldChange) {
    for (const value of This.trafficLightAssemblyMap.values()) {
      const trafficLight = value.trafficLight
      switch (trafficLight.trafficLightColorState) {
        case ETrafficLightColorState.TLS_Red_Flash:
        case ETrafficLightColorState.TLS_Yellow_Flash:
        case ETrafficLightColorState.TLS_Green_Flash:
          {
            const lightOnTexture = trafficLight.materials[trafficLight.currentActiveLightIndex][0]
            const lightOffTexture = trafficLight.materials[trafficLight.currentActiveLightIndex][1]

            const currentMaterial = trafficLight.lightMeshes[trafficLight.currentActiveLightIndex].material
            if (currentMaterial.diffuseTexture == lightOnTexture) {
              currentMaterial.diffuseTexture = lightOffTexture
            } else {
              currentMaterial.diffuseTexture = lightOnTexture
            }
          }
          break
      }
    }
  }

  lastFlashTime = Date.getTime()
}

// export function getTrafficLightInfoById(id) {
//   return vtsMap.trafficLight[id]
// }

// export function getTrafficLightPoleInfoById(id) {
//   return vtsMap.trafficLightPole[id]
// }

export function handleTrafficLightGroupsMessage(This, trafficLightGroups, vtsMap) {
  console.log(trafficLightGroups.length)
  for (let i = 0; i < trafficLightGroups.length; i++) {
    const trafficLightGroupMsg = trafficLightGroups[i]
    const groupId = trafficLightGroupMsg.id
    const groupType = trafficLightGroupMsg.group_type
    console.log(groupId, '111')

    if (!trafficLightPoleMap.has(groupId)) { // 第一次收到该消息时创建电线杆场景对象。
      const trafficLightPole = constructTrafficLightPole(groupId, vtsMap)
      trafficLightPoleMap.set(groupId, trafficLightPole)
    }

    const trafficLights = trafficLightGroupMsg.single_traffic_lights
    for (let j = 0; j < trafficLights.length; j++) {
      console.log(trafficLightMsg, 'trafficLightMsg')
      const trafficLightMsg = trafficLights[j]
      const trafficLightId = trafficLightMsg.id

      const trafficLight = trafficLightMap.get(trafficLightId)
      if (trafficLight == undefined) {
        const modelName = trafficLightMsg.model
        const directionType = trafficLightMsg.traffic_light_direction

        const getTrafficLightType = function(groupType, directionType) {
          let trafficLightType = 0

          if (groupType == 1) {
            trafficLightType = directionType
          } else {
            trafficLightType = 8 + groupType - 1 // 8是directionType的最大值
          }

          return trafficLightType
        }

        const parameters = {
          id: trafficLightId,
          modelName: modelName,
          trafficLightColorState: trafficLightMsg.color,
          trafficLightType: getTrafficLightType(groupType, directionType)
        }
        trafficLight = constructTrafficLight(This, parameters, vtsMap)

        trafficLightMap.set(trafficLightId, trafficLight)
      }

      // setRemainingSeconds(trafficLight, trafficLightMsg.remain_time)
      setTrafficLightColorState(trafficLight, trafficLightMsg.color)
    }
  }
}
