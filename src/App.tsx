import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Hls from "hls.js";
import ScrollStack, { ScrollStackItem } from "./components/ui/ScrollStack";
import heroVideoSrc from "./assets/hero_video.mp4";

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

  useEffect(() => {
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
  }, [src]);

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
        src={src}
        className={className}
        style={{ opacity: 0, ...style }}
        autoPlay
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

export default function App() {
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
      <section className="relative w-full h-screen overflow-hidden flex flex-col items-center">
        <FadingVideo
          src={heroVideoSrc}
          className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
          style={{ width: "120%", height: "120%" }}
        />

        {/* Navbar */}
        <nav className="fixed top-4 left-0 w-full px-8 lg:px-16 z-50 flex items-center justify-between mix-blend-difference text-white">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border border-white/20 rounded-full flex items-center justify-center text-lg sm:text-xl font-heading italic font-bold">
            S
          </div>
          
          <div className="hidden md:flex border border-white/20 rounded-full px-1.5 py-1.5 items-center gap-1">
            <a href="#" className="px-3 py-2 text-sm font-medium hover:text-white/70 transition-colors">Início</a>
            <a href="#capacidades" className="px-3 py-2 text-sm font-medium hover:text-white/70 transition-colors">Por que a SALVA?</a>
            <a href="#planos" className="px-3 py-2 text-sm font-medium hover:text-white/70 transition-colors">Planos</a>
            <a href="#condicoes" className="px-3 py-2 text-sm font-medium hover:text-white/70 transition-colors">Condições</a>
            <a href="#" className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap flex items-center gap-1 ml-1 hover:bg-neutral-200 transition-colors">
              Garantir Vaga <ArrowUpRightIcon className="h-4 w-4" />
            </a>
          </div>

          <div className="w-12 h-12 invisible" aria-hidden="true" />
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center pt-24 px-4 w-full">
          
          <motion.div 
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="backdrop-blur-md bg-white/20 border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-full flex items-center p-1 pr-3 sm:pr-4 mb-6 max-w-full overflow-hidden"
          >
            <span className="bg-black text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold mr-2 sm:mr-3 shrink-0">Novo</span>
            <span className="text-xs sm:text-sm text-black/90 font-medium truncate mr-2">Transforme a maneira como você faz negócios</span>
          </motion.div>

          <BlurText 
            text="Liberte Seu Tempo, Multiplique Seus Resultados." 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-black leading-[0.85] sm:leading-[0.8] max-w-4xl justify-center tracking-[-2px] sm:tracking-[-4px] text-center"
          />

          <motion.p 
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
            className="mt-6 sm:mt-4 text-xs sm:text-sm md:text-base text-black/80 max-w-2xl font-medium leading-relaxed sm:leading-tight text-center px-4 sm:px-0"
          >
            Cansado de apagar incêndios e ver seu negócio estagnado? Na SALVA, entregamos liberdade, eficiência e resultados comprovados para o empreendedor moderno.
          </motion.p>

          <motion.div 
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-8 sm:mt-6 w-full sm:w-auto px-6 sm:px-0"
          >
            <a href="#planos" className="bg-black text-white rounded-full px-6 sm:px-5 py-3 sm:py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-black/80 transition-colors w-full sm:w-auto shadow-xl">
              Ver Nossos Planos <ArrowUpRightIcon className="h-5 w-5" />
            </a>
            <button className="text-sm font-bold text-black flex items-center justify-center gap-2 hover:text-black/70 transition-colors w-full sm:w-auto py-2">
              Falar com Especialista <PlayIcon className="h-4 w-4" />
            </button>
          </motion.div>

          <motion.div 
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row flex-wrap items-stretch justify-center gap-4 mt-8 sm:mt-8 w-full px-6 sm:px-0"
          >
            <div className="backdrop-blur-md bg-white/20 border border-black/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] p-5 w-full sm:w-[220px] rounded-[1.25rem] flex flex-col items-start text-left">
              <svg className="h-7 w-7 text-black opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <div className="mt-8 sm:mt-auto pt-2 sm:pt-6">
                <div className="text-4xl tracking-[-1px] leading-none font-heading italic text-black">100%</div>
                <div className="text-xs text-black/70 font-bold mt-2 uppercase tracking-wide">Foco Estratégico</div>
              </div>
            </div>
            
            <div className="backdrop-blur-md bg-white/20 border border-black/10 shadow-[0_4px_30px_rgba(0,0,0,0.05)] p-5 w-full sm:w-[220px] rounded-[1.25rem] flex flex-col items-start text-left">
              <svg className="h-7 w-7 text-black opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2A15.3 15.3 0 0 1 17 12a15.3 15.3 0 0 1-5 10 15.3 15.3 0 0 1-5-10 15.3 15.3 0 0 1 5-10z"/>
              </svg>
              <div className="mt-8 sm:mt-auto pt-2 sm:pt-6">
                <div className="text-4xl tracking-[-1px] leading-none font-heading italic text-black">24/7</div>
                <div className="text-xs text-black/70 font-bold mt-2 uppercase tracking-wide">Operando no Piloto Automático</div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Partners */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="relative z-10 flex flex-col items-center gap-4 pb-8 w-full mt-auto"
        >
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white/80">
            Colaborando com os principais pioneiros aeroespaciais do mundo
          </div>
          <div className="flex flex-wrap justify-center items-center font-heading italic text-white text-2xl md:text-3xl tracking-tight gap-12 md:gap-16">
            <span>Aeon</span>
            <span>Vela</span>
            <span>Apex</span>
            <span>Orbit</span>
            <span>Zeno</span>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: CAPABILITIES */}
      <section className="relative min-h-screen w-full flex flex-col bg-black">
        <FadingVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        <div className="relative z-10 flex flex-col w-full h-full px-6 md:px-16 lg:px-20 pt-20 md:pt-24 pb-10 flex-1 min-h-screen">
          <div className="mb-auto">
            <div className="text-xs sm:text-sm font-light text-white/80 mb-4 sm:mb-6 uppercase tracking-widest">// Por que a SALVA?</div>
            <h2 className="font-heading italic text-white text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-2px] sm:tracking-[-3px]">
              A Solução<br />Que Você Precisa
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">
            
            {/* Card 1 */}
            <div className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="liquid-glass rounded-xl w-11 h-11 flex items-center justify-center shrink-0">
                  <svg className="h-6 w-6 text-white shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5-3 4L9 13l-3 4Z" />
                  </svg>
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  {["Liberdade", "Planejamento"].map(tag => (
                    <span key={tag} className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 whitespace-nowrap">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex-1" />
              <div className="mt-6">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">Mais Tempo Livre</h3>
                <p className="mt-3 text-sm text-white/90 font-light leading-snug max-w-[32ch]">
                  Tenha mais tempo para sua família, seus hobbies, ou para planejar o futuro da sua empresa. Você foca no seu core business, nós cuidamos do resto.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="liquid-glass rounded-xl w-11 h-11 flex items-center justify-center shrink-0">
                  <svg className="h-6 w-6 text-white shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M4 6.47 5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4Z" />
                  </svg>
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  {["Engenharia Social", "Atração Automática"].map(tag => (
                    <span key={tag} className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 whitespace-nowrap">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex-1" />
              <div className="mt-6">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">Atração Constante</h3>
                <p className="mt-3 text-sm text-white/90 font-light leading-snug max-w-[32ch]">
                  Veja seus clientes chegarem de forma constante, sem esforço manual. Combinamos psicologia comportamental e tecnologia para resultados comprovados.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="liquid-glass rounded-xl w-11 h-11 flex items-center justify-center shrink-0">
                  <svg className="h-6 w-6 text-white shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z" />
                  </svg>
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  {["Eficiência", "Controle Total"].map(tag => (
                    <span key={tag} className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 whitespace-nowrap">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex-1" />
              <div className="mt-6">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">Piloto Automático</h3>
                <p className="mt-3 text-sm text-white/90 font-light leading-snug max-w-[32ch]">
                  Ter processos que funcionam no piloto automático, liberando você para ser o estrategista e acompanhar resultados em tempo real com clareza.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: SERVICES */}
      <ServicesSection />
      
      {/* SECTION 4: CTA */}
      <section id="condicoes" className="relative w-full py-24 bg-black overflow-hidden relative z-10 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center flex flex-col items-center">
          <div className="text-xs sm:text-sm font-light text-white/80 mb-4 sm:mb-6 uppercase tracking-widest">// Pronto para Transformar Seu Negócio?</div>
          <h2 className="font-heading italic text-white text-4xl sm:text-5xl md:text-6xl leading-[0.9] tracking-[-2px] mb-8">
            Condições Especiais<br />para Você Começar Agora!
          </h2>
          <p className="text-white/80 font-light leading-relaxed max-w-2xl mb-12 text-base md:text-lg">
            Sabemos que tempo é dinheiro. Por isso, facilitamos sua entrada para o mundo da automação e dos resultados.
          </p>
          
          <div className="flex flex-col gap-4 text-left w-full max-w-2xl mb-12">
            <div className="liquid-glass rounded-2xl p-6">
              <div className="font-bold text-white mb-2 font-heading italic text-xl">Início do Projeto</div>
              <p className="text-white/70 text-sm">Imediato após a contratação.</p>
            </div>
            <div className="liquid-glass rounded-2xl p-6">
              <div className="font-bold text-white mb-2 font-heading italic text-xl">Prazo de Entrega</div>
              <p className="text-white/70 text-sm">Estimativa de 20 dias corridos para a estrutura principal. Veja seus resultados em tempo recorde!</p>
            </div>
            <div className="liquid-glass rounded-2xl p-6">
              <div className="font-bold text-white mb-2 font-heading italic text-xl">Facilidades de Pagamento</div>
              <p className="text-white/70 text-sm">Pague em até 12x no cartão de crédito ou garanta 10% de desconto via PIX.</p>
            </div>
          </div>
          
          <p className="text-white/80 font-light leading-relaxed max-w-2xl mb-8 text-lg font-medium">
            Não deixe para depois o sucesso que você pode ter hoje. A SALVA está pronta para transformar seu negócio.
          </p>
          
          <button className="bg-white text-black hover:bg-neutral-200 transition-colors shadow-2xl rounded-full px-8 py-5 text-lg font-bold flex items-center justify-center gap-3 w-full sm:w-auto">
            Quero Liberar Meu Tempo e Multiplicar Meus Resultados! <ArrowUpRightIcon className="h-6 w-6" />
          </button>
          
          <p className="mt-8 text-white/50 text-xs uppercase tracking-widest font-heading">
            SALVA: Seu Parceiro Estratégico para o Sucesso Digital.
          </p>
        </div>
      </section>

    </div>
  );
}
