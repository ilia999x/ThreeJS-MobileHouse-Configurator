import React, { Suspense, useEffect, useState, useRef, useMemo } from "react"
import * as THREE from "three"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { ContactShadows, Environment, useGLTF, Html, PositionalAudio ,OrbitControls,Sky ,CameraShake, PerspectiveCamera } from "@react-three/drei"
import { proxy, useSnapshot } from "valtio"
import Paper from "@mui/material/Paper"
import Divider from "@mui/material/Divider"
import MenuList from "@mui/material/MenuList"
import MenuItem from "@mui/material/MenuItem"
import ListItemText from "@mui/material/ListItemText"
import "./styles.css"
import * as M from "@mui/material"
import Button from "@mui/material/Button"
import ForestA from "./audio/Forest-audio.mp3";
import ThunderA from "./audio/Thunder-audio.mp3";
import CanyonA from "./audio/Canyon.mp3";

import { Lightmap } from "./Lightmap"
import HouseModel from "./HouseModel"
import HouseModel_inside from "./HouseModel_inside"
import ForestM from "./Forest"
import DesertM from "./Desert"
import setInitialPositions from "./set-initial-positions"

const main = {
  boxSizing: "inherit",
  display: "flex",
}
const styleCanvas = {
  position: "absolute",
  top: 0,
  left: 0,
  marginLeft: 0,
}
const styleMainMenu = {
  top: 0,
  left: 0,
  margin: 2,
  height: " 100%",
  width: "100%",
  zIndex: 90000,
  //display: "grid"
}

const styleMenu = {
  top: 0,
  left: 0,
  margin: 2,
  height: " 100%",
  width: "100%",
  zIndex: 1,
  //display: "grid"
}

const color = new THREE.Color()
const randomVector = (r) => [r / 2 - Math.random() * r, r / 2 - Math.random() * r, r / 2 - Math.random() * r]
const randomEuler = () => [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]
const randomData = Array.from({ length: 1000 }, (r = 10) => ({ random: Math.random(), position: randomVector(r), rotation: randomEuler() }))
const Raindruup = () => new THREE.Points()

const Rains = ({ rainCount, blend }) => {
  const [positions, velocities, accelerations] = useMemo(() => {
    const [initialPositions, initialVelocities, initialAccelerations] = setInitialPositions(rainCount)
    const positions = new Float32Array(initialPositions)
    const velocities = new Float32Array(initialVelocities)
    const accelerations = new Float32Array(initialAccelerations)
    return [positions, velocities, accelerations]
  }, [rainCount])
  const uniforms = useMemo(() => ({ time: { value: 1.0 } }), [])

  const geom = useRef()

  const vert = `uniform float time;
    attribute vec3 velocity;
    attribute vec3 acceleration;
    void main() {
        vec3 pos = position;
        
        gl_Position = projectionMatrix 
            * modelViewMatrix
            * vec4(
                vec3(
                    mod(100.+pos[0]+time*.5,30.)-20.,
                    mod(pos[1] + (time * velocity[1] * acceleration[1]),20.),
                    pos[2]), 0.5);
        gl_PointSize = 8.0;
    }`
  const rainMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.1,
    transparent: true,
  })
  const frag = `uniform float time;
    void main() {
        float z = 1.0 - (gl_FragCoord.z / gl_FragCoord.w) / 1.0;
        gl_FragColor = vec4(20., 100, 5.0, 1.0);
    }`

  useFrame(({ clock }) => {
    if (geom.current) {
      geom.current.material.uniforms.time.value = clock.getElapsedTime()
      geom.current.geometry.verticesNeedUpdate = true
    }
  })

  return (
    <points ref={geom}>
      <bufferGeometry attach="geometry">
        <bufferAttribute attachObject={["attributes", "position"]} count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attachObject={["attributes", "velocity"]} count={velocities.length / 3} array={velocities} itemSize={3} />
        <bufferAttribute attachObject={["attributes", "acceleration"]} count={accelerations.length / 3} array={accelerations} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial attach="material" uniforms={uniforms} vertexShader={vert} fragmentShader={frag} vertexColors />
    </points>
  )
}

