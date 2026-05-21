import React, { useRef, ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxSectionProps {
  children: ReactNode;
  bgImage?: string;
  className?: string;
  id?: string;
  overlayColor?: string;
}

export default function ParallaxSection({ 
  children, 
  bgImage, 
  className = "", 
  id,
  overlayColor = "bg-black/70" 
}: ParallaxSectionProps) {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    offset: ["start end", "end start"],
    target: container,
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section 
      id={id}
      className={`relative w-full ${className}`}
      ref={container}
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      {bgImage && (
        <div className="fixed top-[-10vh] left-0 h-[120vh] w-full z-0 pointer-events-none">
          <motion.div className="relative h-full w-full" style={{ y }}>
            <img
              alt="background"
              className="w-full h-full object-cover grayscale opacity-30 mix-blend-overlay"
              src={bgImage}
            />
          </motion.div>
        </div>
      )}
      
      {bgImage ? (
        <div className={`absolute inset-0 ${overlayColor} z-0 pointer-events-none`} />
      ) : (
        <div className={`absolute inset-0 ${overlayColor} z-0 pointer-events-none`} />
      )}
      
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </section>
  );
}
