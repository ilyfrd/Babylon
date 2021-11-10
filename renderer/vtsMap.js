import { UserTypeList } from '@/utils/constant.js'
import * as BABYLON from '@babylonjs/core/Legacy/legacy'

import {
  switchPosition
} from './utils.js'

// var vtsMap = require('./assets/roadLine.json')

// var vtsMap = require('./assets/ZhejiangLabPark_V0101_210531.xodr.json')

var vtsMap2 = require('./assets/AITownReconstructed_V0103_200518.xodr.json')

// 初始化，绘制地图线
export function constructVtsMap(This, roadMap, mockFlag = false) { // roadMap
  const singleSolidLines = []
  const singleSolidColors = []

  const doubleSolidLines = []

  const noneLines = []
  const noneColors = []

  const singleBrokenLines = []
  const singleBrokenColors = []

  const vtsMap = mockFlag ? vtsMap2 : roadMap

  const getColorFromString = (LineColor) => {
    if (LineColor === 'yellow') {
      return new BABYLON.Color4(1, 1, 0, 1)
    } else if (LineColor === 'white') {
      return new BABYLON.Color4(1, 1, 1, 1)
    } else if (LineColor === 'standard') {
      return new BABYLON.Color4(1, 1, 1, 1)
    } else {
      return new BABYLON.Color4(1, 1, 1, 1)
    }
  }

  for (let i = 0; i < vtsMap.roadLine.length; i++) {
    // 下面所有的line（singleSolidLine、doubleSolidLine、noneLine、singleBrokenLine）是由许多首尾相接的直线段构成的一条线，请参考babylon.js的Line System的定义。

    let singleSolidLine = [] // 单实线
    let singleSolidColor = []

    let doubleSolidLine = [] // 双实线

    let noneLine = [] // 交叉路口轨迹线
    let noneColor = []

    let singleBrokenLine = [] // 单虚线
    let singleBrokenColor = []

    let lastLineTyle = ''
    let lastLineColor = ''

    const boundary = vtsMap.roadLine[i]
    for (let j = 0; j < boundary.BoundaryPoints.length; j++) {
      const point = boundary.BoundaryPoints[j]

      // 同一条边界线上可能有多种线型或者多种颜色，那么就需要根据线型和颜色的不同将该边界线拆分成多条线。
      if (point.LineType !== lastLineTyle || point.LineColor !== lastLineColor) { // 线型或者颜色发生了变化。
        if (singleSolidLine.length > 0) {
          singleSolidLines.push(singleSolidLine) // 当前线型或者颜色的数据入队。
          singleSolidColors.push(singleSolidColor)

          singleSolidLine = [] // 置空，接下来接收下一种线型或者颜色对应的数据。
          singleSolidColor = []
        }

        if (doubleSolidLine.length > 0) {
          doubleSolidLines.push(doubleSolidLine)
          doubleSolidLine = []
        }

        if (noneLine.length > 0) {
          noneLines.push(noneLine)
          noneColors.push(noneColor)

          noneLine = []
          noneColor = []
        }

        if (singleBrokenLine.length > 4) {
          singleBrokenLines.push(singleBrokenLine)
          singleBrokenColors.push(singleBrokenColor)

          singleBrokenLine = []
          singleBrokenColor = []
        }
      }

      lastLineTyle = point.LineType
      lastLineColor = point.LineColor

      if (point.LineType === 'solid') {
        singleSolidLine.push(switchPosition(new BABYLON.Vector3(point.x, point.y, 0)))
        singleSolidColor.push(getColorFromString(point.LineColor))
      } else if (point.LineType === 'solid_solid') { // 双实线是用两条线显示，处理方式略有不同。
        const linePoint = {}
        linePoint.position = switchPosition(new BABYLON.Vector3(point.x, point.y, 0))
        linePoint.color = getColorFromString(point.LineColor)
        doubleSolidLine.push(linePoint)
      } else if (point.LineType === 'broken') {
        singleBrokenLine.push(switchPosition(new BABYLON.Vector3(point.x, point.y, 0)))
        singleBrokenColor.push(getColorFromString(point.LineColor))
      } else if (point.LineType === 'none') {
        noneLine.push(switchPosition(new BABYLON.Vector3(point.x, point.y, 0)))
        noneColor.push(new BABYLON.Color4(0.44, 0.50, 0.56, 1)) // SlateGrey color
      }
    }

    singleSolidLines.push(singleSolidLine)
    singleSolidColors.push(singleSolidColor)

    doubleSolidLines.push(doubleSolidLine)

    noneLines.push(noneLine)
    noneColors.push(noneColor)

    singleBrokenLines.push(singleBrokenLine)
    singleBrokenColors.push(singleBrokenColor)
  }

  drawSingleSolidLines(This, singleSolidLines, singleSolidColors)
  drawDoubleSolidLines(This, doubleSolidLines)
  drawNoneRoadLines(This, noneLines, noneColors)
  drawSingleBrokenLines(This, singleBrokenLines, singleBrokenColors)
}

