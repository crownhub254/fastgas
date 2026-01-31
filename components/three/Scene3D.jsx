'use client'

import { useRef, useMemo, Suspense, useState, useEffect, memo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
    Float, 
    MeshDistortMaterial, 
    Stars,
    Sparkles as DreiSparkles,
    OrbitControls,
    Center,
    Preload,
    PerformanceMonitor,
    AdaptiveDpr,
    BakeShadows
} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// ============================================
// PERFORMANCE & MOBILE DETECTION
// ============================================

// Hook to detect mobile/low-power devices
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false)
    const [isLowPower, setIsLowPower] = useState(false)
    
    useEffect(() => {
        const checkDevice = () => {
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            const smallScreen = window.innerWidth < 768
            const lowMemory = navigator.deviceMemory ? navigator.deviceMemory < 4 : false
            
            setIsMobile(mobile || smallScreen)
            setIsLowPower(mobile || smallScreen || lowMemory)
        }
        
        checkDevice()
        window.addEventListener('resize', checkDevice)
        return () => window.removeEventListener('resize', checkDevice)
    }, [])
    
    return { isMobile, isLowPower }
}

// Hook to check if element is in viewport (Intersection Observer)
function useInViewport(ref, options = {}) {
    const [isInView, setIsInView] = useState(false)
    
    useEffect(() => {
        if (!ref.current) return
        
        const observer = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold: 0.1, ...options }
        )
        
        observer.observe(ref.current)
        return () => observer.disconnect()
    }, [ref, options])
    
    return isInView
}

// Seeded random for deterministic positions
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
// OPTIMIZED 3D COMPONENTS (Memoized)
// ============================================

// Simple floating sphere - minimal overhead
const SimpleFloatingSphere = memo(function SimpleFloatingSphere({ position, color = "#06b6d4", size = 0.5 }) {
    const meshRef = useRef()
    
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime
            meshRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.2
            meshRef.current.rotation.x = time * 0.1
        }
    })
    
    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[size, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.7} />
        </mesh>
    )
})

// Optimized glow sphere with reduced complexity
const OptimizedGlowSphere = memo(function OptimizedGlowSphere({ position, color = "#06b6d4", size = 0.5 }) {
    const meshRef = useRef()
    
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime
            meshRef.current.position.y = position[1] + Math.sin(time * 0.5 + position[0]) * 0.15
        }
    })
    
    return (
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
            <mesh ref={meshRef} position={position}>
                <sphereGeometry args={[size, 24, 24]} />
                <MeshDistortMaterial
                    color={color}
                    distort={0.15}
                    speed={1}
                    metalness={0.6}
                    roughness={0.3}
                />
            </mesh>
        </Float>
    )
})

// Optimized ring with reduced segments
const OptimizedRing = memo(function OptimizedRing({ position, color = "#a855f7" }) {
    const meshRef = useRef()
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.3
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
        }
    })
    
    return (
        <mesh ref={meshRef} position={position}>
            <torusGeometry args={[0.8, 0.08, 12, 24]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
    )
})

// GPU-efficient instanced particles with reduced count
const LightweightParticles = memo(function LightweightParticles({ count = 100 }) {
    const meshRef = useRef()
    const positions = useMemo(() => generatePositions(count, 15, 42069), [count])
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
                dummy.scale.setScalar(random() * 0.015 + 0.005)
                dummy.updateMatrix()
                meshRef.current.setMatrixAt(i, dummy.matrix)
            }
            meshRef.current.instanceMatrix.needsUpdate = true
        }
    }, [count, positions, dummy])
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.01
        }
    })
    
    return (
        <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled>
            <sphereGeometry args={[1, 6, 6]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} />
        </instancedMesh>
    )
})

// Minimal sparkles
const MinimalSparkles = memo(function MinimalSparkles({ count = 30 }) {
    return (
        <DreiSparkles
            count={count}
            scale={[12, 12, 12]}
            size={2}
            speed={0.2}
            color="#06b6d4"
            opacity={0.6}
        />
    )
})

