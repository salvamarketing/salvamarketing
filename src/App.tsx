import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence, useScroll, useTransform, animate, useMotionValueEvent } from "framer-motion";
import Hls from "hls.js";
import { Player } from "@remotion/player";
import ScrollStack, { ScrollStackItem } from "./components/ui/ScrollStack";
import ParallaxSection from "./components/ui/ParallaxSection";
import TrueFocus from "./components/ui/TrueFocus";
import ScrollReveal from "./components/ui/ScrollReveal";
import { PerspectiveMarquee } from "./components/ui/PerspectiveMarquee";

import { Bot } from "lucide-react";

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

const GPTIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.073zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.597 8.3829v-2.3324a.0757.0757 0 0 1 .0332-.0615L17.46 3.2025a4.4992 4.4992 0 0 1 6.1408 1.6464 4.4708 4.4708 0 0 1 .5346 3.0137l-.1416-.0852-4.783-2.7582a.7712.7712 0 0 0-.7806 0l-5.8428 3.3685zm4.7046-1.5032A4.4755 4.4755 0 0 1 20.31 11.234v-5.5826a.071.071 0 0 0-.038-.052L15.4417 2.813a4.504 4.504 0 0 1 4.4945 4.4944zm-9.6607 4.1254l-5.8428-3.3685a.0804.0804 0 0 0-.0804 0l-4.8302 2.7865a4.4992 4.4992 0 0 0-1.6464 6.1408 4.4708 4.4708 0 0 0 3.0137.5346l-.0852-.142-2.7582-4.783a.7712.7712 0 0 1 0-.7806zm4.7571-7.1432l2.02-1.1686a.0757.0757 0 0 0 .071 0l4.8303 2.7865a4.504 4.504 0 0 1-2.3655 1.9728V6.828a.7664.7664 0 0 0-.3879-.6765zM12 15.2281L8.9141 13.447v-3.562L12 8.1039l3.0859 1.781v3.562z"/>
  </svg>
);

const tools = [
  { name: "Photoshop", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/photoshop/photoshop-plain.svg" },
  { name: "Illustrator", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/illustrator/illustrator-plain.svg" },
  { name: "Corel Draw", img: "https://cdn.simpleicons.org/coreldraw/white" },
  { name: "Gemini", img: "https://cdn.simpleicons.org/googlegemini/white" },
  { name: "GPT", icon: <GPTIcon className="w-5 h-5 md:w-6 md:h-6 text-white" /> },
  { name: "Manus", icon: <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" /> },
  { name: "Claude", img: "https://cdn.simpleicons.org/anthropic/white" },
];

const PortfolioTitle = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end start"]
  });

  const filter = useTransform(scrollYProgress, [0, 0.5], ["blur(0px)", "blur(8px)"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.2]);

  return (
    <div ref={ref} className="relative h-[20vh] md:h-[30vh] w-full flex flex-col items-center justify-start mt-12 md:mt-24">
      <motion.div 
        style={{ filter, opacity }}
        className="sticky top-[20vh] z-10 text-center flex flex-col items-center"
      >
        <div className="text-xs sm:text-sm font-subtitle font-thin text-white/80 mb-2 sm:mb-4 uppercase tracking-widest">// Portfólio</div>
        <h2 className="font-heading text-white text-5xl sm:text-6xl md:text-7xl leading-[0.9] tracking-[-2px]">
          Projetos Selecionados
        </h2>
      </motion.div>
    </div>
  );
};

