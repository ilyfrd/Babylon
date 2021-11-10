/* eslint-disable no-undef */
import {
  Vector3,
  Color3,
  MeshBuilder
} from '@babylonjs/core/Legacy/legacy'

const arrowMeshPool = [] // 为了避免频繁的创建mesh，我们用一个pool保存已经创建的mesh，通过设置这些mesh的可见性来控制需要启用的mesh的数量。

export function updatePlanPath(This, pathPoints) {
  const planPath = new BABYLON.Path3D(pathPoints)
  if (!planPath) {
    return
  }
  const pathLength = planPath.getDistanceAt(1.0)
  if (pathLength < 2) { // 过滤掉不正常的规划路径
    return
  }
  const arrowDistance = 1 // 规划路径用前后连续的箭头表示，这里arrowDistance表示箭头之间的间隔。
  const activeArrowNum = Math.round(pathLength / arrowDistance) + 1 // activeArrowNum表示为了展示当前规划路径需要用到的箭头的数量。
  const lackNum = activeArrowNum - arrowMeshPool.length // 当pool中的mesh不够用时就创建更多的mesh。
  // console.log(pathLength, arrowDistance, activeArrowNum, arrowMeshPool.length, 'arrowMeshPool')
  if (lackNum > 0) {
    for (let i = 0; i < lackNum; ++i) {
      arrowMeshPool.push(constructArrowMesh(This))
    }
  }

  for (let i = 0; i < arrowMeshPool.length; ++i) {
    if (i < activeArrowNum) {
      arrowMeshPool[i].visibility = true
    } else {
      arrowMeshPool[i].visibility = false
    }
  }

  for (let i = 0; i < activeArrowNum; ++i) {
    arrowMeshPool[i].position = planPath.getPointAt(1.0 * i / (activeArrowNum - 1))
    arrowMeshPool[i].position.z += 0.01

    let tangent = planPath.getTangentAt(1.0 * i / (activeArrowNum - 1), true)
    if (i === activeArrowNum - 1) { // 末端顶点处的tangent是无效的，此处特殊处理。
      tangent = planPath.getTangentAt(0.99, true)
    }
    arrowMeshPool[i].setDirection(tangent)
  }
}

function constructArrowMesh(This) {
  const arrowMesh = new BABYLON.Mesh('', This.sceneIns)

  const positions = []
  const indices = []

  // mesh的forward（也即是direction）是指向z轴正向的，此处也让arrow的箭头指向z轴正向。
  const length = 0.5 // 箭的长度
  const width = 0.5 // 箭的宽度
  const tailPoint = new Vector3(0, 0, 0) // 箭尾坐标
  const headPoint = new Vector3(0, 0, length * (3 / 5)) // 箭头坐标
  const leftPoint = new Vector3(0, width / 2, -length * (2 / 5)) // 箭左边端点
  const rightPoint = new Vector3(0, -width / 2, -length * (2 / 5)) // 箭右边端点

  positions.push(tailPoint.x, tailPoint.y, tailPoint.z)
  positions.push(rightPoint.x, rightPoint.y, rightPoint.z)
  positions.push(headPoint.x, headPoint.y, headPoint.z)
  positions.push(leftPoint.x, leftPoint.y, leftPoint.z)
  indices.push(0, 2, 1) // 三角形的三个顶点按照顺时针顺序排布。
  indices.push(0, 3, 2)

  const vertexData = new BABYLON.VertexData()
  vertexData.positions = positions
  vertexData.indices = indices
  vertexData.applyToMesh(arrowMesh)

  const mat = new BABYLON.StandardMaterial('', This.sceneIns)
  mat.backFaceCulling = false // backFaceCulling设置为false后，mesh的前后面都可见。
  mat.emissiveColor = new BABYLON.Color3.Green()
  arrowMesh.material = mat

  arrowMesh.visibility = false

  return arrowMesh
}
