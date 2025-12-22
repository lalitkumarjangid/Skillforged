"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface DitherShaderProps {
  className?: string;
  children?: React.ReactNode;
  intensity?: number;
}

export function DitherShader({
  className,
  children,
  intensity = 0.5,
}: DitherShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawDither();
    };

    const drawDither = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255 * intensity;
        data[i] = noise; // Red
        data[i + 1] = noise; // Green
        data[i + 2] = noise; // Blue
        data[i + 3] = Math.random() > 0.5 ? 10 : 0; // Alpha (dither effect)
      }

      ctx.putImageData(imageData, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [intensity]);

  return (
    <div className={cn("relative w-full h-full", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20 mix-blend-overlay"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
