'use client'

import { useRef, useMemo, Suspense, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
    Float, 
    MeshDistortMaterial, 
    Environment,
    Stars,
    Sparkles as DreiSparkles,
    OrbitControls,
    Center,
    Edges,
    Outlines,
    Preload,
    PerformanceMonitor,
    AdaptiveDpr
} from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

// ============================================
// PERFORMANCE UTILITIES
// ============================================

// Seeded random for deterministic positions (no Math.random in render)
function seededRandom(seed) {
    let s = seed
    return () => {
        s = (s * 16807) % 2147483647
        return (s - 1) / 2147483646
    }
}

// Generate stable positions for particles
function generatePositions(count, spread, seed = 12345) {
    const positions = new Float32Array(count * 3)
    const random = seededRandom(seed)
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (random() - 0.5) * spread
        positions[i * 3 + 1] = (random() - 0.5) * spread
        positions[i * 3 + 2] = (random() - 0.5) * spread
    }
    return positions
}

// ============================================
// 1. SCROLL-TRIGGERED 3D ANIMATIONS
// ============================================

// Parallax floating object that moves with scroll
function ParallaxObject({ position, scrollOffset = 0, children }) {
    const meshRef = useRef()
    
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime
            meshRef.current.position.y = position[1] + Math.sin(time + scrollOffset) * 0.3
            meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1
            meshRef.current.rotation.z = Math.cos(time * 0.3) * 0.1
        }
    })
    
    return (
        <group ref={meshRef} position={position}>
            {children}
        </group>
    )
}

// ============================================
// 2. INTERACTIVE 360° PRODUCT VIEWER
// ============================================

// High-quality 3D Gas Cylinder with PBR materials
function GasCylinder3D({ scale = 1 }) {
    const meshRef = useRef()
    const [hovered, setHovered] = useState(false)
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
        }
    })
    
    return (
        <group ref={meshRef} scale={scale}>
            {/* Main cylinder body */}
            <mesh 
                position={[0, 0, 0]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
                <meshStandardMaterial 
                    color={hovered ? "#00d4ff" : "#0891b2"}
                    metalness={0.9}
                    roughness={0.1}
                    envMapIntensity={1.5}
                />
                {hovered && <Outlines thickness={0.02} color="#00ffff" />}
            </mesh>
            
            {/* Top dome */}
            <mesh position={[0, 1.1, 0]}>
                <sphereGeometry args={[0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial 
                    color="#0891b2"
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>
            
            {/* Valve */}
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} />
                <meshStandardMaterial 
                    color="#374151"
                    metalness={0.95}
                    roughness={0.05}
                />
            </mesh>
            
            {/* Handle */}
            <mesh position={[0, 1.7, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.2, 0.03, 8, 16, Math.PI]} />
                <meshStandardMaterial 
                    color="#374151"
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>
            
            {/* Brand ring with glow */}
            <mesh position={[0, 0.3, 0]}>
                <torusGeometry args={[0.52, 0.03, 8, 32]} />
                <meshStandardMaterial 
                    color="#06b6d4"
                    emissive="#06b6d4"
                    emissiveIntensity={hovered ? 1 : 0.3}
                />
            </mesh>
        </group>
    )
}

// ============================================
// 3. GPU-ACCELERATED INSTANCED PARTICLES
// ============================================
function InstancedParticles({ count = 500 }) {
    const meshRef = useRef()
    const positions = useMemo(() => generatePositions(count, 20, 42069), [count])
    const dummy = useMemo(() => new THREE.Object3D(), [])
    
    useEffect(() => {
        if (meshRef.current) {
            const random = seededRandom(12345)
            for (let i = 0; i < count; i++) {
                dummy.position.set(
                    positions[i * 3],
                    positions[i * 3 + 1],
                    positions[i * 3 + 2]
                )
                dummy.scale.setScalar(random() * 0.02 + 0.01)
                dummy.updateMatrix()
                meshRef.current.setMatrixAt(i, dummy.matrix)
            }
            meshRef.current.instanceMatrix.needsUpdate = true
        }
    }, [count, positions, dummy])
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.02
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.01
        }
    })
    
    return (
        <instancedMesh ref={meshRef} args={[null, null, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.6} />
        </instancedMesh>
    )
}

