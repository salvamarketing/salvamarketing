"use client"

import React, { Suspense, useEffect, useMemo, useRef, useState, createContext, useContext } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  OrbitControls,
  Environment,
  Html,
  Plane,
  Sphere,
} from "@react-three/drei"
import { Download, Heart, X } from "lucide-react"

/**
 * Single-file Stellar Card Gallery
 * - Context, Starfield, Galaxy, FloatingCard, Modal, and Page in one.
 */

/* =========================
   Card Context (inlined)
   ========================= */

type Card = {
  id: string
  imageUrl: string
  alt: string
  title: string
}

type CardContextType = {
  selectedCard: Card | null
  setSelectedCard: (card: Card | null) => void
  cards: Card[]
}

const CardContext = createContext<CardContextType | undefined>(undefined)

function useCard() {
  const ctx = useContext(CardContext)
  if (!ctx) throw new Error("useCard must be used within CardProvider")
  return ctx
}

function CardProvider({ children }: { children: React.ReactNode }) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  const cards: Card[] = [
    { id: "1", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop", alt: "Ecommerce Sales", title: "Ecommerce Sales +145%" },
    { id: "2", imageUrl: "https://images.unsplash.com/photo-1551288049-bbda48658a7d?q=80&w=2340&auto=format&fit=crop", alt: "Data Analytics", title: "Performance Data" },
    { id: "3", imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2338&auto=format&fit=crop", alt: "Luxury Brand", title: "Luxury Brand Scale" },
    { id: "4", imageUrl: "https://images.unsplash.com/photo-1553481199-456edb20677c?q=80&w=2340&auto=format&fit=crop", alt: "Marketing Funnel", title: "Funnel Optimization" },
    { id: "5", imageUrl: "https://images.unsplash.com/photo-1454165833767-131f728c002c?q=80&w=2340&auto=format&fit=crop", alt: "Business Strategy", title: "Growth Strategy" },
    { id: "6", imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2340&auto=format&fit=crop", alt: "Development", title: "Tech Architecture" },
    { id: "7", imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2342&auto=format&fit=crop", alt: "Corporate Success", title: "Corporate ROI 12x" },
    { id: "8", imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2340&auto=format&fit=crop", alt: "Team Workshop", title: "Methodology Execution" },
    { id: "9", imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=2340&auto=format&fit=crop", alt: "Fintech Growth", title: "Fintech Scale" },
    { id: "10", imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2340&auto=format&fit=crop", alt: "Real Estate Digital", title: "Real Estate Elite" },
    { id: "11", imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2342&auto=format&fit=crop", alt: "SaaS Launch", title: "SaaS Rocket" },
    { id: "12", imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2340&auto=format&fit=crop", alt: "Digital Ecosystem", title: "Digital Ecosystem" },
    { id: "13", imageUrl: "https://images.unsplash.com/photo-1542744094-24638eff58bb?q=80&w=2342&auto=format&fit=crop", alt: "Enterprise Sales", title: "Enterprise Success" },
    { id: "14", imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2344&auto=format&fit=crop", alt: "Conversion Rate", title: "CRO Mastery" },
    { id: "15", imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2348&auto=format&fit=crop", alt: "Investment", title: "R$ 50M Managed" },
    { id: "16", imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2340&auto=format&fit=crop", alt: "Executive Mentoring", title: "Board Advisory" },
    { id: "17", imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2340&auto=format&fit=crop", alt: "Office Space", title: "Operations Scale" },
    { id: "18", imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2340&auto=format&fit=crop", alt: "Startup Vision", title: "Startup MVP to Scale" },
    { id: "19", imageUrl: "https://images.unsplash.com/photo-1520607162513-94ad2c646197?q=80&w=2338&auto=format&fit=crop", alt: "Global Expansion", title: "Global Reach" },
    { id: "20", imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2340&auto=format&fit=crop", alt: "Tech Innovation", title: "Future Tech AI" },
  ]

  return (
    <CardContext.Provider value={{ selectedCard, setSelectedCard, cards }}>
      {children}
    </CardContext.Provider>
  )
}

/* =========================
   Starfield Background (inlined)
   ========================= */

function StarfieldBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 1)
    mountRef.current.appendChild(renderer.domElement)

    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 10000
    const positions = new Float32Array(starsCount * 3)
    for (let i = 0; i < starsCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, sizeAttenuation: true })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    camera.position.z = 10

    let animationId = 0
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      stars.rotation.y += 0.0001
      stars.rotation.x += 0.00005
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      starsGeometry.dispose()
      starsMaterial.dispose()
    }
  }, [])

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0 bg-black" />
}

/* =========================
   Floating Card (inlined)
   ========================= */

function FloatingCard({
  card,
  position,
}: {
  card: Card
  position: { x: number; y: number; z: number; rotationX: number; rotationY: number; rotationZ: number }
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const { setSelectedCard } = useCard()

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position)
    }
  })

  const handleClick = (e: any) => {
    e.stopPropagation()
    setSelectedCard(card)
  }
  const handlePointerOver = (e: any) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = "pointer"
  }
  const handlePointerOut = (e: any) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = "auto"
  }

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <Plane
        ref={meshRef}
        args={[4.5, 6]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>

      <Html
        transform
        distanceFactor={10}
        position={[0, 0, 0.01]}
        style={{
          transition: "all 0.3s ease",
          transform: hovered ? "scale(1.15)" : "scale(1)",
          pointerEvents: "none",
        }}
      >
        <div
          className="w-40 h-52 rounded-lg overflow-hidden shadow-2xl bg-[#0A0A0A] p-3 select-none border border-white/5"
          style={{
            boxShadow: hovered
              ? "0 25px 50px rgba(249, 115, 22, 0.5), 0 0 30px rgba(249, 115, 22, 0.3)"
              : "0 15px 30px rgba(0, 0, 0, 0.6)",
            border: hovered ? "2px solid rgba(249, 115, 22, 0.5)" : "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <img
            src={card.imageUrl || "/placeholder.svg"}
            alt={card.alt}
            className="w-full h-40 object-cover rounded-md grayscale hover:grayscale-0 transition-all duration-500"
            loading="lazy"
            draggable={false}
          />
          <div className="mt-2 text-center">
            <p className="text-[#E1E0CC]/80 text-[10px] font-bold uppercase tracking-widest truncate">{card.title}</p>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* =========================
   Card Modal (inlined)
   ========================= */

function CardModal() {
  const { selectedCard, setSelectedCard } = useCard()
  const [isFavorited, setIsFavorited] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  if (!selectedCard) return null

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseEnter = () => {}
  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.5s ease-out"
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
    }
  }

  const toggleFavorite = () => setIsFavorited((v) => !v)
  const handleClose = () => setSelectedCard(null)
  const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-6" onClick={handleBackdropClick}>
      <div className="relative max-w-lg w-full">
        <button onClick={handleClose} className="absolute -top-16 right-0 text-white hover:text-primary transition-colors z-10 p-2">
          <X className="w-10 h-10" />
        </button>

        <div style={{ perspective: "1000px" }} className="w-full">
          <div
            ref={cardRef}
            className="relative cursor-pointer rounded-3xl bg-[#0A0A0A] p-6 border border-white/10 transition-all duration-500 ease-out w-full"
            style={{
              transformStyle: "preserve-3d",
              boxShadow: "0 50px 100px rgba(0,0,0,0.8)",
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative w-full mb-6" style={{ aspectRatio: "4 / 5" }}>
              <img
                loading="lazy"
                className="absolute inset-0 h-full w-full rounded-2xl bg-black object-cover"
                alt={selectedCard.alt}
                src={selectedCard.imageUrl || "/placeholder.svg"}
                style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-2xl" />
            </div>

            <h3 className="text-[#E1E0CC] text-2xl font-black mb-6 tracking-tighter uppercase">{selectedCard.title}</h3>

            <div className="flex gap-4">
              <button
                type="button"
                className="inline-flex h-12 flex-1 items-center justify-center rounded-xl text-xs font-black uppercase tracking-widest text-white outline-none transition duration-300 ease-out hover:opacity-80 active:scale-[0.97] bg-orange-600"
              >
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" strokeWidth={2.5} />
                  <span>Ver Detalhes</span>
                </div>
              </button>
              <button
                type="button"
                onClick={toggleFavorite}
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 text-orange-500 outline-none transition duration-300 ease-out hover:bg-white/5 active:scale-[0.97]"
              >
                <Heart className="h-5 w-5" strokeWidth={2.5} fill={isFavorited ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================
   Card Galaxy (inlined)
   ========================= */

function CardGalaxy() {
  const { cards } = useCard()

  const cardPositions = useMemo(() => {
    const positions: {
      x: number
      y: number
      z: number
      rotationX: number
      rotationY: number
      rotationZ: number
    }[] = []
    const numCards = cards.length
    const goldenRatio = (1 + Math.sqrt(5)) / 2

    for (let i = 0; i < numCards; i++) {
      const y = 1 - (i / (numCards - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = (2 * Math.PI * i) / goldenRatio
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      const layerRadius = 14 + (i % 3) * 5

      positions.push({
        x: x * layerRadius,
        y: y * layerRadius,
        z: z * layerRadius,
        rotationX: Math.atan2(z, Math.sqrt(x * x + y * y)),
        rotationY: Math.atan2(x, z),
        rotationZ: (Math.random() - 0.5) * 0.2,
      })
    }
    return positions
  }, [cards.length])

  return (
    <>
      <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#f97316" transparent opacity={0.1} wireframe />
      </Sphere>
      <Sphere args={[14, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#f97316" transparent opacity={0.03} wireframe />
      </Sphere>
      <Sphere args={[20, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#f97316" transparent opacity={0.01} wireframe />
      </Sphere>

      {cards.map((card, i) => (
        <FloatingCard key={card.id} card={card} position={cardPositions[i]} />
      ))}
    </>
  )
}

/* =========================
   Page/Component Export
   ========================= */

export default function StellarCardGallerySingle() {
  return (
    <CardProvider>
      <div className="w-full h-screen relative overflow-hidden bg-black">
        <StarfieldBackground />

        <Canvas
          camera={{ position: [0, 0, 20], fov: 60 }}
          className="absolute inset-0 z-10"
          onCreated={({ gl }) => {
            gl.domElement.style.pointerEvents = "auto"
          }}
        >
          <Suspense fallback={null}>
            <Environment preset="night" />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.6} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />
            <CardGalaxy />
            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              minDistance={8}
              maxDistance={50}
              autoRotate={true}
              autoRotateSpeed={0.3}
              rotateSpeed={0.5}
              zoomSpeed={1.2}
              panSpeed={0.8}
              target={[0, 0, 0]}
            />
          </Suspense>
        </Canvas>

        <CardModal />

        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none w-full px-6">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase text-[#E1E0CC]">Galeria de <span className="text-orange-500 italic">Resultados</span></h1>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/40 font-bold">Arraste para explorar • Scroll para zoom • Clique nos cards</p>
        </div>
      </div>
    </CardProvider>
  )
}
