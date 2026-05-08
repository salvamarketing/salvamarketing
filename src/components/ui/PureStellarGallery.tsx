"use client"

import React, { useEffect, useRef, useState } from "react"
import { Download, Heart, X } from "lucide-react"
import BlurText from "./BlurText"

type CardData = {
  img: string
  title: string
}

const GALLERY_DATA: CardData[] = [
  { img: "https://i.ibb.co/4ZWcP129/1.png", title: "Elegant Invitation" },
  { img: "https://i.ibb.co/TMbhBRcL/2.png", title: "Modern Design" },
  { img: "https://i.ibb.co/spXBFdSm/3.png", title: "Vintage Style" },
  { img: "https://i.ibb.co/N2TCN0bC/4.png", title: "Minimalist" },
  { img: "https://i.ibb.co/jZkh6q1M/5.png", title: "Floral Design" },
  { img: "https://i.ibb.co/6cc7mksr/6.png", title: "Geometric" },
  { img: "https://i.ibb.co/bjV35jNQ/7.png", title: "Luxury Gold" },
  { img: "https://i.ibb.co/PZ7WLs7g/8.png", title: "Rustic Style" },
  { img: "https://i.ibb.co/qLR5bQRM/9.png", title: "Dark Modern" },
  { img: "https://i.ibb.co/PdNhw3K/10.png", title: "Colorful Party" },
  { img: "https://i.ibb.co/zWpN1nqJ/11.png", title: "Geometric II" },
  { img: "https://i.ibb.co/fVYnCXgR/12.png", title: "Luxury Gold II" },
  { img: "https://i.ibb.co/1G6jZWcZ/13.png", title: "Rustic Style II" },
  { img: "https://i.ibb.co/xKG7m905/14.png", title: "Dark Modern II" },
  { img: "https://i.ibb.co/7dJzR3xK/15.png", title: "Colorful Party II" },
  { img: "https://i.ibb.co/NdJ1csXB/16.png", title: "Elegant Script" },
  { img: "https://i.ibb.co/8L2Sdt5Q/17.png", title: "Watercolor Art" },
  { img: "https://i.ibb.co/mC1zxJYq/18.png", title: "Botanical" },
  { img: "https://i.ibb.co/wryzsKs4/20.png", title: "Art Deco" },
  { img: "https://i.ibb.co/1fvnxL3L/19.png", title: "Marble Luxury" },
]

