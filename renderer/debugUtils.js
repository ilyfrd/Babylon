import * as BABYLON from '@babylonjs/core/Legacy/legacy'

/**
 * 在三维场景中绘制文字。
 */
export function drawText(This, position, text) {
  var font_type = 'Arial'

  var planeWidth = 3
  var planeHeight = 1

  var plane = BABYLON.MeshBuilder.CreatePlane('plane', { width: planeWidth, height: planeHeight }, This.sceneIns)
  plane.position = position

  // Set width and height for dynamic texture using same multiplier
  var DTWidth = planeWidth * 60
  var DTHeight = planeHeight * 60

  var dynamicTexture = new BABYLON.DynamicTexture('DynamicTexture', { width: DTWidth, height: DTHeight }, This.sceneIns)

  // Check width of text for given font type at any size of font
  var ctx = dynamicTexture.getContext()
  var size = 12 // any value will work
  ctx.font = size + 'px ' + font_type
  var textWidth = ctx.measureText(text).width

  // Calculate ratio of text width to size of font used
  var ratio = textWidth / size

  // set font to be actually used to write text on dynamic texture
  var font_size = Math.floor(DTWidth / (ratio * 1)) // size of multiplier (1) can be adjusted, increase for smaller text
  var font = font_size + 'px ' + font_type

  dynamicTexture.drawText(text, null, null, font, '#000000', '#ffffff', true)

  var mat = new BABYLON.StandardMaterial('mat', This.sceneIns)
  mat.diffuseTexture = dynamicTexture

  plane.material = mat
}
