import {
  Vector3,
  Quaternion,
  Angle
} from '@babylonjs/core/Legacy/legacy'
import {
  constructVehicleMesh
} from './vehicle.js'
import {
  constructPedestrianMesh
} from './pedestrian.js'

export function prepareKeyframeDatasForTestee(This, dataSrc) { // 准备关键帧数据，以备插值之用
  if (!dataSrc.reportTs) {
    return
  }

  const interpolatorRelatedData = This.testeeData

  if (interpolatorRelatedData.serverBeginTime === 0) { // 设置server端案例开始的时间
    interpolatorRelatedData.serverBeginTime = dataSrc.reportTs
  }

  const serverRelativeTime = dataSrc.reportTs - interpolatorRelatedData.serverBeginTime // server端该时间戳（dataSrc.reportTs）对应的案例已运行时间。
  const frameData = {}
  frameData.serverRelativeTime = serverRelativeTime
  frameData.bottom_center = dataSrc.bottom_center
  frameData.rotationDegree = dataSrc.rotationDegree // 本次消息所对应的车辆朝向。
  frameData.rotationDegree = new Vector3(0, 0, Angle.FromDegrees(frameData.rotationDegree.z).radians())
  interpolatorRelatedData.keyframeDatas.push(frameData)

  const arraySize = interpolatorRelatedData.keyframeDatas.length
  const newestServerRelativeTime = interpolatorRelatedData.keyframeDatas[arraySize - 1].serverRelativeTime // 客户端最近一次接受到的消息所对应的案例已运行时间
  // 客户端并不是在第一次收到服务端消息的时候就开始运行案例，而是等待案例在服务端运行clientDelayReadTime时间之后才开始运行案例，用于缓冲网络延迟，保证客户端在整个案例运行过程中都有数据，不至于停顿。
  if (newestServerRelativeTime > interpolatorRelatedData.clientDelayReadTime) { 
    interpolatorRelatedData.dataReady = true
  }
}

/*
 * 案例中运行的车的出现时间点和消失时间点是不确定的，所以每次有数据来的时候都需要把当前npcMap中npc车的alive状态设置为false。
 * 对于本次发送来的npcList数据，即当前还活着的npc，将其alive置为true。
 * 在更新了npcMap数据之后，把alive状态为false的车清除。
 */
export function prepareKeyframeDatasForNpcList(This, npcList) {
  for (const npc of This.npcMap.values()) {
    npc.alive = false
  }

  for (let i = 0; i < npcList.length; ++i) {
    const npcDataSrc = npcList[i]
    const key = npcDataSrc.id
    if (!This.npcMap.has(key)) {
      const originData = {
        npcMesh: null,
        directionArray: null,
        height: npcDataSrc.box.size.z,
        serverBeginTime: 0,
        clientBeginTime: 0,
        clientDelayReadTime: 1000,
        dataReady: false,
        keyframeDatas: [],
        interpedLocation: null,
        interpedRotation: null,
        alive: true
      }
      switch (npcDataSrc.type) {
        case 37: constructVehicleMesh(This, originData, npcDataSrc); break // vehicle
        case 42: constructPedestrianMesh(This, originData, npcDataSrc); break // pedestrian
      }

      This.npcMap.set(key, originData)
    }
    const npcDataDes = This.npcMap.get(key)
    npcDataDes.alive = true

    if (!npcDataSrc.report_ts) {
      continue
    }

    if (npcDataDes.serverBeginTime === 0) {
      npcDataDes.serverBeginTime = npcDataSrc.report_ts
    }

    const serverRelativeTime = npcDataSrc.report_ts - npcDataDes.serverBeginTime
    const frameData = {}
    frameData.serverRelativeTime = serverRelativeTime
    frameData.bottom_center = npcDataSrc.box.bottom_center
    const queternion = new Quaternion(0, 0, npcDataSrc.box.rotation.z, npcDataSrc.box.rotation.w)
    frameData.rotationDegree = queternion.toEulerAngles()
    npcDataDes.keyframeDatas.push(frameData)

    const arraySize = npcDataDes.keyframeDatas.length
    const newestServerRelativeTime = npcDataDes.keyframeDatas[arraySize - 1].serverRelativeTime
    if (newestServerRelativeTime > npcDataDes.clientDelayReadTime) {
      npcDataDes.dataReady = true
    }
  }

  for (const npc of This.npcMap.values()) {
    if (!npc.alive) {
      npc.npcMesh && npc.npcMesh.dispose()
    }
  }
}