// Magical floating sparkles
function MagicalSparkles({ count = 100 }) {
    return (
        <DreiSparkles
            count={count}
            scale={[15, 15, 15]}
            size={3}
            speed={0.4}
            color="#06b6d4"
            opacity={0.8}
        />
    )
}

// ============================================
// 4. ENVIRONMENT MAPS + CINEMATIC LIGHTING
// ============================================
function StudioEnvironment() {
    return <Environment preset="studio" background={false} />
}

function CinematicLights() {
    return (
        <>
            <ambientLight intensity={0.3} />
            <directionalLight 
                position={[10, 10, 5]} 
                intensity={1} 
                color="#ffffff"
            />
            <pointLight position={[-10, -10, -5]} intensity={0.5} color="#06b6d4" />
            <pointLight position={[10, -5, 10]} intensity={0.3} color="#a855f7" />
        </>
    )
}

// ============================================
// 5. HOVER GLOW / OUTLINE EFFECTS
// ============================================
function GlowSphere({ position, color = "#06b6d4", size = 1 }) {
    const meshRef = useRef()
    const [hovered, setHovered] = useState(false)
    
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime
            meshRef.current.scale.setScalar(size + (hovered ? 0.1 : 0) + Math.sin(time * 2) * 0.05)
        }
    })
    
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh 
                ref={meshRef}
                position={position}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[1, 32, 32]} />
                <MeshDistortMaterial
                    color={color}
                    distort={hovered ? 0.4 : 0.2}
                    speed={2}
                    metalness={0.8}
                    roughness={0.2}
                />
                {hovered && <Outlines thickness={0.03} color="#ffffff" />}
            </mesh>
        </Float>
    )
}

function GlowRing({ position, color = "#a855f7" }) {
    const meshRef = useRef()
    const [hovered, setHovered] = useState(false)
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.5
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
        }
    })
    
    return (
        <mesh 
            ref={meshRef} 
            position={position}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <torusGeometry args={[1, 0.1, 16, 32]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={hovered ? 2 : 0.5}
                metalness={0.9}
                roughness={0.1}
            />
            {hovered && <Edges color="#ffffff" threshold={15} />}
        </mesh>
    )
}

// ============================================
// 6. INSTANCED FLOATING CUBES
// ============================================
function FloatingCubes({ count = 50 }) {
    const meshRef = useRef()
    const positions = useMemo(() => generatePositions(count, 15, 98765), [count])
    const dummy = useMemo(() => new THREE.Object3D(), [])
    
    useEffect(() => {
        if (meshRef.current) {
            const random = seededRandom(54321)
            for (let i = 0; i < count; i++) {
                dummy.position.set(
                    positions[i * 3],
                    positions[i * 3 + 1],
                    positions[i * 3 + 2]
                )
                dummy.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI)
                dummy.scale.setScalar(random() * 0.3 + 0.1)
                dummy.updateMatrix()
                meshRef.current.setMatrixAt(i, dummy.matrix)
            }
            meshRef.current.instanceMatrix.needsUpdate = true
        }
    }, [count, positions, dummy])
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.05
        }
    })
    
    return (
        <instancedMesh ref={meshRef} args={[null, null, count]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
                color="#06b6d4" 
                metalness={0.8} 
                roughness={0.2}
                transparent
                opacity={0.7}
            />
        </instancedMesh>
    )
}

