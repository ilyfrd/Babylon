import * as BABYLON from '@babylonjs/core/Legacy/legacy'

export function constructArcRotateCamera(This) {
  This.arcRotateCameraIns = new BABYLON.ArcRotateCamera('', 0, 0, 30, new BABYLON.Vector3(0, 0, 0), This.sceneIns)
  const camera = This.arcRotateCameraIns
  camera.setPosition(new BABYLON.Vector3(-30, 0, 0))
  camera.upVector = new BABYLON.Vector3(0, 0, 1)
  camera.attachControl(This.canvas, true)
}

export function updateArcRotateCamera(This) {
  This.arcRotateCameraIns.lockedTarget = This.testeeData.testCar
  const behindCameraDistance = 20
  const beyondCameraDistance = 10
  const upDirection = new BABYLON.Vector3(0, 0, 1)
  const positionRelativeToNpc = This.testeeData.testCar.right.scale(-behindCameraDistance).add(upDirection.scale(beyondCameraDistance))
  This.arcRotateCameraIns.position = This.testeeData.testCar.position.add(positionRelativeToNpc)

  This.arcRotateCameraIns.rebuildAnglesAndRadius()
}

export function constructArcRotateCamera2(This) {
  This.arcRotateCameraIns = new BABYLON.ArcRotateCamera('', 0, 0, 50, new BABYLON.Vector3(0, 0, 0), This.sceneIns)
  const camera = This.arcRotateCameraIns
  camera.setPosition(new BABYLON.Vector3(Math.PI / 2, Math.PI * 10, 50))
  camera.upVector = new BABYLON.Vector3(0, 0, -2)
  camera.attachControl(This.canvas, true)
}