const ToolsMarquee = () => {
  const toolSet = tools.map((tool, i) => (
    <div key={`tool-${i}`} className="flex items-center gap-3 text-white transition-colors duration-300 mr-16 md:mr-24">
      {tool.img ? (
        <img
          src={tool.img}
          alt={tool.name}
          className="w-5 h-5 md:w-6 md:h-6 opacity-100 object-contain"
          style={['Photoshop', 'Illustrator'].includes(tool.name) ? { filter: 'brightness(0) invert(1)' } : {}}
        />
      ) : (
        tool.icon
      )}
      <span className="text-sm md:text-xl font-heading font-medium tracking-widest uppercase">{tool.name}</span>
    </div>
  ));

  return (
    <div className="w-full bg-black py-6 md:py-8 border-y border-white/5 flex items-center overflow-hidden relative z-20">
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
      <motion.div
        className="flex whitespace-nowrap items-center w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 25, ease: "linear", repeat: Infinity }}
      >
        <div className="flex items-center">{[...Array(4)].map((_, i) => <React.Fragment key={`set1-${i}`}>{toolSet}</React.Fragment>)}</div>
        <div className="flex items-center">{[...Array(4)].map((_, i) => <React.Fragment key={`set2-${i}`}>{toolSet}</React.Fragment>)}</div>
      </motion.div>
    </div>
  );
};

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
          <div className="relative z-10 font-heading text-white/10 tracking-tighter" style={{ fontSize: 'clamp(4rem, 15vw, 12rem)' }}>
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
        <div className="text-xs sm:text-sm font-subtitle font-thin text-white/80 mb-4 sm:mb-6 uppercase tracking-widest">// Nossos Planos</div>
        <h2 className="font-heading text-white text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-2px] sm:tracking-[-3px]">
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
              <div className="relative group pt-8 md:pt-10 mb-8 max-w-4xl mx-auto transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_0_60px_rgba(255,255,255,0.15)]">
                {/* Folder Tab */}
                <div className="absolute top-0 left-4 md:left-12 px-6 h-10 md:h-12 rounded-t-xl md:rounded-t-2xl liquid-glass flex items-center gap-3 z-30 overflow-hidden shadow-lg border-b-0">
                  <div className={`absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-40`} />
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] shrink-0 relative z-10" />
                  <span className="text-white/90 text-xs md:text-sm font-body tracking-wider uppercase font-medium relative z-10">0{idx + 1}</span>
                </div>

                <div className="w-full bg-black/40 liquid-glass-strong rounded-2xl md:rounded-[3rem] p-6 sm:p-8 md:p-14 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.03)] z-20 min-h-[340px]">
                  <h3 className="font-heading text-white text-5xl md:text-6xl tracking-[-1px] leading-none mb-6">{item.title}</h3>
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

