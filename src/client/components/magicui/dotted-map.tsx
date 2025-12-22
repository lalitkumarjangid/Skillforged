import React from "react";
import { cn } from "@/lib/utils";

interface DottedMapProps {
  className?: string;
  dotClassName?: string;
  dotSize?: number;
}

const COUNTRIES = [
  { name: "India", x: 65, y: 40 },
  { name: "USA", x: 20, y: 35 },
  { name: "UK", x: 48, y: 25 },
  { name: "Australia", x: 75, y: 70 },
  { name: "Canada", x: 15, y: 20 },
  { name: "Germany", x: 52, y: 22 },
  { name: "Japan", x: 82, y: 38 },
  { name: "Brazil", x: 35, y: 55 },
];

export function DottedMap({
  className,
  dotClassName = "fill-white/30",
  dotSize = 6,
}: DottedMapProps) {
  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* World Map Background */}
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-full"
        style={{
          filter: "drop-shadow(0 0 20px rgba(255,255,255,0.1))",
        }}
      >
        {/* Simplified world map outlines */}
        <g stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none">
          {/* USA */}
          <path d="M 100 150 L 200 140 L 210 200 L 150 220 Z" />
          {/* Europe */}
          <path d="M 450 100 L 550 110 L 560 160 L 480 170 Z" />
          {/* India */}
          <path d="M 600 200 L 650 210 L 645 280 L 595 270 Z" />
          {/* Australia */}
          <path d="M 750 400 L 800 410 L 810 480 L 760 480 Z" />
          {/* Brazil */}
          <path d="M 320 300 L 380 310 L 375 400 L 310 390 Z" />
          {/* Japan */}
          <path d="M 800 180 L 830 190 L 825 250 L 795 240 Z" />
        </g>

        {/* Connection lines between countries */}
        <g stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5">
          <line x1={COUNTRIES[0].x * 10} y1={COUNTRIES[0].y * 10} x2={COUNTRIES[1].x * 10} y2={COUNTRIES[1].y * 10} />
          <line x1={COUNTRIES[1].x * 10} y1={COUNTRIES[1].y * 10} x2={COUNTRIES[2].x * 10} y2={COUNTRIES[2].y * 10} />
          <line x1={COUNTRIES[2].x * 10} y1={COUNTRIES[2].y * 10} x2={COUNTRIES[5].x * 10} y2={COUNTRIES[5].y * 10} />
          <line x1={COUNTRIES[0].x * 10} y1={COUNTRIES[0].y * 10} x2={COUNTRIES[4].x * 10} y2={COUNTRIES[4].y * 10} />
        </g>

        {/* Dots for countries */}
        {COUNTRIES.map((country, idx) => (
          <circle
            key={idx}
            cx={country.x * 10}
            cy={country.y * 10}
            r={dotSize}
            className={dotClassName}
            style={{
              animation: `pulse ${2 + idx * 0.2}s ease-in-out infinite`,
            }}
          />
        ))}
      </svg>

      {/* Labels */}
      <div className="absolute inset-0 pointer-events-none">
        {COUNTRIES.map((country, idx) => (
          <div
            key={idx}
            className="absolute text-xs font-medium text-white/60 pointer-events-auto"
            style={{
              left: `${country.x}%`,
              top: `${country.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {country.name}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
