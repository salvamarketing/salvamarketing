import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Hls from "hls.js";
import { Player } from "@remotion/player";
import ScrollStack, { ScrollStackItem } from "./components/ui/ScrollStack";
import ParallaxSection from "./components/ui/ParallaxSection";
import TrueFocus from "./components/ui/TrueFocus";
import { PerspectiveMarquee } from "./components/ui/PerspectiveMarquee";

const ArrowUpRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17L17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6 4 20 12 6 20 6 4" />
  </svg>
);

/** 
 * FadingVideo Component
 * Wraps a <video> and handles custom JS crossfades on loop. 
 */
function FadingVideo({ src, className, style }: { src: string, className?: string, style?: React.CSSProperties }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rAFRef = useRef<number>(0);
  const fadingOutRef = useRef<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isInView = useInView(videoRef, { once: true, margin: "200px" });

  useEffect(() => {
    if (!isInView) return;

    const FADE_MS = 500;
    const FADE_OUT_LEAD = 0.55;
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    if (src.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls({ autoStartLoad: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    } else {
      video.src = src;
    }

    const fadeTo = (targetOpacity: number, duration: number) => {
      cancelAnimationFrame(rAFRef.current);
      const startOpacity = parseFloat(video.style.opacity || "0");
      const startTime = performance.now();

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        video.style.opacity = (startOpacity + (targetOpacity - startOpacity) * progress).toString();

        if (progress < 1) {
          rAFRef.current = requestAnimationFrame(animate);
        }
      };

      rAFRef.current = requestAnimationFrame(animate);
    };

    const handleLoadedData = () => {
      setIsLoaded(true);
      video.style.opacity = "0";
      // Force play promise pattern to avoid initial errors
      video.play().catch(e => console.log("Video auto-play blocked", e));
      fadeTo(1, FADE_MS);
    };

    const handleTimeUpdate = () => {
      if (!video) return;
      const timeLeft = video.duration - video.currentTime;
      if (!fadingOutRef.current && timeLeft <= FADE_OUT_LEAD && timeLeft > 0) {
        fadingOutRef.current = true;
        fadeTo(0, FADE_MS);
      }
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => {
        if (!video) return;
        video.currentTime = 0;
        video.play().catch(e => console.log("Video replay blocked", e));
        fadingOutRef.current = false;
        fadeTo(1, FADE_MS);
      }, 100);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      cancelAnimationFrame(rAFRef.current);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, isInView]);

  return (
    <>
      {!isLoaded && (
        <div 
          className={`flex items-center justify-center overflow-hidden bg-black ${className}`} 
          style={style} 
        >
          <div className="absolute inset-0 bg-gradient-to-bl from-zinc-800/10 via-black to-zinc-900/30 animate-pulse" />
          <div className="relative z-10 font-heading italic text-white/10 tracking-tighter" style={{ fontSize: 'clamp(4rem, 15vw, 12rem)' }}>
            SALVA
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        className={className}
        style={{ opacity: 0, ...style }}
        autoPlay
        muted
        playsInline
        preload={isInView ? "auto" : "none"}
      />
    </>
  );
}

/**
 * ScrollDrivenVideo Component
 * Scrubs video playback based on scroll position of its relative parent.
 */
function ScrollDrivenVideo({ src, className, style }: { src: string, className?: string, style?: React.CSSProperties }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    if (src.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls({ autoStartLoad: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    } else {
      video.src = src;
    }

    const handleLoadedMetadata = () => {
      setIsLoaded(true);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    let rafId = 0;
    
    const handleScroll = () => {
      if (!video || !video.duration) return;
      
      const parentSection = video.closest('section');
      if (!parentSection) return;

      const rect = parentSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      let scrollProgress = 0;
      
      // Calculate progress based on parent section's position
      if (rect.top <= 0) {
        const totalScrollableDistance = rect.height - viewportHeight;
        if (totalScrollableDistance > 0) {
            scrollProgress = Math.max(0, Math.min(1, Math.abs(rect.top) / totalScrollableDistance));
        }
      }

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
         if (video.duration && isFinite(video.duration)) {
             video.currentTime = video.duration * scrollProgress;
         }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Trigger scroll check on mount and resize
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      cancelAnimationFrame(rafId);
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <>
      {!isLoaded && (
        <div className={`absolute inset-0 bg-black flex items-center justify-center pointer-events-none z-0 ${className}`} style={style}>
          <div className="absolute inset-0 bg-gradient-to-bl from-zinc-800/10 via-black to-zinc-900/30 animate-pulse" />
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        className={`absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0 ${className || ''}`}
        style={style}
        muted
        playsInline
        preload="auto"
      />
    </>
  );
}

/**
 * BlurText Component
 * Word-by-word blur-in animation.
 */
function BlurText({ text, className }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const words = text.split(" ");

  const variants = {
    hidden: { filter: "blur(10px)", opacity: 0, y: 50 },
    visible: (i: number) => ({
      filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
      opacity: [0, 0.5, 1],
      y: [50, -5, 0],
      transition: {
        duration: 0.7,
        times: [0, 0.5, 1],
        ease: "easeOut" as const,
        delay: (i * 100) / 1000,
      },
    }),
  };

  return (
    <p
      ref={ref}
      className={className}
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", rowGap: "0.1em" }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          custom={i}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={variants}
          style={{ display: "inline-block", marginRight: "0.28em" }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

const plans = [
  {
    title: "Plano Essencial",
    description: "O \"Start\" Digital. Ideal para quem precisa organizar a casa e começar a atrair clientes de forma profissional. Deixe de perder oportunidades e comece a construir uma presença digital que realmente funciona.",
    tags: ["Redes Sociais", "Anúncios Ads", "Google Local", "Atendimento Auto", "Identidade Visual"]
  },
  {
    title: "Plano Completo",
    description: "Aceleração de Vendas. Para empresas que querem profissionalismo total e processos que rodam sozinhos. Transforme visitantes em clientes fiéis e construa uma marca inesquecível.",
    tags: ["Site Profissional", "Vídeos Profissionais", "Estratégia de Vendas", "Automação de Renovação", "Gestão"]
  },
  {
    title: "Plano Elite",
    description: "Gestão e Automação Total. A solução completa para quem quer delegar toda a parte técnica e focar apenas no fechamento. A sua equipe de alta performance trabalhando 24/7 para você.",
    tags: ["Sincronização", "Painel em Tempo Real", "Robôs de Prospecção", "Suporte Prioritário"]
  }
];

const ServicesSection = () => {
  return (
    <section className="relative w-full py-24 bg-black overflow-hidden relative z-10" id="planos">
      <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-20 mb-12 sm:mb-16 mt-16 sm:mt-20">
        <div className="text-xs sm:text-sm font-light text-white/80 mb-4 sm:mb-6 uppercase tracking-widest">// Nossos Planos</div>
        <h2 className="font-heading italic text-white text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-2px] sm:tracking-[-3px]">
          Acelere Seu<br />Crescimento
        </h2>
      </div>
      
      <div className="max-w-6xl mx-auto w-full px-6 md:px-8">
        <ScrollStack
          useWindowScroll={true}
          itemDistance={120}
          itemStackDistance={35}
          blurAmount={10}
          className="w-full pb-32"
        >
          {plans.map((item, idx) => (
            <ScrollStackItem key={idx} itemClassName="!p-0 !bg-transparent !shadow-none !border-none !m-0 !h-auto">
              <div className="relative group pt-8 md:pt-10 mb-8 max-w-4xl mx-auto">
                {/* Folder Tab */}
                <div className="absolute top-0 left-4 md:left-12 px-6 h-10 md:h-12 rounded-t-xl md:rounded-t-2xl liquid-glass flex items-center gap-3 z-30 overflow-hidden shadow-lg border-b-0">
                  <div className={`absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-40`} />
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] shrink-0 relative z-10" />
                  <span className="text-white/90 text-xs md:text-sm font-body tracking-wider uppercase font-medium relative z-10">0{idx + 1}</span>
                </div>

                <div className="w-full bg-black/40 liquid-glass-strong rounded-2xl md:rounded-[3rem] p-8 md:p-14 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.03)] z-20 min-h-[340px]">
                  <h3 className="font-heading italic text-white text-5xl md:text-6xl tracking-[-1px] leading-none mb-6">{item.title}</h3>
                  <p className="text-white/80 font-light leading-relaxed max-w-2xl mb-12 text-base md:text-lg">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {item.tags.map(tag => (
                      <span key={tag} className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/90 whitespace-nowrap uppercase tracking-wider font-light">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>
    </section>
  );
};

function PerspectiveMarqueeScene() {
  return (
    <PerspectiveMarquee
      items={[
        "Photoshop",
        "Illustrator",
        "Premiere Pro",
        "Pacote Adobe",
        "Meta Ads",
        "Marketing Digital"
      ]}
      rotateY={-28}
      rotateX={8}
      perspective={1200}
      pixelsPerFrame={2}
      background="transparent"
      fadeColor="rgba(0,0,0,0.8)"
      color="white"
    />
  );
}

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Suppress specific framer-motion list key warnings
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('Each child in a list should have a unique "key" prop')) return;
      originalError.call(console, ...args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-black font-body text-white selection:bg-white/20">
      
      {/* SECTION 1: HERO */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <img
          src="https://lh3.googleusercontent.com/d/1gasCbZTrXLUUtj8zEn2IjSTui4e6vZGz"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover object-[90%_center] lg:object-[80%_center] z-0"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />

        {/* Navbar */}
        <nav className="fixed top-4 left-0 w-full px-6 md:px-8 lg:px-16 z-50 flex items-center justify-between mix-blend-difference text-white">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border border-white/20 rounded-full flex items-center justify-center text-lg sm:text-xl font-heading italic font-bold">
            S
          </div>
          
          <div className="hidden md:flex border border-white/20 rounded-full px-1.5 py-1.5 items-center gap-1">
            <a href="#" className="px-3 py-2 text-sm font-medium hover:text-white/70 transition-colors">Início</a>
            <a href="#sobre" className="px-3 py-2 text-sm font-medium hover:text-white/70 transition-colors">Sobre</a>
            <a href="#experiencia" className="px-3 py-2 text-sm font-medium hover:text-white/70 transition-colors">Experiência</a>
            <a href="#servicos" className="px-3 py-2 text-sm font-medium hover:text-white/70 transition-colors">Serviços</a>
            <a href="#projetos" className="px-3 py-2 text-sm font-medium hover:text-white/70 transition-colors">Portfólio</a>
            <a href="#contato" className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap flex items-center gap-1 ml-1 hover:bg-neutral-200 transition-colors">
              Contato <ArrowUpRightIcon className="h-4 w-4" />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden w-10 h-10 border border-white/20 rounded-full flex flex-col items-center justify-center gap-1 cursor-pointer z-[60]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className={`w-4 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`w-4 h-0.5 bg-white transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-4 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center pt-20"
            >
              <div className="flex flex-col items-center gap-8 text-2xl font-heading italic">
                <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white/70 transition-colors">Início</a>
                <a href="#sobre" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white/70 transition-colors">Sobre</a>
                <a href="#experiencia" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white/70 transition-colors">Experiência</a>
                <a href="#servicos" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white/70 transition-colors">Serviços</a>
                <a href="#projetos" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white/70 transition-colors">Portfólio</a>
                <a href="#contato" onClick={() => setIsMobileMenuOpen(false)} className="bg-white text-black px-6 py-3 rounded-full text-xl font-bold flex items-center gap-2 mt-4">
                  Contato <ArrowUpRightIcon className="h-5 w-5" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Content */}
        <div className="relative z-20 flex-1 flex flex-col items-start justify-center pt-24 px-8 md:px-16 lg:px-24 w-full">
          
          <div className="flex flex-col w-full">
            <TrueFocus 
              sentence="Lázaro Salvadori"
              manualMode={false}
              blurAmount={5}
              borderColor="white"
              glowColor="rgba(255, 255, 255, 0.4)"
              animationDuration={0.8}
              pauseBetweenAnimations={1}
              className="flex-col !gap-0 !items-start text-[12vw] sm:text-[10vw] lg:text-[8vw] xl:text-[8rem] font-heading italic text-white leading-[0.85] lg:leading-[0.8] !justify-start tracking-[-2px] sm:tracking-[-5px] text-left w-full"
            />
          </div>

          <motion.div 
            initial={{ filter: "blur(10px)", opacity: 0, x: -20 }}
            animate={{ filter: "blur(0px)", opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-2 mt-6 sm:mt-8 ml-1 lg:ml-2"
          >
            <span className="text-sm sm:text-base md:text-lg text-white/90 font-medium uppercase tracking-[0.2em] text-left">Design Gráfico & Comunicação Visual</span>
          </motion.div>

          <motion.div 
            initial={{ filter: "blur(10px)", opacity: 0, x: -20 }}
            animate={{ filter: "blur(0px)", opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-10 w-full sm:w-auto ml-1 lg:ml-2"
          >
            <a href="#projetos" className="bg-white text-black rounded-full px-8 py-3.5 sm:py-4 text-sm font-bold flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors w-full sm:w-auto shadow-xl">
              Ver Projetos <ArrowUpRightIcon className="h-5 w-5" />
            </a>
            <a href="#contato" className="text-sm font-bold text-white flex items-center justify-center gap-2 hover:text-white/70 transition-colors w-full sm:w-auto py-3.5 sm:py-4">
              Entrar em Contato <PlayIcon className="h-4 w-4" />
            </a>
          </motion.div>

        </div>
      </section>

      {/* SOBRE MIM */}
      <section id="sobre" className="relative min-h-screen w-full bg-black">
        <div className="relative z-10 flex flex-col w-full h-full px-6 md:px-16 lg:px-20 pt-20 md:pt-32 pb-20">
          <div className="mb-auto">
            <div className="text-xs sm:text-sm font-light text-white/80 mb-4 sm:mb-6 uppercase tracking-widest">// Sobre Mim</div>
            <h2 className="font-heading italic text-white text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-2px] sm:tracking-[-3px] max-w-4xl">
              Design com identidade, <br/>estratégia e criatividade
            </h2>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 w-full text-white/90 font-light text-sm sm:text-base leading-relaxed">
            <div className="liquid-glass border border-white/10 rounded-[1.25rem] p-8 md:p-10">
              <p className="mb-6 text-lg sm:text-xl leading-snug">
                Sou designer gráfico com mais de 10 anos de experiência atuando entre design, impressão gráfica, social media e marketing digital.
              </p>
              <p className="text-white/70">
                Ao longo da minha trajetória, participei de projetos voltados para criação de marcas, campanhas digitais, comunicação visual e produção criativa para empresas e negócios locais.
              </p>
            </div>
            <div className="liquid-glass border border-white/10 rounded-[1.25rem] p-8 md:p-10">
              <p className="mb-6 text-lg sm:text-xl leading-snug">
                Também atuei na Vittore Labs, em Marau, desenvolvendo soluções visuais e estratégias digitais voltadas para posicionamento de marca e presença online.
              </p>
              <p className="text-white/70">
                Meu objetivo é criar projetos que transmitam personalidade, profissionalismo e impacto visual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIÊNCIA */}
      <ParallaxSection id="experiencia" className="py-24 border-t border-white/10" bgImage="https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2000&auto=format&fit=crop">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-20 mb-12">
          <div className="text-xs sm:text-sm font-light text-white/80 mb-4 sm:mb-6 uppercase tracking-widest">// Experiência</div>
          <h2 className="font-heading italic text-white text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] leading-[0.9] tracking-[-2px] mb-12">
            Minha<br/>Trajetória
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="liquid-glass rounded-2xl p-6 flex flex-col">
              <h3 className="font-heading italic text-2xl text-white mb-1">Naveo</h3>
              <p className="text-sm font-medium text-white/50 mb-6">2024 / 2025</p>
              <ul className="text-sm text-white/70 space-y-2 flex-col font-light">
                <li>• Criação de artes para Instagram</li>
                <li>• Criativos para anúncios</li>
                <li>• Agendamento de posts</li>
                <li>• Desenvolvimento visual para campanhas</li>
              </ul>
            </div>
            <div className="liquid-glass rounded-2xl p-6 flex flex-col">
              <h3 className="font-heading italic text-2xl text-white mb-1">Estampagraf</h3>
              <p className="text-sm font-medium text-white/50 mb-6">2025</p>
              <ul className="text-sm text-white/70 space-y-2 flex-col font-light">
                <li>• Banners, adesivos e placas</li>
                <li>• Comunicação visual para empresas</li>
                <li>• Operação de impressão</li>
                <li>• Atendimento ao público</li>
              </ul>
            </div>
            <div className="liquid-glass rounded-2xl p-6 flex flex-col">
              <h3 className="font-heading italic text-2xl text-white mb-1">Spenassato</h3>
              <p className="text-sm font-medium text-white/50 mb-6">2020 / 2023</p>
              <ul className="text-sm text-white/70 space-y-2 flex-col font-light">
                <li>• Criação de uniformes para impressão</li>
                <li>• Layouts personalizados</li>
                <li>• Desenvolvimento de materiais gráficos</li>
              </ul>
            </div>
            <div className="liquid-glass rounded-2xl p-6 flex flex-col">
              <h3 className="font-heading italic text-2xl text-white mb-1">Vittore Labs</h3>
              <p className="text-sm font-medium text-white/50 mb-6">&nbsp;</p>
              <ul className="text-sm text-white/70 space-y-2 flex-col font-light">
                <li>• Desenvolvimento criativo</li>
                <li>• Design para presença digital</li>
                <li>• Estratégias visuais e campanhas online</li>
              </ul>
            </div>
          </div>
        </div>
      </ParallaxSection>

      {/* SERVIÇOS & DIFERENCIAIS */}
      <ParallaxSection id="servicos" className="py-24 border-t border-white/10" bgImage="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2000&auto=format&fit=crop">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-20 flex flex-col md:flex-row gap-16 md:gap-8">
          <div className="flex-1">
            <div className="text-xs sm:text-sm font-light text-white/80 mb-4 sm:mb-6 uppercase tracking-widest">// Serviços</div>
            <h2 className="font-heading italic text-white text-5xl sm:text-6xl md:text-7xl leading-[0.9] tracking-[-2px] mb-12">
              O que<br/>eu faço
            </h2>
            <div className="flex flex-wrap gap-3">
              {['Design Gráfico', 'Identidade Visual', 'Social Media', 'Criativos para Anúncios', 'Landing Pages', 'Comunicação Visual', 'Fotografia e Vídeos', 'Edição de Fotos/Vídeos', 'Tráfego Pago (Locais)'].map(item => (
                <span key={item} className="liquid-glass px-4 py-2 rounded-full text-sm font-medium text-white/90">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-xs sm:text-sm font-light text-white/80 mb-4 sm:mb-6 uppercase tracking-widest">// Diferenciais</div>
            <h2 className="font-heading italic text-white text-5xl sm:text-6xl md:text-7xl leading-[0.9] tracking-[-2px] mb-12">
              Meu foco em<br/>cada projeto
            </h2>
            <ul className="space-y-4">
              {[
                'Design moderno e estratégico',
                'Comunicação visual profissional',
                'Atenção aos detalhes',
                'Criatividade aplicada à marca',
                'Experiência prática no mercado gráfico e digital',
                'Desenvolvimento visual alinhado ao posicionamento da empresa'
              ].map(item => (
                <li key={item} className="flex gap-3 text-white/80 font-light items-start">
                  <ArrowUpRightIcon className="w-5 h-5 shrink-0 mt-0.5 text-white/50" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ParallaxSection>

      {/* FERRAMENTAS */}
      <ParallaxSection className="py-16 sm:py-24 flex flex-col items-center" bgImage="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop">
        <div className="text-xs sm:text-sm font-light text-white/80 mb-12 uppercase tracking-widest">// Ferramentas que utilizo</div>
        
        <div className="w-full relative overflow-hidden" style={{ height: "400px" }}>
          <Player
            component={PerspectiveMarqueeScene}
            durationInFrames={240}
            fps={30}
            compositionWidth={1280}
            compositionHeight={400}
            style={{ width: "100%", height: "100%" }}
            controls={false}
            autoPlay
            loop
            clickToPlay={false}
          />
        </div>
      </ParallaxSection>

      {/* PORTFÓLIO */}
      <ParallaxSection id="projetos" className="py-32 border-t border-white/10" bgImage="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-20 text-center flex flex-col items-center">
          <div className="text-xs sm:text-sm font-light text-white/80 mb-4 sm:mb-6 uppercase tracking-widest">// Portfólio</div>
          <h2 className="font-heading italic text-white text-5xl sm:text-6xl md:text-7xl leading-[0.9] tracking-[-2px] mb-16">
            Projetos Selecionados
          </h2>
          
          <div className="max-w-6xl mx-auto w-full px-6 md:px-8 mt-12">
            <ScrollStack
              useWindowScroll={true}
              itemDistance={120}
              itemStackDistance={35}
              blurAmount={10}
              className="w-full pb-32"
            >
              {[
                { img: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=2194&auto=format&fit=crop', title: 'Identidade Visual', desc: 'Criação de marcas autênticas' },
                { img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop', title: 'Social Media', desc: 'Presença digital estratégica' },
                { img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop', title: 'Dashboard UI', desc: 'Design de interfaces modernas' },
                { img: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?q=80&w=2074&auto=format&fit=crop', title: 'Landing Pages', desc: 'Foco em conversão' },
                { img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop', title: 'Criativos para Anúncios', desc: 'Design orientado a resultados' },
                { img: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=2070&auto=format&fit=crop', title: 'Comunicação Visual', desc: 'Adesivos, fachadas e banners' },
              ].map((p, idx) => (
                <ScrollStackItem key={idx} itemClassName="!p-0 !bg-transparent !shadow-none !border-none !m-0 !h-auto">
                  <div className="relative group pt-8 md:pt-10 mb-8 max-w-4xl mx-auto w-full min-h-[40vh] md:min-h-[60vh] flex flex-col">
                    {/* Folder Tab */}
                    <div className="absolute top-0 left-4 md:left-12 px-6 h-10 md:h-12 rounded-t-xl md:rounded-t-2xl liquid-glass flex items-center gap-3 z-30 overflow-hidden shadow-lg border-b-0">
                      <div className={`absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-40`} />
                      <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] shrink-0 relative z-10" />
                      <span className="text-white/90 text-xs md:text-sm font-body tracking-wider uppercase font-medium relative z-10">0{idx + 1}</span>
                    </div>

                    <div className="w-full flex-1 bg-black/40 liquid-glass-strong rounded-2xl md:rounded-[3rem] p-8 md:p-14 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.03)] z-20">
                      <img src={p.img} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-40 z-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                      
                      <div className="relative z-20 mt-auto text-left">
                        <h3 className="font-heading italic text-white text-4xl md:text-6xl tracking-[-1px] leading-none mb-4">{p.title}</h3>
                        <p className="text-white/80 font-light leading-relaxed max-w-2xl text-sm md:text-lg">
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollStackItem>
              ))}
            </ScrollStack>
          </div>
        </div>
      </ParallaxSection>

      {/* CONTATO */}
      <section id="contato" className="relative py-32 border-t border-white/10 min-h-screen flex items-center justify-center overflow-hidden">
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260417_061226_74f0749c-a22d-42b3-895e-5d6203bc741c.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/50 z-0" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 text-center flex flex-col items-center">
          <div className="text-xs sm:text-sm font-light text-white/80 mb-4 sm:mb-6 uppercase tracking-widest">// Contato</div>
          <h2 className="font-heading italic text-white text-5xl sm:text-6xl md:text-8xl leading-[0.9] tracking-[-2px] mb-8">
            Vamos criar algo<br />juntos?
          </h2>
          <p className="text-white font-light leading-relaxed max-w-2xl mb-12 text-lg sm:text-xl">
            Entre em contato para projetos, parcerias ou oportunidades.
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-stretch gap-4 sm:gap-6 text-left w-full max-w-3xl mb-12 sm:mb-16 px-4">
             <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-4 px-6 flex items-center justify-center text-center">
               <div className="text-white text-sm sm:text-base font-medium">Marau — RS</div>
             </div>
             <a href="mailto:lazarosalvadori1@gmail.com" className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-4 px-6 flex items-center justify-center text-center hover:bg-white/20 transition-colors break-all">
               <div className="text-white text-sm sm:text-base font-medium">lazarosalvadori1@gmail.com</div>
             </a>
             <a href="mailto:salvaadesign@gmail.com" className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-4 px-6 flex items-center justify-center text-center hover:bg-white/20 transition-colors break-all">
               <div className="text-white text-sm sm:text-base font-medium">salvaadesign@gmail.com</div>
             </a>
             <a href="https://wa.me/5554996362178" target="_blank" rel="noreferrer" className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-4 px-6 flex items-center justify-center text-center hover:bg-white/20 transition-colors">
               <div className="text-white text-sm sm:text-base font-medium">(54) 99636-2178</div>
             </a>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
            <a href="https://instagram.com/salvaagencia" target="_blank" rel="noreferrer" className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200 transition-colors shadow-2xl rounded-full px-8 py-4 text-sm sm:text-base font-bold flex items-center justify-center gap-2 text-center">
              Instagram @salvaagencia <ArrowUpRightIcon className="h-5 w-5" />
            </a>
            <a href="#" target="_blank" rel="noreferrer" className="w-full sm:w-auto bg-neutral-800 text-white hover:bg-neutral-700 transition-colors shadow-2xl rounded-full px-8 py-4 text-sm sm:text-base font-bold flex items-center justify-center gap-2 text-center">
              Portfólio Behance <ArrowUpRightIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
