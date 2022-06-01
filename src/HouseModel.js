import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Model({Storm,ClosedPro,Desert, Forest , MeshStaticData,MeshData,DistData ,...props }) {
  const group = useRef()
  const { nodes, materials } = useGLTF('/Mobilehouse.glb')
  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.MainConstr.geometry}
        material={materials.Mmain}
        material-color={MeshData.houseColor} 
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.WinProt.geometry}
        material={nodes.WinProt.material}
        material-color={MeshData.winProColor}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube030.geometry}
        material={materials.WinDoor_Glass}
        material-emissiveIntensity={DistData.lights} 
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube030_1.geometry}
        material={materials.Edit_WinDoors}
        material-color={MeshData.windowsColor}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Roof_Tile_One_low.geometry}
        material-color={MeshData.roofcolor}
        material={nodes.Roof_Tile_One_low.material}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.RoofL_low.geometry}
        material-color={MeshData.roofcolor}
        material={nodes.RoofL_low.material}
      />
      {ClosedPro?<>
       <mesh
        castShadow
        receiveShadow
        geometry={nodes.WinProtClossed.geometry}
        material={nodes.WinProtClossed.material}
        material-color={MeshData.winProColor}
      />
      </>:<></>}
  
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.RoofTube.geometry}
        material={materials.Edit_OutTube}
        material-color={MeshData.tubeColor}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.UnderConst.geometry}
        material={materials.Underconst}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.WheelMet001.geometry}
        material={materials.RubberWhell}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.WheelMet001_1.geometry}
        material={materials['Metal-Felge']}
      />
       {Storm? <mesh
        castShadow
        receiveShadow
        material={materials.Materialsd}
        geometry={nodes.sky.geometry}
        material={materials.Materialsd}
      />
      : <></>}
      
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder007.geometry}
        material={materials['DeckChair Frame.001']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder007_1.geometry}
        material={materials.DeckChairFabric}
      />
    </group>
  )
}

useGLTF.preload('/Mobilehouse.glb')