export default function NeuralStellarGallery() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  
  // 3D rotation state
  const rotationX = useRef(0)
  const rotationY = useRef(0)
  const zoom = useRef(1.2)
  const isDragging = useRef(false)
  const lastMousePos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // WebGL logic removed for solid black background
  }, [])

  // 3D Cards logic
  const cardsRef = useRef<HTMLDivElement[]>([])
  useEffect(() => {
    const N = GALLERY_DATA.length
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    
    // Initial position calculations
    const positions = GALLERY_DATA.map((_, i) => {
      const y = 1 - (i / (N - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = 2 * Math.PI * i / goldenRatio
      const layerRadius = 1 + (i % 3) * 0.3
      return {
        x: Math.cos(theta) * radiusAtY * layerRadius,
        y: y * layerRadius,
        z: Math.sin(theta) * radiusAtY * layerRadius
      }
    })

    let animationId: number
    const update = () => {
      rotationY.current += 0.002
      
      cardsRef.current.forEach((el, i) => {
        if (!el) return
        const pos = positions[i]
        
        // Rotate Y
        let x1 = pos.x * Math.cos(rotationY.current) - pos.z * Math.sin(rotationY.current)
        let z1 = pos.x * Math.sin(rotationY.current) + pos.z * Math.cos(rotationY.current)
        
        // Rotate X
        let y2 = pos.y * Math.cos(rotationX.current) - z1 * Math.sin(rotationX.current)
        let z2 = pos.y * Math.cos(rotationX.current) + z1 * Math.cos(rotationX.current)
        
        const scale = (z2 + 2) * 200 * zoom.current
        const opacity = Math.max(0.1, (z2 + 1.5) / 3)
        
        el.style.transform = `translate3d(${x1 * 300 * zoom.current}px, ${y2 * 300 * zoom.current}px, ${z2 * 100}px) scale(${scale / 400})`
        el.style.opacity = opacity.toString()
        el.style.zIndex = Math.round(z2 * 1000).toString()
      })
      
      animationId = requestAnimationFrame(update)
    }

    update()
    return () => cancelAnimationFrame(animationId)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastMousePos.current.x
    const dy = e.clientY - lastMousePos.current.y
    rotationY.current += dx * 0.01
    rotationX.current -= dy * 0.01
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleWheel = (e: React.WheelEvent) => {
    zoom.current -= e.deltaY * 0.001
    zoom.current = Math.min(Math.max(zoom.current, 0.4), 2.2)
  }

  // Mobile Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true
    lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return
    const dx = e.touches[0].clientX - lastMousePos.current.x
    const dy = e.touches[0].clientY - lastMousePos.current.y
    rotationY.current += dx * 0.01
    rotationX.current -= dy * 0.01
    lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const modalRef = useRef<HTMLDivElement>(null)
  const handleModalMouseMove = (e: React.MouseEvent) => {
    if (!modalRef.current) return
    const rect = modalRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const xc = rect.width / 2
    const yc = rect.height / 2
    const dx = (x - xc) / xc
    const dy = (y - yc) / yc
    modalRef.current.style.transform = `rotateX(${dy * -10}deg) rotateY(${dx * 10}deg)`
  }

  return (
    <div 
      className="relative w-full h-screen bg-black overflow-hidden select-none font-sans"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      style={{ perspective: "1000px" }}
    >
      {/* Background is solid black by container class */}

      {/* HUD */}
      <div className="absolute top-24 md:top-32 left-6 md:left-12 z-20 pointer-events-none max-w-2xl">
        <BlurText
          text="Galeria de Resultados"
          animateBy="words"
          delay={100}
          className="text-3xl md:text-6xl font-black mb-4 tracking-tighter uppercase text-[#E1E0CC] leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
        />
        <p className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/50 font-bold">
          Arraste para rotacionar • Scroll para zoom • Clique para detalhes
        </p>
      </div>

      {/* Cards Galaxy */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none" style={{ transformStyle: "preserve-3d" }}>
        {GALLERY_DATA.map((data, i) => (
          <div
            key={i}
            ref={(ref) => { if (ref) cardsRef.current[i] = ref }}
            className="absolute w-[68px] h-[84px] p-1.5 bg-[#1F2121] rounded-xl border border-white/10 pointer-events-auto cursor-pointer transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(255,120,0,0.6)]"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedCard(data)
              setIsFavorited(false)
            }}
          >
            <div className="w-full h-[calc(100%-14px)] rounded-lg overflow-hidden bg-black">
              <img src={data.img} alt={data.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="mt-1 text-[8px] font-bold text-center text-white truncate px-1">
              {data.title}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedCard && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 px-6"
          onClick={() => setSelectedCard(null)}
        >
          <div className="relative max-w-sm w-full">
            <button 
              className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors text-3xl"
              onClick={() => setSelectedCard(null)}
            >
              &times;
            </button>
            <div
              ref={modalRef}
              className="w-full bg-[#1A1A1A] rounded-[2rem] p-6 border border-white/10 shadow-2xl transition-transform duration-200 ease-out"
              style={{ transformStyle: "preserve-3d" }}
              onMouseMove={handleModalMouseMove}
              onMouseLeave={() => { if (modalRef.current) modalRef.current.style.transform = "rotateX(0deg) rotateY(0deg)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl mb-5">
                <img src={selectedCard.img} alt={selectedCard.title} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl font-black text-center text-white uppercase mb-5 tracking-tight">
                {selectedCard.title}
              </h2>
              <div className="flex gap-3">
                <button className="flex-1 h-12 rounded-xl text-white font-black uppercase text-sm bg-gradient-to-br from-[#ff6a00] to-[#ee0979] hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center gap-2">
                   <Download className="w-4 h-4" />
                   Download
                </button>
                <button 
                  className={`w-12 h-12 rounded-xl text-white font-black text-xl bg-gradient-to-br from-[#ff6a00] to-[#ee0979] transition-all flex items-center justify-center ${isFavorited ? "opacity-100" : "opacity-80"}`}
                  onClick={() => setIsFavorited(!isFavorited)}
                >
                  {isFavorited ? <Heart className="w-6 h-6 fill-white" /> : <Heart className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
