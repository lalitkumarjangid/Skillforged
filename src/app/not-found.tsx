"use client";

import Link from "next/link";
import { Button } from "@client/components/ui/button";
import { ShimmerButton } from "@client/components/magicui/shimmer-button";
import { StripedPattern } from "@client/components/magicui/striped-pattern";
import { ResizableNavbar } from "@client/components/aceternity/resizable-navbar";
import { DitherShader } from "@client/components/aceternity/dither-shader";
import { ArrowLeft, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <DitherShader intensity={0.3}>
      <div className="min-h-screen bg-black text-white">
        {/* Navigation */}
        <ResizableNavbar />

        {/* 404 Content */}
        <section className="h-[calc(100vh-64px)] flex items-center justify-center px-4 relative overflow-hidden">
          <div className="absolute inset-0">
            <StripedPattern className="stroke-white/10 [stroke-dasharray:12,8]" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-transparent to-transparent" />
          </div>

          <div className="container mx-auto max-w-2xl text-center relative z-10">
            <div className="space-y-8">
              {/* Error Code */}
              <div className="space-y-4">
                <div className="text-9xl md:text-[150px] font-bold bg-gradient-to-r from-blue-400 via-white to-blue-300 bg-clip-text text-transparent">
                  404
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">Page Not Found</h1>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <p className="text-lg md:text-xl text-gray-400">
                  Oops! It looks like the page you're searching for doesn't exist or has been moved.
                </p>
                <p className="text-gray-500">
                  But don't worry, you can always go back to your learning journey with us.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                <Link href="/dashboard">
                  <ShimmerButton>
                    <Home className="w-4 h-4" />
                    Go to Dashboard
                  </ShimmerButton>
                </Link>
                <Link href="/">
                  <Button 
                    variant="outline" 
                    className="border-blue-600/50 text-white hover:bg-blue-950/30 gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                  </Button>
                </Link>
              </div>

              {/* Alternative Links */}
              <div className="pt-12 border-t border-white/10 mt-12">
                <p className="text-sm text-gray-400 mb-6">Or explore these popular destinations:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Home", href: "/" },
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Explore Roadmaps", href: "/dashboard/explore" },
                    { label: "My Projects", href: "/dashboard/projects" },
                    { label: "Learning History", href: "/dashboard/history" },
                    { label: "Settings", href: "/dashboard/settings" },
                  ].map((link, idx) => (
                    <Link
                      key={idx}
                      href={link.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DitherShader>
  );
}
