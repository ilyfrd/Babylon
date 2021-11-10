import {
  Vector3,
  Color3,
  MeshBuilder
} from '@babylonjs/core/Legacy/legacy'

export function constructDirectionArrow(This) {
  let arrowMesh = null

  const lengthToWidthRadio = 2 / 1 // 方向箭的长宽比
  const arrowLength = 3 // 方向箭的长度
  const arrowWidth = arrowLength / lengthToWidthRadio
  const headLength = 1 // 箭头部分的长度
  const arrowTailPoint = new Vector3(0, 0, 0)
  const arrowHeadPoint = new Vector3(arrowLength, 0, 0)
  const arrowLeftPoint = new Vector3(arrowLength - headLength, arrowWidth / 2, 0)
  const arrowRightPoint = new Vector3(arrowLength - headLength, -arrowWidth / 2, 0)

  const arrowLines = [
    [arrowTailPoint, arrowHeadPoint],
    [arrowLeftPoint, arrowHeadPoint, arrowRightPoint]
  ]

  const arrowOptions = {
    lines: arrowLines,
    useVertexAlpha: false
  }
  arrowMesh = MeshBuilder.CreateLineSystem('', arrowOptions, This.sceneIns)

  return arrowMesh
}
