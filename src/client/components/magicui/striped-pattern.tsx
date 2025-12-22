import React from "react";
import { cn } from "@/lib/utils";

interface StripedPatternProps {
  className?: string;
  width?: number;
  height?: number;
  strokeDasharray?: string;
}

export function StripedPattern({
  className,
  width = 100,
  height = 100,
  strokeDasharray = "8,4",
}: StripedPatternProps) {
  return (
    <svg
      className={cn("absolute inset-0 h-full w-full", className)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="stripes" x="0" y="0" width={width} height={height} patternUnits="userSpaceOnUse">
          <line
            x1="0"
            y1="0"
            x2={width}
            y2={height}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray={strokeDasharray}
            opacity="0.1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#stripes)" />
    </svg>
  );
}
