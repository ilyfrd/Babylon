import {
  Vector3,
  Color3,
  MeshBuilder
} from '@babylonjs/core/Legacy/legacy'
import {
  constructDirectionArrow
} from './directionArrow.js'

export function constructVehicleMesh(This, originData, npcDataSrc) {
  const { x, y, z } = npcDataSrc.box.size

  // 车辆按线框模式绘制。
  // const VehicleLines = [
  //   [new Vector3(x / 2, y / 2, z / 2), new Vector3(x / 2, y / 2, -z / 2)],
  //   [new Vector3(-x / 2, y / 2, z / 2), new Vector3(-x / 2, y / 2, -z / 2)],
  //   [new Vector3(-x / 2, -y / 2, z / 2), new Vector3(-x / 2, -y / 2, -z / 2)],
  //   [new Vector3(x / 2, -y / 2, z / 2), new Vector3(x / 2, -y / 2, -z / 2)],
  //   [new Vector3(x / 2, y / 2, z / 2), new Vector3(x / 2, y / 2, -z / 2)],

  //   [new Vector3(x / 2, y / 2, z / 2), new Vector3(-x / 2, y / 2, z / 2), new Vector3(-x / 2, -y / 2, z / 2), new Vector3(x / 2, -y / 2, z / 2), new Vector3(x / 2, y / 2, z / 2)],
  //   [new Vector3(x / 2, y / 2, -z / 2), new Vector3(-x / 2, y / 2, -z / 2), new Vector3(-x / 2, -y / 2, -z / 2), new Vector3(x / 2, -y / 2, -z / 2), new Vector3(x / 2, y / 2, -z / 2)]
  // ]

  // const vehicleOptions = {
  //   lines: VehicleLines
  // }
  // originData.npcMesh = MeshBuilder.CreateLineSystem('', vehicleOptions, This.sceneIns)

  const vehicleOptions = {
    width: x,
    height: y,
    depth: z
  }
  originData.npcMesh = MeshBuilder.CreateBox('', vehicleOptions, This.sceneIns)

  let vehicleColor = new Color3()
  if (/^testee/.test(npcDataSrc.id)) {
    vehicleColor = Color3.Red()
  } else {
    vehicleColor = Color3.Green()
  }

  const mat = new BABYLON.StandardMaterial('', This.sceneIns)
  mat.diffuseColor = vehicleColor
  originData.npcMesh.material = mat
  originData.npcMesh.visibility = false

  const directionArrow = constructDirectionArrow(This)
  directionArrow.position = new Vector3(x / 2 + 1, 0, 0)
  directionArrow.rotation = new Vector3()
  directionArrow.color = vehicleColor
  directionArrow.visibility = false
  originData.npcMesh.addChild(directionArrow)

  originData.directionArray = directionArrow
}
