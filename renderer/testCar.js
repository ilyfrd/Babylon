import * as BABYLON from '@babylonjs/core/Legacy/legacy'

import * as BABYLON_COMPLETE from 'babylonjs'
import 'babylonjs-loaders'

import {
  convertToClientLocation,
  switchRotation
} from './utils.js'

// 初始化，画测试车
export function constructTestCar(This) {
  const capturedThis = This
  BABYLON_COMPLETE.SceneLoader.ImportMesh('', '/common/', 'testee.stl', capturedThis.sceneIns, function(meshes) {
    var stdMaterial = new BABYLON.StandardMaterial('', capturedThis.sceneIns)
    stdMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1)
    meshes[0].name = 'testCar'
    meshes[0].material = stdMaterial
    meshes[0].visibility = false
    meshes[0].scaling = new BABYLON.Vector3(0.7, 0.7, 0.7)
    meshes[0].rotation = new BABYLON.Vector3(180.0 / 180.0 * 3.1415, 0, 0)
    capturedThis.testeeData.testCar = meshes[0]
  })
}

export function updateTestCar(This, offset) {
  if (This.testeeData.interpedLocation) {
    This.testeeData.testCar.position = convertToClientLocation(This.testeeData.interpedLocation, offset)
    This.testeeData.testCar.position.addInPlace(new BABYLON.Vector3(0, 0, 0.6))
  }
  if (This.testeeData.interpedRotation) {
    This.testeeData.testCar.rotation.z = This.testeeData.interpedRotation.z
  }
}
