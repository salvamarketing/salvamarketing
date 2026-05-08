"use client";

import React, { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface StarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  lightWidth?: number;
  duration?: number;
  lightColor?: string;
  backgroundColor?: string;
  borderWidth?: number;
  className?: string;
}

export function StarButton({
  children,
  lightWidth = 110,
  duration = 3,
  lightColor = "#FAFAFA",
  backgroundColor = "transparent",
  borderWidth = 2,
  className,
  ...props
}: StarButtonProps) {
  return (
    <button
      style={
        {
          "--duration": duration,
          "--light-width": `${lightWidth}px`,
          "--light-color": lightColor,
          "--border-width": `${borderWidth}px`,
          isolation: "isolate",
        } as CSSProperties
      }
      className={cn(
        "relative z-[3] overflow-hidden px-10 py-5 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-medium tracking-widest uppercase transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 group/star-button active:scale-[0.98]",
        "bg-black/40 backdrop-blur-xl border-0",
        "shadow-[0_0_25px_rgba(249,115,22,0.4)] hover:shadow-[0_0_40px_rgba(249,115,22,0.7)] hover:bg-black/60",
        className,
      )}
      {...props}
    >
      {/* Glossy Reflection Overlay - more subtle */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-[2]" />
      
      {/* Hover Shimmer Sweep */}
      <div className="absolute inset-0 translate-x-[-100%] group-hover/star-button:animate-shimmer pointer-events-none z-[5] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      
      <div
        className="absolute inset-0 z-[4] overflow-hidden rounded-[inherit] border-white/10"
        style={{ borderWidth: "var(--border-width)" }}
        aria-hidden="true"
      />
      
      <span className="z-10 relative bg-white flex items-center justify-center w-full h-full text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover/star-button:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all font-[inherit]">
        {children}
      </span>
    </button>
  );
}
