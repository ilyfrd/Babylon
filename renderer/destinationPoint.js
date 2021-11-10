import * as BABYLON from '@babylonjs/core/Legacy/legacy'
import {
  convertToClientLocation
} from './utils.js'

export function constructDestinationPoint(This, position, offset) { // 案例终点指示物。
  const customMesh = new BABYLON.Mesh('', This.sceneIns)

  const positions = []
  const indices = []

  let currentAngle = 0.0
  const circleRadius = 1
  const belowHeight = 2
  const beyondHeight = belowHeight * 0.618
  while (currentAngle < 360) {
    const radians = BABYLON.Angle.FromDegrees(currentAngle).radians()
    const x = circleRadius * Math.cos(radians)
    const y = circleRadius * Math.sin(radians)
    positions.push(x, y, 0)

    currentAngle += 120
  }
  positions.push(0, 0, beyondHeight)
  positions.push(0, 0, -belowHeight)
  indices.push(0, 3, 1) // 此处是按顺时针顺序放置顶点index
  indices.push(1, 3, 2)
  indices.push(2, 3, 0)
  indices.push(0, 1, 4)
  indices.push(1, 2, 4)
  indices.push(2, 0, 4)

  const vertexData = new BABYLON.VertexData()
  vertexData.positions = positions
  vertexData.indices = indices
  vertexData.applyToMesh(customMesh)

  const mat = new BABYLON.StandardMaterial('', This.sceneIns)
  mat.diffuseColor = new BABYLON.Color3.Red()
  customMesh.material = mat
  customMesh.position = convertToClientLocation(new BABYLON.Vector3(position.x, position.y, 0), offset)
  customMesh.position.z = belowHeight
  customMesh.id = 'npc'
  customMesh.name = 'destinationPoint'

  This.destinationMarker = customMesh
}