export function interpolateForVehicle(dataSrc) {
  const interpolatorRelatedData = dataSrc

  if (!interpolatorRelatedData.dataReady) {
    return
  }

  if (interpolatorRelatedData.clientBeginTime === 0) { // 设置案例在客户端运行的开始时间
    interpolatorRelatedData.clientBeginTime = new Date().getTime()
  }

  const clientRelativeTime =
    new Date().getTime() - interpolatorRelatedData.clientBeginTime // 案例在客户端已运行的时间

  const arraySize = interpolatorRelatedData.keyframeDatas.length
  const newestServerRelativeTime = interpolatorRelatedData.keyframeDatas[arraySize - 1].serverRelativeTime
  if (clientRelativeTime >= newestServerRelativeTime) { // 理论上当前的clientRelativeTime应该永远小于keyframeDatas中最新的serverRelativeTime，这样客户端案例才不会停顿。
    interpolatorRelatedData.dataReady = false
    interpolatorRelatedData.serverBeginTime = 0
    interpolatorRelatedData.clientBeginTime = 0

    return
  }

  // 从keyframeDatas中选择客户端案例当前运行时间节点所对应的帧数据
  let selectedIndex = -1
  for (let i = 0; i < arraySize - 1; ++i) {
    if (
      interpolatorRelatedData.keyframeDatas[i].serverRelativeTime <=
          clientRelativeTime &&
        clientRelativeTime <
          interpolatorRelatedData.keyframeDatas[i + 1].serverRelativeTime
    ) {
      selectedIndex = i
      break
    }
  }

  if (selectedIndex === -1) {
    return
  }

  const interpHead = interpolatorRelatedData.keyframeDatas[selectedIndex]
  const interpTail =
      interpolatorRelatedData.keyframeDatas[selectedIndex + 1]
  const interpRadio =
      (clientRelativeTime - interpHead.serverRelativeTime) /
      (interpTail.serverRelativeTime - interpHead.serverRelativeTime)
  const interpHeadPosition = new Vector3(
    interpHead.bottom_center.x,
    interpHead.bottom_center.y,
    0
  )
  const interpTailPosition = new Vector3(
    interpTail.bottom_center.x,
    interpTail.bottom_center.y,
    0
  )

  const interpHeadRotation = new Vector3(
    interpHead.rotationDegree.x,
    interpHead.rotationDegree.y,
    interpHead.rotationDegree.z
  )
  const interpTailRotation = new Vector3(
    interpTail.rotationDegree.x,
    interpTail.rotationDegree.y,
    interpTail.rotationDegree.z
  )

  // 我们假设相邻关键帧之间的角度变化不超过Math.PI，此处解决车辆在路口转弯时发生打转的问题。
  if ((Math.PI / 2 < interpHeadRotation.z && interpHeadRotation.z < Math.PI) &&
     (-Math.PI < interpTailRotation.z && interpTailRotation.z < -Math.PI / 2)) { // 这种情况下相邻关键帧之间的夹角超过pi，修改interpTailRotation的角度表示，使相邻关键帧之间的夹角小于pi。
    interpTailRotation.z += 2 * Math.PI
  } else if ((-Math.PI < interpHeadRotation.z && interpHeadRotation.z < -Math.PI / 2) &&
          (Math.PI / 2 < interpTailRotation.z && interpTailRotation.z < Math.PI)) { // 这种情况下相邻关键帧之间的夹角超过pi，修改interpTailRotation的角度表示，使相邻关键帧之间的夹角小于pi。
    interpTailRotation.z -= 2 * Math.PI
  }

  // 对找到的前后帧数据进行插值，得到当前车辆的准确位置和朝向。
  interpolatorRelatedData.interpedLocation = interpHeadPosition.scale(1 - interpRadio).add(interpTailPosition.scale(interpRadio))
  interpolatorRelatedData.interpedRotation = interpHeadRotation.scale(1 - interpRadio).add(interpTailRotation.scale(interpRadio))

  // rotation 转化到-pi到pi的范围内。
  if (interpolatorRelatedData.interpedRotation > Math.PI) {
    interpolatorRelatedData.interpedRotation -= 2 * Math.PI
  } else if (interpolatorRelatedData.interpedRotation < -Math.PI) {
    interpolatorRelatedData.interpedRotation += 2 * Math.PI
  }

  for (let i = 0; i < selectedIndex; ++i) { // 过期的数据要删除
    interpolatorRelatedData.keyframeDatas.shift()
  }
}

export function interpolateForNpcList(dataSrc) {
  for (const value of dataSrc.values()) {
    interpolateForVehicle(value)
  }
}