// Simple ambient lighting (no expensive calculations)
const SimpleLighting = memo(function SimpleLighting() {
    return (
        <>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.6} />
        </>
    )
})

// ============================================
// SCENE COMPOSITIONS - PERFORMANCE OPTIMIZED
// ============================================

// HERO 3D SCENE - Desktop version (full features)
function HeroSceneDesktop() {
    const [dpr, setDpr] = useState(1.5)
    
    return (
        <Canvas
            dpr={dpr}
            camera={{ position: [0, 0, 8], fov: 60 }}
            gl={{ 
                antialias: false, // Disable for performance
                powerPreference: "high-performance",
                alpha: true,
                stencil: false,
                depth: true
            }}
            frameloop="demand" // Only render when needed
            style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%',
                pointerEvents: 'none'
            }}
            performance={{ min: 0.5 }}
        >
            <Suspense fallback={null}>
                <PerformanceMonitor 
                    onDecline={() => setDpr(1)} 
                    onIncline={() => setDpr(1.5)}
                    flipflops={3}
                    onFallback={() => setDpr(0.75)}
                >
                    <AdaptiveDpr pixelated />
                    <SimpleLighting />
                    
                    {/* Reduced floating elements */}
                    <OptimizedGlowSphere position={[-3, 1.5, -2]} color="#06b6d4" size={0.5} />
                    <OptimizedGlowSphere position={[3, -0.5, -3]} color="#a855f7" size={0.4} />
                    
                    <OptimizedRing position={[2.5, 1.5, -4]} color="#06b6d4" />
                    
                    {/* Reduced particle count */}
                    <MinimalSparkles count={35} />
                    
                    {/* Enhanced night sky stars - more visible */}
                    <Stars 
                        radius={50} 
                        depth={50} 
                        count={1500} 
                        factor={4} 
                        fade 
                        speed={0.5}
                    />
                    
                    {/* Second layer of stars for depth */}
                    <Stars 
                        radius={100} 
                        depth={80} 
                        count={800} 
                        factor={6} 
                        fade 
                        speed={0.2}
                    />
                    
                    {/* Lighter bloom only */}
                    <EffectComposer multisampling={0}>
                        <Bloom 
                            intensity={0.25} 
                            luminanceThreshold={0.7}
                            luminanceSmoothing={0.9}
                            mipmapBlur
                        />
                    </EffectComposer>
                    
                    <BakeShadows />
                    <Preload all />
                </PerformanceMonitor>
            </Suspense>
        </Canvas>
    )
}

// HERO 3D SCENE - Mobile version (minimal features)
function HeroSceneMobile() {
    return (
        <Canvas
            dpr={1}
            camera={{ position: [0, 0, 8], fov: 60 }}
            gl={{ 
                antialias: false,
                powerPreference: "low-power",
                alpha: true,
                stencil: false
            }}
            frameloop="demand"
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
                
                {/* Very minimal elements for mobile */}
                <SimpleFloatingSphere position={[-2, 1, -2]} color="#06b6d4" size={0.4} />
                <SimpleFloatingSphere position={[2, -0.5, -3]} color="#a855f7" size={0.3} />
                
                {/* Enhanced stars for mobile - space vibes */}
                <Stars 
                    radius={40} 
                    depth={40} 
                    count={500} 
                    factor={3} 
                    fade 
                    speed={0.2}
                />
            </Suspense>
        </Canvas>
    )
}

// Main Hero3DScene with automatic mobile detection
export function Hero3DScene() {
    const containerRef = useRef()
    const { isMobile, isLowPower } = useIsMobile()
    const isInView = useInViewport(containerRef)
    const [shouldRender, setShouldRender] = useState(false)
    
    // Delay rendering until in viewport
    useEffect(() => {
        if (isInView) {
            const timer = setTimeout(() => setShouldRender(true), 100)
            return () => clearTimeout(timer)
        }
    }, [isInView])
    
    return (
        <div ref={containerRef} className="absolute inset-0">
            {shouldRender && (
                isLowPower ? <HeroSceneMobile /> : <HeroSceneDesktop />
            )}
        </div>
    )
}

