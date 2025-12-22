"use client";

import Link from "next/link";
import { Button } from "@client/components/ui/button";
import { Badge } from "@client/components/ui/badge";
import { ShimmerButton } from "@client/components/magicui/shimmer-button";
import { StripedPattern } from "@client/components/magicui/striped-pattern";
import { ResizableNavbar } from "@client/components/aceternity/resizable-navbar";
import { DitherShader } from "@client/components/aceternity/dither-shader";
import {
  Sparkles,
  BookOpen,
  Target,
  Brain,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Generated Curriculum",
    description:
      "Get a structured week-by-week learning plan created specifically for your goals and skill level.",
  },
  {
    icon: Target,
    title: "Goal-Oriented Learning",
    description:
      "Define your end goal and we'll map out the exact path to get you there efficiently.",
  },
  {
    icon: Clock,
    title: "Fits Your Schedule",
    description:
      "Tell us how many hours you can dedicate weekly, and we'll create a realistic timeline.",
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description:
      "Check off completed modules and see your progress visualized in real-time dashboards.",
  },
  {
    icon: Zap,
    title: "AI Explanations",
    description:
      "Stuck on a topic? Get instant, personalized explanations from our AI tutor.",
  },
  {
    icon: BookOpen,
    title: "Curated Resources",
    description:
      "Each topic comes with hand-picked articles, videos, exercises, and projects.",
  },
];

const userTypes = [
  {
    title: "Career Switchers",
    description: "Transition into new fields with structured, proven learning paths.",
  },
  {
    title: "Self-Learners",
    description: "Get organized guidance without the cost of traditional courses.",
  },
  {
    title: "Professionals Upskilling",
    description: "Stay current with the latest technologies and industry trends.",
  },
  {
    title: "Students",
    description: "Prepare for interviews and build practical skills beyond coursework.",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Career Switcher to Tech",
    quote:
      "SkillForged gave me a clear path to learn React in 3 months. The AI explanations were better than any tutorial.",
    initials: "SC",
  },
  {
    name: "Michael Patel",
    role: "Founder, TechStartup",
    quote:
      "We use SkillForged to onboard our team. It's like having a personal mentor for every team member.",
    initials: "MP",
  },
  {
    name: "Emma Rodriguez",
    role: "Software Engineer",
    quote:
      "Finally, a tool that adapts to my pace and learning style. Worth every minute I invested.",
    initials: "ER",
  },
];

const stats = [
  { value: "10,000+", label: "Roadmaps Created" },
  { value: "50+", label: "Countries" },
  { value: "4.9★", label: "User Rating" },
  { value: "95%", label: "Completion Rate" },
];

export default function HomePage() {
  return (
    <DitherShader intensity={0.3}>
      <div className="min-h-screen bg-black text-white">
        {/* Navigation */}
        <ResizableNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <StripedPattern className="stroke-white/10 [stroke-dasharray:12,8]" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-transparent to-transparent" />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            <Badge variant="outline" className="px-4 py-2 text-sm border-blue-600/50 bg-blue-950/30 mx-auto">
              <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
              AI-Powered Learning Roadmaps
            </Badge>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Master Any Skill with
              </h1>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-white to-blue-300 bg-clip-text text-transparent">
                Personalized AI Roadmaps
              </h2>
            </div>

            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
              Tell us what you want to learn, and our AI will create a structured, week-by-week curriculum 
              tailored to your goals and schedule. No spreadsheets. No generic courses. Just your perfect learning path.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/dashboard">
                <ShimmerButton>
                  <Sparkles className="w-4 h-4" />
                  Create Your First Roadmap
                </ShimmerButton>
              </Link>
              <Button 
                variant="outline" 
                className="border-blue-600/50 text-white hover:bg-blue-950/30 gap-2"
              >
                Watch Demo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-500 pt-4">
              No credit card required · Start in under 2 minutes
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-20 max-w-4xl mx-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 px-4 bg-gradient-to-b from-black to-blue-950/10 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Core Capabilities
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything your learning journey needs — in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-32 px-4 bg-black border-t border-white/10 relative overflow-hidden">
        <div className="absolute inset-0">
          <StripedPattern className="stroke-blue-500/10 [stroke-dasharray:15,10]" />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How SkillForged Works
            </h2>
            <p className="text-lg text-gray-400">
              From goal to mastery in three simple steps
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                num: "01",
                title: "Tell Us Your Goal",
                description: "Enter what you want to learn, your current skill level, and how many hours you can dedicate each week. Our AI analyzes this to understand your unique context.",
              },
              {
                num: "02",
                title: "AI Creates Your Roadmap",
                description: "We generate a personalized, week-by-week curriculum with learning outcomes, real-world resources, and estimated time for each topic.",
              },
              {
                num: "03",
                title: "Learn & Track Progress",
                description: "Follow your roadmap, check off completed topics, and get AI-powered explanations whenever you get stuck. Your progress syncs across all devices.",
              },
            ].map((step, idx) => (
              <div key={idx} className="flex gap-6 md:gap-8 p-6 md:p-8 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all">
                <div className="flex-shrink-0 text-3xl font-bold text-blue-400">{step.num}</div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/dashboard">
              <ShimmerButton>
                Start Learning Now
                <ArrowRight className="w-4 h-4" />
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Built For Section */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-black to-blue-950/10 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for Modern Learners
            </h2>
            <p className="text-lg text-gray-400">
              Whether you're switching careers or leveling up, SkillForged adapts to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userTypes.map((type, idx) => (
              <div key={idx} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">{type.title}</h3>
                <p className="text-sm text-gray-400">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-32 px-4 bg-black border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by Learners Worldwide
            </h2>
            <p className="text-lg text-gray-400">
              Join thousands transforming their learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center text-sm font-bold">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-400">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-black to-blue-950/10 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Switch to SkillForged?
            </h2>
            <p className="text-lg text-gray-400">
              Stop wasting time on unstructured learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[
                "AI-personalized learning paths",
                "Real resources, not generic courses",
                "Track progress with beautiful dashboards",
                "Get unstuck with AI explanations",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="p-8 rounded-xl bg-white/5 border border-white/10">
              <div className="space-y-6">
                <div>
                  <div className="text-3xl font-bold text-white">70%</div>
                  <p className="text-gray-400 text-sm mt-1">Less time wasted on unstructured learning</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">3×</div>
                  <p className="text-gray-400 text-sm mt-1">Faster skill acquisition</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">95%</div>
                  <p className="text-gray-400 text-sm mt-1">Complete their roadmaps</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 px-4 bg-black border-t border-white/10 relative overflow-hidden">
        <div className="absolute inset-0">
          <StripedPattern className="stroke-blue-500/20 [stroke-dasharray:20,12]" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/30 to-transparent" />
        </div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ready to Master Your Next Skill?
          </h2>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Create your personalized AI-powered learning roadmap in seconds. 
            It's free, easy, and powerful.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <ShimmerButton>
                Create Free Roadmap
                <Sparkles className="w-4 h-4" />
              </ShimmerButton>
            </Link>
            <Button variant="outline" className="border-blue-600/50 text-white hover:bg-blue-950/30">
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>
      </div>
    </DitherShader>
  );
}
