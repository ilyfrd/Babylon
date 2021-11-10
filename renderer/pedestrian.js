import {
  Vector3,
  MeshBuilder
} from '@babylonjs/core/Legacy/legacy'
import * as BABYLON from '@babylonjs/core/Legacy/legacy'

export function constructPedestrianMesh(This, originData, npcDataSrc) {
  const { x, y, z } = npcDataSrc.box.size

  // 绘制body
  const bodyLines = []

  const frontLeftBodyLine = [new Vector3(x / 2, y / 2, 0), new Vector3((x / 2) * 0.2, y / 2, 0), new Vector3((x / 2) * 0.2, y / 2, -z / 2)]
  const frontRightBodyLine = []
  const backLeftBodyLine = []
  const backRightBodyLine = []
  for (const point of frontLeftBodyLine) {
    frontRightBodyLine.push(new Vector3(-point.x, point.y, point.z))
    backLeftBodyLine.push(new Vector3(point.x, -point.y, point.z))
    backRightBodyLine.push(new Vector3(-point.x, -point.y, point.z))
  }
  bodyLines.push(frontLeftBodyLine, frontRightBodyLine, backLeftBodyLine, backRightBodyLine)

  const connectingLines = []
  const bodyLinePointsNum = frontLeftBodyLine.length
  for (let index = 0; index < bodyLinePointsNum; index++) {
    connectingLines.push([frontLeftBodyLine[index], backLeftBodyLine[index]])
    connectingLines.push([frontRightBodyLine[index], backRightBodyLine[index]])
  }
  for (const line of connectingLines) {
    bodyLines.push(line)
  }

  // 绘制head
  const headLines = []
  const circleRadius = Math.min(x, z / 2) / 4
  const circleCenterPoint = new Vector3(0, y / 2, circleRadius)
  const circlePointsNum = 20 // 用20个顶点近似圆的边界。
  const generatrixNum = 8 // 母线数量
  const circlePointsStep = 360 / circlePointsNum
  const generatrixStep = 360 / generatrixNum

  let currentAngle = 0.0
  const frontHeadLine = []
  const backHeadLine = []
  while (currentAngle <= 360) {
    const radians = BABYLON.Angle.FromDegrees(currentAngle).radians()
    const x = circleRadius * Math.cos(radians)
    const z = circleRadius * Math.sin(radians)
    const point = circleCenterPoint.add(new Vector3(x, 0, z))
    frontHeadLine.push(point)

    currentAngle += circlePointsStep
  }

  for (const point of frontHeadLine) {
    backHeadLine.push(new Vector3(point.x, -point.y, point.z))
  }

  headLines.push(frontHeadLine, backHeadLine)

  currentAngle = 0.0
  const frontHeadGeneratrixPoints = []
  const backHeadGeneratrixPoints = []
  while (currentAngle < 360) {
    const radians = BABYLON.Angle.FromDegrees(currentAngle).radians()
    const x = circleRadius * Math.cos(radians)
    const z = circleRadius * Math.sin(radians)
    const point = circleCenterPoint.add(new Vector3(x, 0, z))
    frontHeadGeneratrixPoints.push(point)

    currentAngle += generatrixStep
  }

  for (const point of frontHeadGeneratrixPoints) {
    backHeadGeneratrixPoints.push(new Vector3(point.x, -point.y, point.z))
  }

  const generatrixPointsNum = frontHeadGeneratrixPoints.length
  for (let index = 0; index < generatrixPointsNum; index++) {
    const connectingLine = [frontHeadGeneratrixPoints[index], backHeadGeneratrixPoints[index]]
    headLines.push(connectingLine)
  }

  // 组合body和head
  const pedestrianLines = []
  for (const line of bodyLines) {
    pedestrianLines.push(line)
  }
  for (const line of headLines) {
    pedestrianLines.push(line)
  }

  const depestrianOptions = {
    lines: pedestrianLines,
    useVertexAlpha: false
  }
  originData.npcMesh = MeshBuilder.CreateLineSystem('', depestrianOptions, This.sceneIns)
  originData.npcMesh.color = BABYLON.Color3.Purple()
  originData.npcMesh.visibility = false
}