// ============================================
// 7. POST-PROCESSING EFFECTS
// ============================================
function PostProcessingEffects({ bloomIntensity = 0.5, enableVignette = true, enableAberration = false }) {
    return (
        <EffectComposer>
            <Bloom 
                intensity={bloomIntensity}
                luminanceThreshold={0.6}
                luminanceSmoothing={0.9}
                mipmapBlur
            />
            {enableVignette && (
                <Vignette 
                    offset={0.3}
                    darkness={0.5}
                    blendFunction={BlendFunction.NORMAL}
                />
            )}
            {enableAberration && (
                <ChromaticAberration
                    offset={[0.002, 0.002]}
                    blendFunction={BlendFunction.NORMAL}
                />
            )}
        </EffectComposer>
    )
}

// ============================================
// 8. TOON / CEL-SHADED OBJECTS
// ============================================
function ToonSphere({ position, color = "#06b6d4" }) {
    const meshRef = useRef()
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.3
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
        }
    })
    
    return (
        <Float speed={1.5} rotationIntensity={0.3}>
            <mesh ref={meshRef} position={position}>
                <icosahedronGeometry args={[0.7, 1]} />
                <meshToonMaterial color={color} />
                <Edges color="#000000" threshold={15} />
            </mesh>
        </Float>
    )
}

// ============================================
// 9. MOUSE-FOLLOWING LIGHT
// ============================================
function MouseLight() {
    const lightRef = useRef()
    const { viewport, pointer } = useThree()
    
    useFrame(() => {
        if (lightRef.current) {
            lightRef.current.position.x = (pointer.x * viewport.width) / 2
            lightRef.current.position.y = (pointer.y * viewport.height) / 2
        }
    })
    
    return (
        <pointLight 
            ref={lightRef} 
            position={[0, 0, 3]} 
            intensity={0.8} 
            color="#06b6d4"
            distance={8}
        />
    )
}

// ============================================
// EXPORTED SCENE COMPOSITIONS
// ============================================

// HERO 3D SCENE - Full featured with post-processing
export function Hero3DScene() {
    const [dpr, setDpr] = useState(1.5)
    
    return (
        <Canvas
            dpr={dpr}
            camera={{ position: [0, 0, 8], fov: 60 }}
            gl={{ 
                antialias: true,
                powerPreference: "high-performance",
                alpha: true
            }}
            style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%',
                pointerEvents: 'none'
            }}
        >
            <Suspense fallback={null}>
                <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)}>
                    <AdaptiveDpr pixelated />
                    
                    {/* Environment & Lighting */}
                    <StudioEnvironment />
                    <CinematicLights />
                    <MouseLight />
                    
                    {/* Floating glow spheres with hover effects */}
                    <GlowSphere position={[-4, 2, -2]} color="#06b6d4" size={0.6} />
                    <GlowSphere position={[4, -1, -3]} color="#a855f7" size={0.5} />
                    <GlowSphere position={[-2, -2, -4]} color="#ec4899" size={0.4} />
                    
                    {/* Animated rings */}
                    <GlowRing position={[3, 2, -4]} color="#06b6d4" />
                    <GlowRing position={[-3, -1, -5]} color="#a855f7" />
                    
                    {/* Toon-shaded accents */}
                    <ToonSphere position={[5, 0, -3]} color="#10b981" />
                    <ToonSphere position={[-5, 1, -4]} color="#f59e0b" />
                    
                    {/* GPU-efficient instanced particles */}
                    <InstancedParticles count={300} />
                    <MagicalSparkles count={80} />
                    
                    {/* Floating decorative cubes */}
                    <FloatingCubes count={30} />
                    
                    {/* Background stars */}
                    <Stars 
                        radius={50} 
                        depth={50} 
                        count={1000} 
                        factor={4} 
                        fade 
                        speed={0.5}
                    />
                    
                    {/* Cinematic post-processing */}
                    <PostProcessingEffects 
                        bloomIntensity={0.4} 
                        enableVignette={true}
                        enableAberration={false}
                    />
                    
                    <Preload all />
                </PerformanceMonitor>
            </Suspense>
        </Canvas>
    )
}