// PRODUCT SECTION 3D SCENE - Lightweight
export function Product3DScene() {
    const containerRef = useRef()
    const { isLowPower } = useIsMobile()
    const isInView = useInViewport(containerRef)
    
    // Don't render 3D on mobile for product section
    if (isLowPower) {
        return <div ref={containerRef} className="absolute inset-0" />
    }
    
    return (
        <div ref={containerRef} className="absolute inset-0">
            {isInView && (
                <Canvas
                    dpr={1}
                    camera={{ position: [0, 0, 10], fov: 50 }}
                    gl={{ antialias: false, alpha: true, stencil: false }}
                    frameloop="demand"
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
                        
                        <SimpleFloatingSphere position={[-5, 2, -5]} color="#10b981" size={0.25} />
                        <SimpleFloatingSphere position={[5, -1, -4]} color="#06b6d4" size={0.3} />
                        
                        <MinimalSparkles count={15} />
                    </Suspense>
                </Canvas>
            )}
        </div>
    )
}

// TESTIMONIALS - Ultra minimal (CSS stars fallback on mobile)
export function Minimal3DBackground() {
    const containerRef = useRef()
    const { isLowPower } = useIsMobile()
    const isInView = useInViewport(containerRef)
    
    // CSS fallback for mobile
    if (isLowPower) {
        return (
            <div ref={containerRef} className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base-100/50 to-transparent" />
            </div>
        )
    }
    
    return (
        <div ref={containerRef} className="absolute inset-0">
            {isInView && (
                <Canvas
                    dpr={1}
                    camera={{ position: [0, 0, 5], fov: 60 }}
                    gl={{ antialias: false, alpha: true, stencil: false }}
                    frameloop="demand"
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
                        <Stars 
                            radius={25} 
                            depth={25} 
                            count={150} 
                            factor={2} 
                            fade 
                            speed={0.2}
                        />
                    </Suspense>
                </Canvas>
            )}
        </div>
    )
}

// 360° PRODUCT VIEWER - Interactive (desktop only)
export function ProductViewer3D({ autoRotate = true }) {
    const { isLowPower } = useIsMobile()
    
    // Disable on mobile
    if (isLowPower) {
        return null
    }
    
    return (
        <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 5], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            style={{ 
                width: '100%', 
                height: '100%',
                background: 'transparent'
            }}
        >
            <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                
                <OrbitControls 
                    enableZoom={true} 
                    autoRotate={autoRotate}
                    autoRotateSpeed={1.5}
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                />
                
                <Center>
                    <GasCylinder3DOptimized />
                </Center>
            </Suspense>
        </Canvas>
    )
}

// Optimized Gas Cylinder for product viewer
const GasCylinder3DOptimized = memo(function GasCylinder3DOptimized() {
    return (
        <group>
            {/* Main cylinder body */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 2, 24]} />
                <meshStandardMaterial 
                    color="#0891b2"
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>
            
            {/* Top dome */}
            <mesh position={[0, 1.1, 0]}>
                <sphereGeometry args={[0.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#0891b2" metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Valve */}
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.35, 12]} />
                <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
            </mesh>
            
            {/* Brand ring */}
            <mesh position={[0, 0.3, 0]}>
                <torusGeometry args={[0.52, 0.025, 8, 24]} />
                <meshBasicMaterial color="#06b6d4" />
            </mesh>
        </group>
    )
})

// FLOATING 3D BADGE - Minimal
export function Floating3DBadge() {
    const { isLowPower } = useIsMobile()
    
    if (isLowPower) return null
    
    return (
        <Canvas
            dpr={1}
            camera={{ position: [0, 0, 3], fov: 60 }}
            gl={{ antialias: false, alpha: true }}
            frameloop="demand"
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
                
                <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
                    <mesh>
                        <torusGeometry args={[0.8, 0.04, 8, 24]} />
                        <meshBasicMaterial color="#06b6d4" transparent opacity={0.7} />
                    </mesh>
                </Float>
                
                <MinimalSparkles count={10} />
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
