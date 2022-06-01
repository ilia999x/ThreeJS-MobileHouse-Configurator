

import React, { useEffect , useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh'

export default function Model({DistData,props}) {
  const group = useRef()

  useEffect(() => {
    if (group.current) {
      group.current.raycast = acceleratedRaycast
      console.log('we good')
      console.log(group.current)
      
      let geometry = group.current.geometry
      geometry.boundsTree = new MeshBVH(geometry)
      console.log('opted')
    }
  }, [group])
  
  const { nodes, materials } = useGLTF('/Desert.glb')
  return (
    <>
    <mesh
        castShadow
        receiveShadow
        geometry={nodes.DES_out.geometry}
        material={materials.outsiderland}
        material-envMapIntensity={0.1}
        material-roughness={DistData.stormdesert}
        >
        <bufferGeometry attach={nodes.DES_out.geometry}></bufferGeometry>
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.DES_main.geometry}
        material={materials.mainlanf}
        position={[-12.51, -18.3, 9.03]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.67, 0.72, 1.53]}
        material-envMapIntensity={0.1}
        material-roughness={DistData.stormdesert}
        >
        <bufferGeometry attach={nodes.DES_main.geometry}></bufferGeometry>
      </mesh>
    </>
  )
}

useGLTF.preload('/Desert.glb')
