import * as BABYLON from '@babylonjs/core/Legacy/legacy'

var background = require('./assets/background.png')

// 绘制背景
export function constructBackground(This) {
  var groundMaterial = new BABYLON.StandardMaterial('groundMat', This.sceneIns)
  groundMaterial.emissiveTexture = new BABYLON.Texture(background)
  groundMaterial.emissiveTexture.uScale = 100
  groundMaterial.emissiveTexture.vScale = 100
  groundMaterial.disableLighting = true

  const options = {
    width: 1000,
    height: 1000,
    subdivisions: 25
  }

  var ground = BABYLON.MeshBuilder.CreateGround('ground', options, This.sceneIns)
  ground.material = groundMaterial
  ground.position.z -= 0.05
  ground.rotation = new BABYLON.Vector3(90.0 / 180.0 * 3.1415, 0, 0)
}