export default function App() {
  const materialRef = useRef()
  console.log('hello testa')
  const light = useRef()
  const meshDataBasic = {
    roofcolor: "#683d1d",
    houseColor: "#fff",
    windowsColor: "#fff",
    tubeColor: "#fff",
    winProColor: "#fff",
  }
  const [Color, setColor] = useState({
    RColor: meshDataBasic.roofcolor,
    HColor: meshDataBasic.houseColor,
    WColor: meshDataBasic.windowsColor,
    TColor: meshDataBasic.tubeColor,
    WPColor: meshDataBasic.winProColor,
  })
  const [RColor, setRColor] = useState(meshDataBasic.roofcolor)
  const [HColor, setHColor] = useState(meshDataBasic.houseColor)
  const [WColor, setWColor] = useState(meshDataBasic.windowsColor)
  const [TColor, setRTColor] = useState(meshDataBasic.tubeColor)
  const [WPColor, setWPColor] = useState(meshDataBasic.winProColor)
  const [TLight, setTLight] = useState(0)
  const [Lighting, setLighting] = useState(0)
  const [Storm, setStorm] = useState(false)
  const [Inside, setInside] = useState(false)
  const [Dry, setDry] = useState(false)
  const [Wind, setWind] = useState(false)
  const [Desert, setDesert] = useState(false)
  const [Forest, setForest] = useState(true)
  const [ClosedPro, setClosedPro] = useState(false)
  const [storme, setstorme] = useState(0.1)
  const [counttime, setCounttime] = useState(0)
  const [Day, setDay] = useState(true)

  const SkyStorm = Storm ? 4.5 : 4.54
  const EnvStormNight = Storm ? "sunset" : "night"
  const EnvStormDay = Storm ? "park" : "forest"
  const Env = Day ? EnvStormDay : EnvStormNight
  const Daydesert = Desert ? 2 : 5
  const Dpigment = Storm ? 0.5 : Daydesert
  const DesertCameraMin = Desert ? 6 : 3.5
  const DesertCameraMax = Desert ? 25 : 5
  const DesertAmbo = Desert ? 0.85 : 0.05
  const DesertCAngle = Desert ? 1.5 : 1.35
  const Ddey = Storm ? 0.1 : DesertAmbo
  const DayValue = Day ? Dpigment : 0.1
  const AmbValue = Day ? Ddey : 0
  const skyValue = Day ? SkyStorm : 0
  const SpotValue = Day ? 0 : storme

  const roofColor = [
    { id: 1, title: "brown", value: "#683d1d", price: 5000 },
    { id: 2, title: "black", value: "#181616", price: 3000 },
    { id: 3, title: "gray", value: "#8f8f8f", price: 1000 },
  ]
  const houseColor = [
    { id: 1, title: "brown", value: "#fff", price: 5000 },
    { id: 2, title: "black", value: "#683d1d", price: 3000 },
    { id: 3, title: "gray", value: "#8f8f8f", price: 1000 },
  ]
  const windowsColor = [
    { id: 1, title: "brown", value: "#fff", price: 5000 },
    { id: 2, title: "black", value: "#181616", price: 3000 },
    { id: 3, title: "gray", value: "#8f8f8f", price: 1000 },
  ]
  const tubeColor = [
    { id: 1, title: "brown", value: "#fff", price: 5000 },
    { id: 2, title: "brown", value: "#422815", price: 3000 },
    { id: 3, title: "black", value: "#8f8f8f", price: 1000 },
  ]
  const winProColor = [
    { id: 1, title: "brown", value: "#fff", price: 5000 },
    { id: 2, title: "black", value: "#181616", price: 3000 },
    { id: 3, title: "gray", value: "#8f8f8f", price: 1000 },
  ]
  // const CanyonA = require("./audio/Canyon.mp3")
  // const ThunderA = require("./audio/Thunder-audio.mp3")
  // const ForestA = require("./audio/Forest-audio.mp3")

  const [Audio, setAudio] = useState(ForestA)
  console.log(Audio)
  const MeshData = {
    roofcolor: RColor,
    houseColor: HColor,
    windowsColor: WColor,
    tubeColor: TColor,
    winProColor: WPColor,
  }

  const DistData = {
    storm: Storm ? 0 : 0.5,
    stormdesert: Storm ? 10 : 20,
    dry: Dry ? 1 : 2,
    wind: Wind ? 0 : 2,
    lights: Day ? 0 : 3,
  }

  const MeshStaticData = {
    roofBump: RColor,
  }
  useEffect(() => {
    Storm ? setAudio(ThunderA) : Desert ? setAudio(CanyonA) : setAudio(ForestA)
  }, [Storm])

  useEffect(() => {
    Desert ? setAudio(CanyonA) : setAudio(ForestA)
  }, [Desert])
  const D = 150
  const [Roof, setRoof] = useState(1)
  const [hovered, onHover] = useState(null)
  const selected = hovered ? [hovered] : undefined
  const lightoo = useRef()
  const propser = {
    intensity: { value: 20, min: 0, max: 1, step: 0.1 },
    ambient: { value: 0.5, min: 0, max: 1, step: 0.1 },
    radius: { value: 10, min: 0, max: 100, step: 1 },
    blend: { value: 40, min: 1, max: 200, step: 1 },
  }

  const raindensity = Desert ? 4 : 2
  const proped = {
    InsideCam: { fov: 20, min: 0, max: 1, step: 0.1 },
    ambient: { value: 0.5, min: 0, max: 1, step: 0.1 },
    radius: { value: 10, min: 0, max: 100, step: 1 },
    blend: { value: raindensity, min: 1, max: 200, step: 1 },
    rainCount: { value: 5000, min: 1, max: 10000, step: 1 },
  }

  const rainprops = {
    focus: { value: 5.1, min: 3, max: 7, step: 0.01 },
    speed: { value: 0.1, min: 0.1, max: 100, step: 0.1 },
    aperture: { value: 1.8, min: 1, max: 5.6, step: 0.1 },
    rainCount: { value: 2000, min: 0, max: 8000 },
    curl: { value: 0.25, min: 0.01, max: 0.5, step: 0.01 },
  }

  const camfov = Inside ? 200 : 50
  console.log(camfov)
  const camzoom = { position: [150, Math.PI * 8, 12], fov: camfov }
  console.log(camzoom)
  const cameraPos = {
    pos1: {
      value1: -0.261775,
      value2: 0.87,
      value3: 3.061775,
    },
    pos2: {
      value1: 0.261775,
      value2: 0.87,
      value3: 0.561775,
    },
    pos3: {
      value1: 0.261775,
      value2: 0.87,
      value3: -1.261775,
    },
    pos4: {
      value1: 1.261775,
      value2: 0.87,
      value3: -3.061775,
    },
    pos5: {
      value1: 1.261775,
      value2: 0.87,
      value3: 1.061775,
    },
  }
  const [PostList, setPostList] = useState(cameraPos.pos1)
  console.log(PostList)

  const RoomsLights = [
    {
      pos: cameraPos.pos1,
      value1: 0.5,
      value2: 1.3,
      value3: 2.061775,
      name: "kitchen",
    },
    {
      value1: 1,
      value2: 0.8,
      value3: -1.261775,
      name: "kitchen 2",
    },
    {
      pos: cameraPos.pos2,
      value1: -1,
      value2: 1,
      value3: 0.061775,
      name: "toilet one",
    },
    {
      pos: cameraPos.pos3,
      value1: -1,
      value2: 0,
      value3: -2.061775,
      name: "toilet two",
    },
    {
      pos: cameraPos.pos4,
      value1: 1,
      value2: 0,
      value3: -4.061775,
      name: "badroom",
    },
  ]
  const InsideRooms = [
    {
      pos: cameraPos.pos1,
      value1: 2,
      value2: -1,
      value3: 3.061775,
      name: "kitchen",
    },
    {
      pos: cameraPos.pos5,
      value1: 2,
      value2: -1,
      value3: 1.061775,
      name: "kitchen 2 ",
    },
    {
      pos: cameraPos.pos2,
      value1: -1.5,
      value2: -1,
      value3: -0.061775,
      name: "toilet one",
    },
    {
      pos: cameraPos.pos3,
      value1: -1,
      value2: -1,
      value3: -2.061775,
      name: "toilet two",
    },
    {
      pos: cameraPos.pos4,
      value1: 1.5,
      value2: -1,
      value3: -5.061775,
      name: "badroom",
    },
  ]

  return (
    <div style={main}>
      <div style={styleMenu}>
        <Menu
          setInside={setInside}
          Inside={Inside}
          setClosedPro={setClosedPro}
          ClosedPro={ClosedPro}
          setForest={setForest}
          setDesert={setDesert}
          setDry={setDry}
          setWind={setWind}
          setStorm={setStorm}
          setColor={setColor}
          setRColor={setRColor}
          setHColor={setHColor}
          setWColor={setWColor}
          setWPColor={setWPColor}
          setRTColor={setRTColor}
          roofColor={roofColor}
          houseColor={houseColor}
          windowsColor={windowsColor}
          tubeColor={tubeColor}
          winProColor={winProColor}
        />
      </div>
      <div style={styleMainMenu}>
        <MainMenu Day={Day} setDay={setDay} />
      </div>

      <Canvas
        sRGB
        colorManagement
        shadows
        dpr={[2, 3]}
        gl={{ preserveDrawingBuffer: true, depth: true, powerPreference: "low-power" }}
        style={styleCanvas}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 0.9
          gl.autoClear = true
          gl.outputEncoding = THREE.sRGBEncoding
        }}>
        <Sky turbidity={120} elevation={100} rayleigh={2} exposure={1} azimuth={5} inclination={skyValue} distance={100000} />

        {Inside ? (
          <>
            <ambientLight intensity={0.5} />

            <Suspense fallback={null}>
              <Environment preset="apartment" />
              <Lightmap position={[50, 150, 50]} {...propser}>
                <HouseModel_inside />

                {RoomsLights.map((light) => (
                  <pointLight
                    intensity={1}
                    castShadow
                    position={[light.value1, light.value2, light.value3]}
                    shadow-mapSize-height={100}
                    shadow-mapSize-width={100}
                  />
                ))}
                {InsideRooms.map((room) => (
                  <Html
                    key={room.name}
                    distanceFactor={0}
                    position={[room.value1, room.value2, room.value3]}
                    transform
                    sprite
                    zIndexRange={[100, 0]}
                    fullscreen>
                    <Button size="humongous" sx={{ fontSize: 3, fontWeight: 600 }} onClick={(e) => setPostList(room.pos)} variant="contained">
                      <h5>{room.name}</h5>
                    </Button>
                  </Html>
                ))}
              </Lightmap>
            </Suspense>
            <PerspectiveCamera position={(150, Math.PI * 8, 12)} fov={250} zoom={-1} />
            <OrbitControls
              target={[PostList.value1, PostList.value2, PostList.value3]}
              rotateSpeed={Math.PI * 0.5}
              position={(0, 20, 1)}
              minPolarAngle={Math.PI / 3}
              minDistance={Math.PI * 0.01}
              enablePan={false}
              maxDistance={Math.PI * 0.01}
              maxPolarAngle={1.7}
            />
          </>
        ) : (
          <>
            <PerspectiveCamera position={(150, Math.PI * 8, 12)} fov={camfov} zoom={-1} />
            <ambientLight intensity={AmbValue} />
            {Day ? (
              <>
                <fog attach="fog" near={1} far={1000} args={["#fff8ed", 10, 10]} />
              </>
            ) : (
              <></>
            )}

            <Suspense fallback={null}>
              {Desert ? (
                <>
                  <Lightmap position={[50, 150, 50]} {...propser}>
                    <DesertM DistData={DistData} />
                  </Lightmap>
                  <directionalLight
                    intensity={DayValue}
                    castShadow
                    position={(20, 80, 30)}
                    shadow-mapSize-height={4096}
                    shadow-mapSize-width={4096}
                    shadow-camera-far={100}
                    shadow-camera-left={-100}
                    shadow-camera-right={100}
                    shadow-camera-top={100}
                    shadow-camera-bottom={-100}
                  />
                </>
              ) : (
                <></>
              )}

              {Forest ? (
                <>
                  <Environment preset={Env} />
                  <directionalLight
                    intensity={DayValue}
                    castShadow
                    position={25.5}
                    shadow-mapSize-height={4096}
                    shadow-mapSize-width={4096}
                    shadow-radius={20}
                    shadow-camera-near={0.01}
                    shadow-camera-far={100}
                    shadow-camera-left={-50}
                    shadow-camera-right={50}
                    shadow-camera-top={50}
                    shadow-camera-bottom={-50}
                  />
                  <ForestM />
                </>
              ) : (
                <></>
              )}

              <PositionalAudio autoplay url={Audio} />
              <Html distanceFactor={5} position={[2, 4, -5]} transform sprite zIndexRange={[100, 0]} fullscreen>
                <Button onClick={(e) => setInside(true)} variant="contained">
                  inside
                </Button>
              </Html>
              <HouseModel
                Storm={Storm}
                ClosedPro={ClosedPro}
                Forest={Forest}
                Desert={Desert}
                MeshStaticData={MeshStaticData}
                DistData={DistData}
                MeshData={MeshData}
              />
            </Suspense>
            <OrbitControls
              makeDefault
              rotateSpeed={Math.PI * 0.5}
              position={(0, 100, 3)}
              minPolarAngle={Math.PI / 4}
              minDistance={Math.PI * DesertCameraMin}
              enablePan={false}
              maxDistance={Math.PI * DesertCameraMax}
              maxPolarAngle={DesertCAngle}
            />
            {Storm ? (
              <>
                <Rains {...proped} />
                <CameraShake additive yawFrequency={1} maxYaw={0.4} pitchFrequency={1} maxPitch={0.05} rollFrequency={5} maxRoll={0.1} intensity={0.2} />
              </>
            ) : (
              <></>
            )}
          </>
        )}
      </Canvas>
    </div>
  )
}

