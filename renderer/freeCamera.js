import * as BABYLON from '@babylonjs/core/Legacy/legacy'

export function constructFreeCamera(This) {
  This.freeCameraIns = new BABYLON.UniversalCamera(
    '',
    new BABYLON.Vector3(-30, 0, 10),
    This.scene
  ) // 相机比例尺通过位置来定, 调整视角点，x-30，x为正向，y30，y为负向
  This.freeCameraIns.keysUp.push(87) // W
  This.freeCameraIns.keysDown.push(83) // S
  This.freeCameraIns.keysLeft.push(65) // A
  This.freeCameraIns.keysRight.push(68) // D
  This.freeCameraIns.keysUpward.push(81) // Q
  This.freeCameraIns.keysDownward.push(69) // E

  This.freeCameraIns.setTarget(new BABYLON.Vector3(0, 0, 0))
  This.freeCameraIns.upVector = new BABYLON.Vector3(0, 0, 1)

  This.freeCameraIns.speed = 0.3

  This.freeCameraIns.inputs.addMouseWheel()
  This.freeCameraIns.inputs.removeMouse()

  This.freeCameraIns.attachControl(This.canvas, true) // current active camera
}

export function constructFreeCamera2(This) {
  This.freeCameraIns = new BABYLON.UniversalCamera(
    '',
    new BABYLON.Vector3(0, -0, -100),
    This.scene
  ) // 相机比例尺通过位置来定, 调整视角点，x-30，x为正向，y30，y为负向
  This.freeCameraIns.keysUp.push(87) // W
  This.freeCameraIns.keysDown.push(83) // S
  This.freeCameraIns.keysLeft.push(65) // A
  This.freeCameraIns.keysRight.push(68) // D
  This.freeCameraIns.keysUpward.push(81) // Q
  This.freeCameraIns.keysDownward.push(69) // E

  This.freeCameraIns.setTarget(new BABYLON.Vector3(0, 0, 0))
  This.freeCameraIns.upVector = new BABYLON.Vector3(0, 0, -1)

  This.freeCameraIns.speed = 0.3

  This.freeCameraIns.inputs.addMouseWheel()
  This.freeCameraIns.inputs.removeMouse()

  This.freeCameraIns.attachControl(This.canvas, true) // current active camera
}
