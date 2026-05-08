import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

interface AnimatedCharactersProps {
  text: string;
  className?: string;
}

export function AnimatedCharacters({ text, className }: AnimatedCharactersProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"],
  });

  const characters = text.split("");
  const totalChars = characters.length;

  return (
    <p ref={containerRef} className={`flex flex-wrap ${className}`}>
      {characters.map((char, i) => {
        const charProgress = i / totalChars;
        const start = Math.max(0, charProgress - 0.1);
        const end = Math.min(1, charProgress + 0.05);
        
        // This creates a progressive reveal effect for each letter
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);

        return (
          <motion.span
            key={i}
            style={{ opacity }}
            className="inline-block whitespace-pre"
          >
            {char}
          </motion.span>
        );
      })}
    </p>
  );
}
