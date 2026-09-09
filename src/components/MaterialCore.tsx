import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, RoundedBox } from '@react-three/drei'
import { useRef, useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'

function Core({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!group.current || reducedMotion) return
    const { x, y } = state.pointer
    // Subtle, gentle cursor tracking with lerp damping
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x * 0.35 + 0.45, 0.035)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y * 0.22 - 0.12, 0.035)
  })

  // Three layered source plates representing CPSE records (Copper, Olive, Ceramic Blue)
  const plates = useMemo(() => [
    { pos: [0, 0.44, 0] as [number, number, number], color: '#b75e3e', rot: 0.06 }, // Oxidized copper (CPCL)
    { pos: [0, 0.04, 0] as [number, number, number], color: '#5e7352', rot: -0.04 }, // Olive (SAIL)
    { pos: [0, -0.36, 0] as [number, number, number], color: '#3e667a', rot: 0.08 }, // Ceramic blue (NTPC)
  ], [])

  return (
    <Float
      speed={reducedMotion ? 0 : 1.4}
      rotationIntensity={reducedMotion ? 0 : 0.1}
      floatIntensity={reducedMotion ? 0 : 0.4}
    >
      <group ref={group} rotation={reducedMotion ? [0.05, 0.45, 0] : [0.05, 0.45, 0.02]}>
        {/* Transparent outer container representing the unified identity chamber */}
        <RoundedBox args={[2.6, 2.6, 2.6]} radius={0.14} smoothness={4}>
          <meshPhysicalMaterial
            color="#f2ebdd"
            transparent
            opacity={0.18}
            roughness={0.12}
            metalness={0.1}
            transmission={0.35}
            thickness={0.85}
            clearcoat={0.3}
          />
        </RoundedBox>

        {/* Layered ERP Source Plates with Barcode Stripes */}
        {plates.map((plate, index) => (
          <group key={index} position={plate.pos} rotation={[0, plate.rot, 0]}>
            <RoundedBox args={[1.85, 0.26, 1.85]} radius={0.04} smoothness={3}>
              <meshStandardMaterial
                color={plate.color}
                metalness={0.55}
                roughness={0.32}
              />
            </RoundedBox>
            {/* Barcode line markings on front face */}
            {[-0.6, -0.4, -0.15, 0.05, 0.28, 0.45, 0.62].map((x, i) => (
              <mesh key={i} position={[x, 0.135, 0.78]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[i % 2 === 0 ? 0.07 : 0.04, 0.52]} />
                <meshBasicMaterial color="#102b2a" />
              </mesh>
            ))}
          </group>
        ))}

        {/* Central Steel Fastener (Hex Bolt & Threaded Geometry) */}
        <group rotation={[0.18, 0.12, 0]}>
          {/* Hexagonal Bolt Head */}
          <mesh position={[0, 0.78, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.22, 6]} />
            <meshStandardMaterial color="#dcdbd5" metalness={0.85} roughness={0.18} />
          </mesh>
          {/* Bolt Washer / Collar */}
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.04, 24]} />
            <meshStandardMaterial color="#c69b4a" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Smooth Bolt Shank */}
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.7, 24]} />
            <meshStandardMaterial color="#dcdbd5" metalness={0.88} roughness={0.18} />
          </mesh>
          {/* Threaded Section (Concentric rings) */}
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.175, 0.175, 0.5, 24]} />
            <meshStandardMaterial color="#b8b9b4" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Thread Ridges */}
          {[-0.15, -0.25, -0.35, -0.45, -0.55].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <torusGeometry args={[0.185, 0.012, 8, 24]} />
              <meshStandardMaterial color="#9ea09b" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
          {/* Hex Nut */}
          <mesh position={[0, -0.68, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.2, 6]} />
            <meshStandardMaterial color="#b8b9b4" metalness={0.82} roughness={0.22} />
          </mesh>
        </group>

        {/* Brushed Brass Halo Ring representing Standardized Convergence */}
        <mesh scale={1.48} rotation={[Math.PI / 4, 0, THREE.MathUtils.degToRad(35)]}>
          <torusGeometry args={[1.15, 0.014, 12, 96]} />
          <meshStandardMaterial color="#c69b4a" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Inner Warm Brass Point Light */}
        <pointLight color="#c69b4a" intensity={28} distance={4.5} />
      </group>
    </Float>
  )
}

export function MaterialCore() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 38 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      aria-label="Interactive 3D representation of unified material identity core"
    >
      <ambientLight intensity={1.8} />
      <directionalLight position={[4, 5, 4]} intensity={3.2} color="#fff4d9" />
      <directionalLight position={[-4, -3, -2]} intensity={1.2} color="#a6c8ba" />
      <pointLight position={[-3, -2, 3]} color="#8ac0ba" intensity={12} distance={8} />

      <Core reducedMotion={reducedMotion} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={!reducedMotion}
        rotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.6}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  )
}