function drawSingleSolidLines(This, singleSolidLines, singleSolidColors) {
  // 绘制单实线
  const singleSolidLineOptions = {
    lines: singleSolidLines,
    colors: singleSolidColors,
    useVertexAlpha: false
  }
  BABYLON.MeshBuilder.CreateLineSystem('', singleSolidLineOptions, This.sceneIns)
}

function drawDoubleSolidLines(This, doubleSolidLines) {
  // 绘制双实线，doubleSolidLines是一条线，需要向左右偏移一定距离（0.3），以产生两条线，保存到doubleSolidLinesTransformed中。
  const doubleSolidLinesTransformed = []
  const doubleSolidColorsTransformed = []

  const computeOffsetPoint = (referencePoint, targetPoint, leftSide) => {
    const offsetDirection = new BABYLON.Vector3(0, 0, 1).cross(targetPoint.subtract(referencePoint)).normalize()
    const offsetDimension = 0.3

    let offsetVector = null
    if (leftSide == true){
      offsetVector = offsetDirection.scale(offsetDimension)
    }
    else{
      offsetVector = offsetDirection.scale(-offsetDimension)
    }

    return targetPoint.add(offsetVector)
  }

  const computeOffsetLine = (desLine, desColor, srcLine, leftSide) => {
    // 偏移直线的第一个顶点，也可以不要第一个顶点，显示上看不到明显差异，因为一条线上的顶点数量很多。
    let offsetPoint = computeOffsetPoint(srcLine[1].position, srcLine[0].position, !leftSide)
    desLine.push(offsetPoint)
    desColor.push(srcLine[0].color)

    // 偏移直线上除第一个顶点之外的顶点。
    for (let j = 1; j < srcLine.length; j++) {
      let offsetPoint = computeOffsetPoint(srcLine[j - 1].position, srcLine[j].position, leftSide)
      desLine.push(offsetPoint)
      desColor.push(srcLine[j].color)
    }
  }

  for (let i = 0; i < doubleSolidLines.length; i++) {
    let doubleSolidLine = []
    let doubleSolidColor = []

    const line = doubleSolidLines[i]

    if (line.length < 2) { // 顶点数小于2个的线舍弃，因为需要保证line[0] line[1]是有效的
      continue
    }

    computeOffsetLine(doubleSolidLine, doubleSolidColor, line, true) // 计算向左边偏移的线
    doubleSolidLinesTransformed.push(doubleSolidLine)
    doubleSolidColorsTransformed.push(doubleSolidColor)

    doubleSolidLine = [] // 清空左边偏移线数据，接下来计算右边偏移线数据。
    doubleSolidColor = []

    computeOffsetLine(doubleSolidLine, doubleSolidColor, line, false) // 计算向右边偏移的线
    doubleSolidLinesTransformed.push(doubleSolidLine)
    doubleSolidColorsTransformed.push(doubleSolidColor)
  }
  
  const doubleSolidLineOptions = {
    lines: doubleSolidLinesTransformed,
    colors: doubleSolidColorsTransformed,
    useVertexAlpha: false
  }
  BABYLON.MeshBuilder.CreateLineSystem('', doubleSolidLineOptions, This.sceneIns)
}

function drawNoneRoadLines(This, noneLines, noneColors) {
  // 绘制非道路标线
  const noneOptions = {
    lines: noneLines,
    colors: noneColors,
    useVertexAlpha: false
  }
  BABYLON.MeshBuilder.CreateLineSystem('', noneOptions, This.sceneIns)
}

function drawSingleBrokenLines(This, singleBrokenLines, singleBrokenColors) { // 虚线有可能是直线，也有可能是曲线，就当作曲线对待。
  // 绘制单虚线
  const lines = []
  const colors = []

  const dashSize = 2
  const gapSize = 3
  for (let i = 0; i < singleBrokenLines.length; i++) {
    const curvePoints = singleBrokenLines[i]
    const curvePath = new BABYLON.Path3D(curvePoints)
    const curveLength = curvePath.getDistanceAt(1.0)

    const curveColors = singleBrokenColors[i]

    let drewLength = 0.0
    let drawDash = false
    while (drewLength < curveLength) {
      if (drawDash) {
        const startPoint = curvePath.getPointAt(drewLength / curveLength)
        const endPoint = curvePath.getPointAt((drewLength + dashSize) / curveLength)
        const line = [startPoint, endPoint]
        const color = [curveColors[0], curveColors[0]] // 取该曲线上第一点的颜色为该曲线的颜色
        lines.push(line)
        colors.push(color)

        drewLength += dashSize
      } else {
        drewLength += gapSize
      }

      drawDash = !drawDash
    }
  }

  const dashLineoptions = {
    lines: lines,
    colors: colors,
    useVertexAlpha: false
  }
  BABYLON.MeshBuilder.CreateLineSystem('', dashLineoptions, This.sceneIns)
}
