import * as BABYLON from '@babylonjs/core/Legacy/legacy'

/**
 * 处理偏置
 */
export function convertToClientLocation(serverLocation, offset) {
  let clientLocation = switchPosition(serverLocation)

  const originToBottom = new BABYLON.Vector3.Zero()
  clientLocation = clientLocation.subtract(originToBottom)

  let { x, y, z } = offset
  z = 0
  const mapOffset = switchPosition(new BABYLON.Vector3(x, y, z))
  clientLocation = clientLocation.subtract(mapOffset)

  return clientLocation
}

// 解析轨迹结构体，拿到需要的数组
export function getTrajectory(obj, offset) {
  if (!offset) {
    return
  }
  const list = obj.trajectories || []
  let dest = []
  for (const item of list) {
    if (item.trajectory_type === 3) {
      dest = item.trajectory_points
    }
  }
  // 处理dest
  const pathPoints = []
  for (const p of dest) {
    // 模拟规划路径
    const { x, y, z } = p.bottom_center
    const { _x, _y, _z } = convertToClientLocation(new BABYLON.Vector3(x, y, 0), offset)
    pathPoints.push(new BABYLON.Vector3(_x, _y, -1))
  }
  // console.log(pathPoints)
  return pathPoints
}

// 高精度地图采用的是右手坐标系，babylon.js采用的是左手坐标系
export function switchPosition(rightHandPosition) {
  return new BABYLON.Vector3(rightHandPosition.x, -rightHandPosition.y, rightHandPosition.z)
}

export function switchRotation(rightHandRotation) {
  return new BABYLON.Vector3(rightHandRotation.x, rightHandRotation.y, -rightHandRotation.z)
}

