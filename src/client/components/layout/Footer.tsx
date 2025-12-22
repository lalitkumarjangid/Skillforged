"use client";

import { Github, Linkedin, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-32 bg-gradient-to-b from-black via-black to-zinc-900 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-16 mb-16">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">SkillForged</h3>
            <p className="text-zinc-400 text-base leading-relaxed">
              AI-powered learning roadmaps tailored to your goals and skill level. Master any skill with personalized, structured curriculums.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="/dashboard" className="text-zinc-400 hover:text-white text-base transition-colors duration-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/dashboard/projects" className="text-zinc-400 hover:text-white text-base transition-colors duration-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  Projects
                </a>
              </li>
              <li>
                <a href="/auth/signin" className="text-zinc-400 hover:text-white text-base transition-colors duration-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  Sign In
                </a>
              </li>
            </ul>
          </div>

          {/* Developer Info - Enhanced */}
          <div className="space-y-6 bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Created By</h4>
              <p className="text-white text-lg font-bold">Lalit Kumar Jangid</p>
              <p className="text-zinc-400 text-base mt-2">Full Stack Developer | AI Enthusiast</p>
            </div>
            <a
              href="https://cresca.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-lg text-base font-semibold hover:bg-zinc-200 transition-colors duration-200 w-full justify-center"
            >
              Visit Portfolio
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800 py-12">
          {/* Social Links - Large */}
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
            <a
              href="https://github.com/lalitkumarjangid"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-all duration-200 hover:border-zinc-700 group"
            >
              <Github className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-base font-semibold">GitHub Profile</span>
            </a>

            <a
              href="https://linkedin.com/in/lalitkumarjangid"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-all duration-200 hover:border-zinc-700 group"
            >
              <Linkedin className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-base font-semibold">LinkedIn Profile</span>
            </a>

            <a
              href="https://cresca.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black transition-all duration-200 group"
            >
              <ExternalLink className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-base font-semibold">Portfolio</span>
            </a>
          </div>

          {/* Copyright Section */}
          <div className="text-center space-y-4 pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} SkillForged. Built with Next.js, TypeScript, and AI.
            </p>
            <p className="text-base text-zinc-400">
              Made with ❤️ by{" "}
              <a
                href="https://linkedin.com/in/lalitkumarjangid"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-bold hover:text-zinc-300 transition-colors"
              >
                Lalit Kumar Jangid
              </a>
            </p>
            <p className="text-xs text-zinc-600 pt-4">
              Best Work: <a href="https://cresca.xyz" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">cresca.xyz</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
