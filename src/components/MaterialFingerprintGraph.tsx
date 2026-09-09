import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, Float, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function ImportedMaterialModel({ reducedMotion }: { reducedMotion: boolean }) {
  const { scene } = useGLTF('./model2.glb')
  const model = useMemo(() => scene.clone(true), [scene])
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    const { x, y } = state.pointer

    if (group.current && !reducedMotion) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x * 0.24 + 0.35, 0.035)
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y * 0.12 - 0.08, 0.035)
    }

  })

  return (
    <Float
      speed={reducedMotion ? 0 : 1.05}
      rotationIntensity={reducedMotion ? 0 : 0.045}
      floatIntensity={reducedMotion ? 0 : 0.14}
    >
      <group ref={group} position={[0.52, -0.04, 0]} rotation={[0.06, 0.35, 0]}>
        <Center>
          <primitive object={model} scale={2.65} />
        </Center>

      </group>
    </Float>
  )
}

function LoadingMark() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.62, 0.012, 12, 64]} />
      <meshBasicMaterial color="#c69b4a" transparent opacity={0.7} />
    </mesh>
  )
}

function isLowEndDevice() {
  if (typeof navigator === 'undefined') return false
  const device = navigator as Navigator & { deviceMemory?: number; connection?: { effectiveType?: string; saveData?: boolean } }
  const slowConnection = /^(slow-2g|2g)$/.test(device.connection?.effectiveType || '') || device.connection?.saveData === true
  return slowConnection || (device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 2) || (device.deviceMemory !== undefined && device.deviceMemory <= 2)
}

export function MaterialFingerprintGraph() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [lowEndDevice] = useState(isLowEndDevice)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    const handler = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  if (lowEndDevice) {
    return (
      <div className="media-fallback" role="status">
        <strong>Interactive model optimized for this device</strong>
        <span>The evidence workflow remains available below.</span>
      </div>
    )
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 38 }}
      dpr={[1, 1.25]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      performance={{ min: 0.5 }}
      aria-label="Interactive 3D KYNEX material model with pointer-responsive rotation"
    >
      <ambientLight intensity={1.75} />
      <directionalLight position={[4, 5, 4]} intensity={3.1} color="#fff4d9" />
      <directionalLight position={[-4, -3, -2]} intensity={1.35} color="#a6c8ba" />
      <pointLight position={[2, 2, 3]} color="#c69b4a" intensity={18} distance={6} />
      <pointLight position={[-3, 1, 2]} color="#b75e3e" intensity={5} distance={6} />

      <Suspense fallback={<LoadingMark />}>
        <ImportedMaterialModel reducedMotion={reducedMotion} />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={!reducedMotion}
        rotateSpeed={0.38}
        maxPolarAngle={Math.PI / 1.55}
        minPolarAngle={Math.PI / 3.1}
      />
    </Canvas>
  )
}

useGLTF.preload('./model2.glb')
