import {
    Vector3,
    Color3,
    Color4,
    MeshBuilder
  } from '@babylonjs/core/Legacy/legacy'


export function showWorldAxis(This) {
    const axisSize = 5
    const Lines = []
    const Colors = []

    Lines.push([new Vector3(0, 0, 0), new Vector3(axisSize, 0, 0)])
    Lines.push([new Vector3(0, 0, 0), new Vector3(0, axisSize, 0)])
    Lines.push([new Vector3(0, 0, 0), new Vector3(0, 0, axisSize)])

    Colors.push([new Color4(1, 0, 0, 1), new Color4(1, 0, 0, 1)])
    Colors.push([new Color4(0, 1, 0, 1), new Color4(0, 1, 0, 1)])
    Colors.push([new Color4(0, 0, 1, 1), new Color4(0, 0, 1, 1)])

    const singleSolidLineOptions = {
        lines: Lines,
        colors: Colors,
        useVertexAlpha: false
      }
    BABYLON.MeshBuilder.CreateLineSystem('', singleSolidLineOptions, This.sceneIns)

}