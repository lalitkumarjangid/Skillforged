"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@client/components/ui/button";
import { ShimmerButton } from "@client/components/magicui/shimmer-button";

export function ResizableNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="hidden sm:inline font-bold text-lg text-white">SkillForged</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#testimonials" className="text-sm text-gray-400 hover:text-white transition-colors">
              Testimonials
            </a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </a>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="hidden sm:block">
              <Button variant="ghost" className="text-white hover:bg-white/10 text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <ShimmerButton>Get Started</ShimmerButton>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-white/10 pt-4">
            <a
              href="#features"
              className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Testimonials
            </a>
            <a
              href="#pricing"
              className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </a>
            <div className="flex gap-2 pt-2">
              <Link href="/auth/signin" className="flex-1">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 text-sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
