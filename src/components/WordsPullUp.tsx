import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
}

export function WordsPullUp({ text, className, showAsterisk }: WordsPullUpProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10%" });
  const words = text.split(" ");

  return (
    <div ref={containerRef} className={className}>
      <div className="overflow-hidden flex flex-wrap">
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ y: "100%" }}
            animate={isInView ? { y: 0 } : { y: "100%" }}
            transition={{
              duration: 1,
              delay: i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block relative mr-[0.2em] last:mr-0"
          >
            {word}
            {showAsterisk && i === words.length - 1 && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">
                *
              </span>
            )}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

interface TextSegment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: TextSegment[];
  className?: string;
}

export function WordsPullUpMultiStyle({ segments, className }: WordsPullUpMultiStyleProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10%" });

  // Flatten all words with their respective styles
  const allWordsWithStyles = segments.flatMap((segment) =>
    segment.text.split(" ").map((word) => ({
      word,
      className: segment.className,
    }))
  );

  return (
    <div
      ref={containerRef}
      className={`inline-flex flex-wrap justify-center overflow-hidden ${className}`}
    >
      {allWordsWithStyles.map((item, i) => (
        <div key={i} className="overflow-hidden mr-[0.2em] last:mr-0">
          <motion.span
            initial={{ y: "100%" }}
            animate={isInView ? { y: 0 } : { y: "100%" }}
            transition={{
              duration: 1,
              delay: i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`inline-block whitespace-pre ${item.className || ""}`}
          >
            {item.word}
          </motion.span>
        </div>
      ))}
    </div>
  );
}
