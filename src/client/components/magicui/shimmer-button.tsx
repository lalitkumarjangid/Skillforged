import React from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function ShimmerButton({
  children,
  className,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 font-semibold text-sm sm:text-base text-black bg-white rounded-lg overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-white/30 hover:scale-105",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