// PRODUCT SECTION 3D SCENE - Lighter weight
export function Product3DScene() {
    return (
        <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 10], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%',
                pointerEvents: 'none'
            }}
        >
            <Suspense fallback={null}>
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={0.6} color="#06b6d4" />
                
                {/* Parallax floating elements */}
                <ParallaxObject position={[-6, 3, -5]} scrollOffset={0}>
                    <mesh>
                        <sphereGeometry args={[0.3, 16, 16]} />
                        <meshStandardMaterial color="#10b981" metalness={0.8} roughness={0.2} />
                    </mesh>
                </ParallaxObject>
                
                <ParallaxObject position={[6, -2, -4]} scrollOffset={2}>
                    <mesh>
                        <octahedronGeometry args={[0.4]} />
                        <meshStandardMaterial color="#06b6d4" metalness={0.9} roughness={0.1} />
                    </mesh>
                </ParallaxObject>
                
                <ParallaxObject position={[-5, -3, -6]} scrollOffset={4}>
                    <mesh>
                        <torusGeometry args={[0.3, 0.1, 8, 16]} />
                        <meshStandardMaterial color="#a855f7" metalness={0.8} roughness={0.2} />
                    </mesh>
                </ParallaxObject>
                
                <MagicalSparkles count={40} />
                
                <EffectComposer>
                    <Bloom intensity={0.2} luminanceThreshold={0.8} mipmapBlur />
                </EffectComposer>
            </Suspense>
        </Canvas>
    )
}

// TESTIMONIALS - Minimal 3D Background (on-demand rendering)
export function Minimal3DBackground() {
    return (
        <Canvas
            dpr={1}
            camera={{ position: [0, 0, 5], fov: 60 }}
            gl={{ antialias: false, alpha: true }}
            style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%',
                pointerEvents: 'none'
            }}
            frameloop="demand"
        >
            <Suspense fallback={null}>
                <Stars 
                    radius={30} 
                    depth={30} 
                    count={500} 
                    factor={3} 
                    fade 
                    speed={0.3}
                />
            </Suspense>
        </Canvas>
    )
}

// 360° PRODUCT VIEWER - Interactive with OrbitControls
export function ProductViewer3D({ autoRotate = true }) {
    return (
        <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, 5], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            style={{ 
                width: '100%', 
                height: '100%',
                background: 'transparent'
            }}
        >
            <Suspense fallback={null}>
                <StudioEnvironment />
                <CinematicLights />
                
                <OrbitControls 
                    enableZoom={true} 
                    autoRotate={autoRotate}
                    autoRotateSpeed={2}
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                />
                
                <Center>
                    <GasCylinder3D />
                </Center>
                
                <EffectComposer>
                    <Bloom intensity={0.3} luminanceThreshold={0.7} mipmapBlur />
                </EffectComposer>
            </Suspense>
        </Canvas>
    )
}

// FLOATING 3D BADGE - For CTAs / testimonials
export function Floating3DBadge() {
    return (
        <Canvas
            dpr={1}
            camera={{ position: [0, 0, 3], fov: 60 }}
            gl={{ antialias: true, alpha: true }}
            style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%',
                pointerEvents: 'none'
            }}
        >
            <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} intensity={0.5} color="#06b6d4" />
                
                <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
                    <mesh>
                        <torusGeometry args={[1, 0.05, 8, 32]} />
                        <meshStandardMaterial 
                            color="#06b6d4"
                            emissive="#06b6d4"
                            emissiveIntensity={0.5}
                            metalness={0.9}
                            roughness={0.1}
                        />
                    </mesh>
                </Float>
                
                <MagicalSparkles count={20} />
            </Suspense>
        </Canvas>
    )
}

const Scene3DExports = { 
    Hero3DScene, 
    Product3DScene, 
    Minimal3DBackground, 
    ProductViewer3D,
    Floating3DBadge 
}

export default Scene3DExports