const state = proxy({
  current: null,
  items: {
    roof_brown: "#ffffff",
    roof_darck: "#ffffff",
    roof_gray: "#ffffff",
    inner: "#ffffff",
    sole: "#ffffff",
    stripes: "#ffffff",
    band: "#ffffff",
    patch: "#ffffff",
  },
})

function MainMenu({ setDay, Day }) {
  const colorme = Day ? "#000" : "#000"
  const colormeN = Day ? "#000" : "#FFF"
  return (
    <Paper sx={{ width: 320 }}>
      <MenuList dense>
        <MenuItem onClick={(e) => setDay(true)} sx={{ bgcolor: colorme, marginTop: "1px" }}>
          {" "}
          Day
        </MenuItem>
        <MenuItem onClick={(e) => setDay(false)} sx={{ bgcolor: colormeN, marginTop: "1px" }}>
          {" "}
          Night
        </MenuItem>
      </MenuList>
    </Paper>
  )
}

function Menu({
  setInside,
  Inside,
  setDesert,
  setForest,
  ClosedPro,
  setClosedPro,
  setStorm,
  setDry,
  setWind,
  setRColor,
  setHColor,
  setWColor,
  setWPColor,
  setRTColor,
  roofColor,
  houseColor,
  windowsColor,
  tubeColor,
  winProColor,
}) {
  const snap = useSnapshot(state)
  const [Roofprice, setRoofprice] = useState([])
  const [price, setprice] = useState(1000)
  const [Roof, setRoof] = useState(1)
  const impuls = (event, id) => {
    setRoof(id.value)
    setRoofprice(id.price)
    if (event) {
      setRColor(id.value)
    }
  }
  const impuls1 = (event, id) => {
    setRoof(id.value)
    setRoofprice(id.price)
    if (event) {
      setHColor(id.value)
    }
  }

  const impuls2 = (event, id) => {
    setRoof(id.value)
    setRoofprice(id.price)
    if (event) {
      setWColor(id.value)
    }
  }

  const impuls3 = (event, id) => {
    setRoof(id.value)
    setRoofprice(id.price)
    if (event) {
      setRTColor(id.value)
    }
  }

  const impuls4 = (event, id) => {
    setRoof(id.value)
    setRoofprice(id.price)
    if (event) {
      setWPColor(id.value)
    }
  }

  useEffect(() => {
    // Should not ever set state during rendering, so do this in useEffect instead.
    setprice(Roofprice)
  }, [Roof])

  return (
    <>
      <Paper sx={{ width: 320 }}>
        <MenuList dense>
          {Inside ? (
            <></>
          ) : (
            <div>
              <ListItemText sx={{ bgcolor: "#d6623540 ", marginTop: "1px" }} inset>
                Kolor dachu
              </ListItemText>
              <M.Stack sx={{ bgcolor: "#ffc7b11a ", marginTop: "1px" }} direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={0.8}>
                {roofColor.map((id, event) => (
                  <MenuItem key={id.id} onClick={(event) => impuls(event, id)}>
                    <M.Box
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: id.value,
                        "&:hover": {
                          backgroundColor: id.value,
                          opacity: [0.9, 0.9, 0.9],
                        },
                      }}
                    />
                  </MenuItem>
                ))}
              </M.Stack>
              <ListItemText sx={{ bgcolor: "#d6623540 ", marginTop: "1px" }} inset>
                Kolor elewacji
              </ListItemText>
              <M.Stack sx={{ bgcolor: "#ffc7b11a ", marginTop: "1px" }} direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={0.8}>
                {houseColor.map((id, event) => (
                  <MenuItem key={id.id} onClick={(event) => impuls1(event, id)}>
                    <M.Box
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: id.value,
                        "&:hover": {
                          backgroundColor: id.value,
                          opacity: [0.9, 0.9, 0.9],
                        },
                      }}
                    />
                  </MenuItem>
                ))}
              </M.Stack>
              <ListItemText sx={{ bgcolor: "#d6623540 ", marginTop: "1px" }} inset>
                Kolor okien
              </ListItemText>
              <M.Stack sx={{ bgcolor: "#ffc7b11a ", marginTop: "1px" }} direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={0.8}>
                {windowsColor.map((id, event) => (
                  <MenuItem key={id.id} onClick={(event) => impuls2(event, id)}>
                    <M.Box
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: id.value,
                        "&:hover": {
                          backgroundColor: id.value,
                          opacity: [0.9, 0.9, 0.9],
                        },
                      }}
                    />
                  </MenuItem>
                ))}
              </M.Stack>
              <ListItemText sx={{ bgcolor: "#d6623540 ", marginTop: "1px" }} inset>
                Kolor rynien
              </ListItemText>
              <M.Stack sx={{ bgcolor: "#ffc7b11a ", marginTop: "1px" }} direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={0.8}>
                {tubeColor.map((id, event) => (
                  <MenuItem key={id.id} onClick={(event) => impuls3(event, id)}>
                    <M.Box
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: id.value,
                        "&:hover": {
                          backgroundColor: id.value,
                          opacity: [0.9, 0.9, 0.9],
                        },
                      }}
                    />
                  </MenuItem>
                ))}
              </M.Stack>
              <ListItemText sx={{ bgcolor: "#d6623540 ", marginTop: "1px" }} inset>
                Kolor rolet
              </ListItemText>
              <M.Stack sx={{ bgcolor: "#ffc7b11a ", marginTop: "1px" }} direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={0.8}>
                {winProColor.map((id, event) => (
                  <MenuItem key={id.id} onClick={(event) => impuls4(event, id)}>
                    <M.Box
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: id.value,
                        "&:hover": {
                          backgroundColor: id.value,
                          opacity: [0.9, 0.9, 0.9],
                        },
                      }}
                    />
                  </MenuItem>
                ))}
              </M.Stack>
            </div>
          )}

          <Divider />
          <ListItemText></ListItemText>

          <Divider />

          <ListItemText sx={{ bgcolor: "#d6623540 ", marginTop: "1px" }} inset>
            Environment
          </ListItemText>
          <MenuItem>
            <ListItemText
              onClick={(e) => {
                setForest(false), setDesert(true)
              }}>
              Desert
            </ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem>
            <ListItemText
              onClick={(e) => {
                setDesert(false), setForest(true)
              }}>
              Forest
            </ListItemText>
          </MenuItem>
          <Divider />

          <ListItemText sx={{ bgcolor: "#d6623540 ", marginTop: "1px" }} inset>
            Wheaher
          </ListItemText>
          <MenuItem>
            <ListItemText
              onClick={(e) => {
                setStorm(true), setDry(false), setWind(false)
              }}>
              Storm
            </ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemText
              onClick={(e) => {
                setStorm(false), setDry(true), setWind(false)
              }}>
              Normal
            </ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemText
              onClick={(e) => {
                setStorm(false), setDry(false), setWind(true)
              }}>
              Wind
            </ListItemText>
          </MenuItem>
          <Divider />
          <ListItemText sx={{ bgcolor: "#d6623540 ", marginTop: "1px" }} inset>
            view
          </ListItemText>
          <MenuItem>
            <ListItemText
              onClick={(e) => {
                setInside(true)
              }}>
              Inside
            </ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemText
              onClick={(e) => {
                setInside(false)
              }}>
              Outside
            </ListItemText>
          </MenuItem>
          <Divider />
          {ClosedPro ? (
            <MenuItem>
              <ListItemText
                onClick={(e) => {
                  setClosedPro(false)
                }}>
                Closed
              </ListItemText>
            </MenuItem>
          ) : (
            <MenuItem>
              <ListItemText
                onClick={(e) => {
                  setClosedPro(true)
                }}>
                Close Window
              </ListItemText>
            </MenuItem>
          )}
          <MenuItem>
            <ListItemText>inside</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem>
            <ListItemText>calculate best quality</ListItemText>
          </MenuItem>
          <Divider />
          <ListItemText style={{ marginLeft: "10px" }}> Total: {price} ZL</ListItemText>
        </MenuList>
      </Paper>
    </>
  )
}