const ScrubVideoBackground = ({ src, videoClassName, scrollProgress }: { src: string, videoClassName?: string, scrollProgress: any }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    
    // Fetch video as Blob to ensure it's fully loaded into memory.
    // This allows perfect scrolling frame-by-frame and solves Vercel streaming blank screens.
    fetch(src)
      .then(res => {
         if (!res.ok) throw new Error("Network response was not ok");
         return res.blob();
      })
      .then(blob => {
        objectUrl = URL.createObjectURL(blob);
        setVideoSrc(objectUrl);
      })
      .catch((err) => {
        console.warn("Failed to fetch video blob, falling back to local src", err);
        setVideoSrc(src); // Fallback to compiled vercel mp4
      });

    return () => {
      if (objectUrl) {
         URL.revokeObjectURL(objectUrl);
      }
    }
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && videoSrc) {
      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          video.pause();
          video.currentTime = 0.05; // Seek forward slightly to show a frame instead of black
        }).catch(() => {});
      }
    }
  }, [videoSrc]);

  useMotionValueEvent(scrollProgress, "change", (latest: number) => {
    const video = videoRef.current;
    if (video && video.readyState >= 1 && video.duration) {
      // Latest is 0 to 1
      const progress = Math.max(0, Math.min(latest, 1));
      const targetTime = progress * video.duration;
      
      requestAnimationFrame(() => {
        if (video) {
            video.currentTime = targetTime;
        }
      });
    }
  });

  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none bg-[#0a0a0a]">
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          playsInline
          preload="auto"
          className={`w-full h-full object-cover transition-opacity duration-1000 opacity-100 ${videoClassName || ''}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
            {/* Loading indicator while Blob is downloading */}
            <div className="w-8 h-8 rounded-full border-[3px] border-white/10 border-t-white/60 animate-spin" />
        </div>
      )}
    </div>
  );
};


export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroContainerRef,
    offset: ["start start", "end end"]
  });

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

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (targetId === '#') {
      animate(window.scrollY, 0, {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (latest) => window.scrollTo(0, latest)
      });
    } else {
      const element = document.querySelector(targetId);
      if (element) {
        animate(window.scrollY, element.getBoundingClientRect().top + window.scrollY, {
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1],
          onUpdate: (latest) => window.scrollTo(0, latest)
        });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-black font-body text-white selection:bg-white/20">
      
      {/* SECTION 1: HERO CONTAINER */}
      <div ref={heroContainerRef} className="h-[300vh] w-full relative">
        <section className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden">
          <ScrubVideoBackground 
            src="/hero_scroll_kf.mp4"
            scrollProgress={heroScrollProgress}
            videoClassName="object-[65%_center] sm:object-[75%_center] md:object-[80%_center] lg:object-[85%_center]"
          />
          <div className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />

        {/* Navbar */}
        <nav className="fixed top-4 left-0 w-full px-6 md:px-8 lg:px-16 z-50 flex items-center justify-between mix-blend-difference text-white">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border border-white/20 rounded-full flex items-center justify-center text-lg sm:text-xl font-heading font-bold">
            LS
          </div>
          
          <div className="hidden md:flex border border-white/20 rounded-full px-1.5 py-1.5 items-center gap-1">
            <a href="#" onClick={(e) => handleScrollTo(e, '#')} className="px-3 py-2 text-sm font-medium hover:text-white/70 transition-colors">Início</a>
            <a href="#sobre" onClick={(e) => handleScrollTo(e, '#sobre')} className="px-3 py-2 text-sm font-medium hover:text-white/70 transition-colors">Sobre</a>
            <a href="#experiencia" onClick={(e) => handleScrollTo(e, '#experiencia')} className="px-3 py-2 text-sm font-medium hover:text-white/70 transition-colors">Experiência</a>
            <a href="#servicos" onClick={(e) => handleScrollTo(e, '#servicos')} className="px-3 py-2 text-sm font-medium hover:text-white/70 transition-colors">Serviços</a>
            <a href="#projetos" onClick={(e) => handleScrollTo(e, '#projetos')} className="px-3 py-2 text-sm font-medium hover:text-white/70 transition-colors">Portfólio</a>
            <a href="#contato" onClick={(e) => handleScrollTo(e, '#contato')} className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap flex items-center gap-1 ml-1 hover:bg-neutral-200 transition-colors">
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
              <div className="flex flex-col items-center gap-8 text-2xl font-heading">
                <a href="#" onClick={(e) => handleScrollTo(e, '#')} className="hover:text-white/70 transition-colors">Início</a>
                <a href="#sobre" onClick={(e) => handleScrollTo(e, '#sobre')} className="hover:text-white/70 transition-colors">Sobre</a>
                <a href="#experiencia" onClick={(e) => handleScrollTo(e, '#experiencia')} className="hover:text-white/70 transition-colors">Experiência</a>
                <a href="#servicos" onClick={(e) => handleScrollTo(e, '#servicos')} className="hover:text-white/70 transition-colors">Serviços</a>
                <a href="#projetos" onClick={(e) => handleScrollTo(e, '#projetos')} className="hover:text-white/70 transition-colors">Portfólio</a>
                <a href="#contato" onClick={(e) => handleScrollTo(e, '#contato')} className="bg-white text-black px-6 py-3 rounded-full text-xl font-bold flex items-center gap-2 mt-4">
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
              className="flex-col !gap-0 !items-start text-[12vw] sm:text-[10vw] lg:text-[8vw] xl:text-[8rem] font-heading text-white leading-[0.85] lg:leading-[0.8] !justify-start tracking-[-2px] sm:tracking-[-5px] text-left w-full"
            />
          </div>

          <motion.div 
            initial={{ filter: "blur(10px)", opacity: 0, x: -20 }}
            animate={{ filter: "blur(0px)", opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-2 mt-6 sm:mt-8 ml-1 lg:ml-2"
          >
            <span className="text-sm sm:text-base md:text-lg text-white/90 font-subtitle font-thin uppercase tracking-[0.2em] text-left">Design Gráfico & Comunicação Visual</span>
          </motion.div>

          <motion.div 
            initial={{ filter: "blur(10px)", opacity: 0, x: -20 }}
            animate={{ filter: "blur(0px)", opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-10 w-full sm:w-auto ml-1 lg:ml-2"
          >
            <a href="#projetos" onClick={(e) => handleScrollTo(e, '#projetos')} className="liquid-glass text-white rounded-full px-8 py-3.5 sm:py-4 text-sm font-bold flex items-center justify-center gap-2 hover:bg-black/40 transition-colors w-full sm:w-auto shadow-xl bg-black/20 backdrop-blur-md border border-white/10">
              Ver Projetos <ArrowUpRightIcon className="h-5 w-5" />
            </a>
            <a href="#contato" onClick={(e) => handleScrollTo(e, '#contato')} className="liquid-glass text-white rounded-full text-sm font-bold flex items-center justify-center gap-2 hover:bg-black/40 transition-colors w-full sm:w-auto py-3.5 sm:py-4 px-8 bg-black/20 backdrop-blur-md border border-white/10 shadow-xl">
              Entrar em Contato <PlayIcon className="h-4 w-4" />
            </a>
          </motion.div>

        </div>
      </section>
      </div>

      {/* FERRAMENTAS */}
      <ToolsMarquee />

      {/* SOBRE MIM */}
      <section id="sobre" className="relative min-h-screen w-full bg-black">
        <div className="relative z-10 flex flex-col w-full h-full px-6 md:px-16 lg:px-20 pt-16 md:pt-32 pb-16 md:pb-24">
          <div className="mb-auto">
            <div className="text-xs sm:text-sm font-subtitle font-thin text-white/80 mb-4 sm:mb-6 uppercase tracking-widest">// Sobre Mim</div>
            <h2 className="font-heading text-white text-4xl sm:text-5xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-2px] sm:tracking-[-3px] max-w-4xl">
              <ScrollReveal>Design com identidade, estratégia e criatividade</ScrollReveal>
            </h2>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 w-full text-white/90 font-light text-sm sm:text-base leading-relaxed">
            <div className="liquid-glass border border-white/10 rounded-[1.25rem] p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:border-white/20">
              <div className="mb-6 text-lg sm:text-xl leading-snug">
                Sou designer gráfico com mais de 10 anos de experiência atuando entre design, impressão gráfica, social media e marketing digital.
              </div>
              <div className="text-white/80">
                Ao longo da minha trajetória, participei de projetos voltados para criação de marcas, campanhas digitais, comunicação visual e produção criativa para empresas e negócios locais.
              </div>
            </div>
            <div className="liquid-glass border border-white/10 rounded-[1.25rem] p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:border-white/20">
              <div className="mb-6 text-lg sm:text-xl leading-snug">
                Atualmente atuando na Vittore Labs, em Passo Fundo, como analista de marketing, criando conteúdo e design de embalagens para produtos como creatina e encapsulados.
              </div>
              <div className="text-white/80">
                Meu objetivo é criar projetos que transmitam personalidade, profissionalismo e impacto visual.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIÊNCIA */}
      <ParallaxSection id="experiencia" className="py-16 md:py-24 border-t border-white/10" bgImage="https://lh3.googleusercontent.com/d/1hwmcQi0e2I16zDQvjRdRDfVAyeQHiSoN">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-20 mb-12">
          <div className="text-xs sm:text-sm font-subtitle font-thin text-white/80 mb-4 sm:mb-6 uppercase tracking-widest">// Experiência</div>
          <h2 className="font-heading text-white text-4xl sm:text-5xl md:text-7xl lg:text-[5rem] leading-[0.9] tracking-[-2px] mb-12">
            <ScrollReveal>{"Minha\nTrajetória"}</ScrollReveal>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="liquid-glass rounded-2xl p-6 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] relative z-10 hover:z-20">
              <h3 className="font-heading text-2xl text-white mb-1"><ScrollReveal>Naveo</ScrollReveal></h3>
              <p className="text-sm font-medium text-white/70 mb-6">Fev 2024 - Jan 2025</p>
              <ul className="text-sm text-white/80 space-y-2 flex-col font-light">
                <li>• Criação de artes para Instagram</li>
                <li>• Criativos para anúncios</li>
                <li>• Agendamento de posts</li>
                <li>• Desenvolvimento visual para campanhas</li>
              </ul>
            </div>
            <div className="liquid-glass rounded-2xl p-6 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] relative z-10 hover:z-20">
              <h3 className="font-heading text-2xl text-white mb-1"><ScrollReveal>Estampagraf</ScrollReveal></h3>
              <p className="text-sm font-medium text-white/70 mb-6">Fev 2025 - Dez 2025</p>
              <ul className="text-sm text-white/80 space-y-2 flex-col font-light">
                <li>• Banners, adesivos e placas</li>
                <li>• Comunicação visual para empresas</li>
                <li>• Operação de impressão</li>
                <li>• Atendimento ao público</li>
              </ul>
            </div>
            <div className="liquid-glass rounded-2xl p-6 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] relative z-10 hover:z-20">
              <h3 className="font-heading text-2xl text-white mb-1"><ScrollReveal>Spenassato</ScrollReveal></h3>
              <p className="text-sm font-medium text-white/70 mb-6">Mar 2020 - Nov 2023</p>
              <ul className="text-sm text-white/80 space-y-2 flex-col font-light">
                <li>• Criação de uniformes para impressão</li>
                <li>• Layouts personalizados</li>
                <li>• Desenvolvimento de materiais gráficos</li>
              </ul>
            </div>
            <div className="liquid-glass rounded-2xl p-6 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] relative z-10 hover:z-20">
              <h3 className="font-heading text-2xl text-white mb-1"><ScrollReveal>Vittore Labs</ScrollReveal></h3>
              <p className="text-sm font-medium text-white/70 mb-6">Jan 2026 - Presente</p>
              <ul className="text-sm text-white/80 space-y-2 flex-col font-light">
                <li>• Analista de Marketing</li>
                <li>• Criação de conteúdo digital</li>
                <li>• Embalagens para creatina e encapsulados (linha farmacêutica)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SERVIÇOS & DIFERENCIAIS */}
        <div id="servicos" className="max-w-7xl mx-auto px-6 md:px-16 lg:px-20 flex flex-col md:flex-row gap-12 md:gap-16 mt-16 md:mt-24">
          <div className="flex-1">
            <div className="text-xs sm:text-sm font-subtitle font-thin text-white/80 mb-4 sm:mb-6 uppercase tracking-widest">// Serviços</div>
            <h2 className="font-heading text-white text-4xl sm:text-5xl md:text-7xl leading-[0.9] tracking-[-2px] mb-8 md:mb-12">
              {"O que\neu faço"}
            </h2>
            <div className="flex flex-wrap gap-3">
              {['Design Gráfico', 'Identidade Visual', 'Social Media', 'Criativos para Anúncios', 'Landing Pages', 'Comunicação Visual', 'Fotografia e Vídeos', 'Edição de Fotos/Vídeos', 'Tráfego Pago (Locais)'].map(item => (
                <span key={item} className="liquid-glass px-4 py-2 rounded-full text-sm font-medium text-white/90">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-1 mt-6 md:mt-0">
            <div className="text-xs sm:text-sm font-subtitle font-thin text-white/80 mb-4 sm:mb-6 uppercase tracking-widest">// Diferenciais</div>
            <h2 className="font-heading text-white text-4xl sm:text-5xl md:text-7xl leading-[0.9] tracking-[-2px] mb-8 md:mb-12">
              {"Meu foco em\ncada projeto"}
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
                <li key={item} className="flex gap-3 text-white/90 font-light items-start">
                  <ArrowUpRightIcon className="w-5 h-5 shrink-0 mt-0.5 text-white/70" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ParallaxSection>


      {/* PORTFÓLIO */}
      <section id="projetos" className="relative py-16 md:py-32 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-20 text-center flex flex-col items-center">
          <PortfolioTitle />
          
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-8 mt-0 relative z-20">
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

                    <div className="w-full flex-1 bg-black/40 liquid-glass-strong rounded-2xl md:rounded-[3rem] p-6 sm:p-8 md:p-14 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.03)] z-20">
                      <img src={p.img} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-40 z-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                      
                      <div className="relative z-20 mt-auto text-left">
                        <h3 className="font-heading text-white text-3xl sm:text-4xl md:text-6xl tracking-[-1px] leading-none mb-4">
                          {p.title}
                        </h3>
                        <div className="text-white/80 font-light leading-relaxed max-w-2xl text-sm sm:text-base md:text-lg">
                          {p.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollStackItem>
              ))}
            </ScrollStack>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-b from-transparent to-black pointer-events-none z-20" />
      </section>

      {/* CONTATO */}
      <section id="contato" className="relative py-16 md:py-32 min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        <img
          src="https://lh3.googleusercontent.com/d/1DNe1SjHW2yiIirYwv9gFCK7xr4bsmfO8"
          alt="Contato Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/50 z-0" />
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 text-center flex flex-col items-center">
          <div className="text-xs sm:text-sm font-subtitle font-thin text-white/80 mb-4 sm:mb-6 uppercase tracking-widest">// Contato</div>
          <h2 className="font-heading text-white text-4xl sm:text-5xl md:text-8xl leading-[0.9] tracking-[-2px] mb-6 md:mb-8">
            <ScrollReveal>{"Vamos criar algo\njuntos?"}</ScrollReveal>
          </h2>
          <div className="text-white/90 font-subtitle font-thin uppercase tracking-[0.2em] leading-relaxed max-w-2xl mb-12 text-sm sm:text-base md:text-lg text-balance">
            Entre em contato para projetos, parcerias ou oportunidades.
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-stretch gap-4 sm:gap-6 text-left w-full max-w-3xl mb-12 sm:mb-16 px-4">
             <div className="liquid-glass text-white rounded-full px-8 py-4 text-sm sm:text-base font-medium flex items-center justify-center gap-2 shadow-xl text-center bg-black/20 backdrop-blur-md border border-white/10">
               Marau — RS
             </div>
             <a href="mailto:lazarosalvadori1@gmail.com" className="liquid-glass text-white rounded-full px-8 py-4 text-sm sm:text-base font-medium flex items-center justify-center gap-2 hover:bg-black/40 transition-colors shadow-xl text-center break-all bg-black/20 backdrop-blur-md border border-white/10">
               lazarosalvadori1@gmail.com
             </a>
             <a href="mailto:salvaadesign@gmail.com" className="liquid-glass text-white rounded-full px-8 py-4 text-sm sm:text-base font-medium flex items-center justify-center gap-2 hover:bg-black/40 transition-colors shadow-xl text-center break-all bg-black/20 backdrop-blur-md border border-white/10">
               salvaadesign@gmail.com
             </a>
             <a href="https://wa.me/5554996362178" target="_blank" rel="noreferrer" className="liquid-glass text-white rounded-full px-8 py-4 text-sm sm:text-base font-medium flex items-center justify-center gap-2 hover:bg-black/40 transition-colors shadow-xl text-center bg-black/20 backdrop-blur-md border border-white/10">
               (54) 99636-2178
             </a>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
            <a href="https://www.instagram.com/salvaagencia/" target="_blank" rel="noreferrer" className="liquid-glass text-white rounded-full px-8 py-4 text-sm sm:text-base font-medium flex items-center justify-center gap-2 hover:bg-black/40 transition-colors w-full sm:w-auto shadow-xl text-center bg-black/20 backdrop-blur-md border border-white/10">
              Instagram @salvaagencia <ArrowUpRightIcon className="h-5 w-5" />
            </a>
            <a href="https://www.behance.net/salvapng" target="_blank" rel="noreferrer" className="liquid-glass text-white rounded-full px-8 py-4 text-sm sm:text-base font-medium flex items-center justify-center gap-2 hover:bg-black/40 transition-colors w-full sm:w-auto shadow-xl text-center bg-black/20 backdrop-blur-md border border-white/10">
              Portfólio Behance <ArrowUpRightIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
