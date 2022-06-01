import * as THREE from 'three'
import React, { useLayoutEffect, useRef, useMemo } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { ProgressiveLightMap } from 'three/examples/jsm/misc/ProgressiveLightMap'

extend({ ProgressiveLightMap })

export function Lightmap({ children, position = [60, 150, 150], resolution = 2048, intensity = 1, ambient = 0.5, radius = 40, blend = 70, lights = 20 }) {
  const rGroup = useRef()
  const rLightmap = useRef()
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  const dirLights = useMemo(
    () =>
      [...Array(lights)].map((_, i) => {
        let dirLight = new THREE.DirectionalLight(0xffffff, intensity / lights)
        dirLight.castShadow = true
        dirLight.shadow.camera.near = 0.5
        dirLight.shadow.camera.far = 5000
        dirLight.shadow.camera.right = dirLight.shadow.camera.top = 150
        dirLight.shadow.camera.left = dirLight.shadow.camera.bottom = -150
        dirLight.shadow.mapSize.width = dirLight.shadow.mapSize.height = resolution
        return dirLight
      }),
    [intensity, lights, resolution],
  )

  useLayoutEffect(() => {
    const lightmap = rLightmap.current
    const objects = [...dirLights]
    rGroup.current.traverse((child) => child.isMesh && objects.push(child))
    lightmap.addObjectsToLightMap(objects)
    return () => {
      lightmap.blurringPlane = null
      lightmap.lightMapContainers = []
      lightmap.compiled = false
      lightmap.scene.clear()
    }
  }, [children])

  useFrame(() => {
    rLightmap.current.update(camera, blend, true)
    for (let l = 0; l < dirLights.length; l++) {
       if (Math.random() > ambient)
         dirLights[l].position.set(position[0] + Math.random() * radius, position[1] + Math.random() * radius, position[2] + Math.random() * radius)
       else {
         let lambda = Math.acos(2 * Math.random() - 1) - Math.PI / 2.0
         let phi = 2 * Math.PI * Math.random()
         dirLights[l].position.set(Math.cos(lambda) * Math.cos(phi) * 300, Math.abs(Math.cos(lambda) * Math.sin(phi) * 300), Math.sin(lambda) * 300)
       }
    }
  })

  return (
    <>
      <progressiveLightMap ref={rLightmap} args={[gl, resolution]} />
      <group ref={rGroup}>{children}</group>
    </>
  )
}
