import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@client/components/ui/button";
import { Badge } from "@client/components/ui/badge";
import { Progress } from "@client/components/ui/progress";
import { Separator } from "@client/components/ui/separator";
import {
    Sparkles,
    ArrowLeft,
    Clock,
    BookOpen,
    Target,
    Trophy,
    Loader2,
} from "lucide-react";
import { getRoadmapById } from "@server/actions/db-actions";
import { RoadmapDetailContent } from "./RoadmapDetailContent";

export const dynamic = "force-dynamic";

interface RoadmapPageProps {
    params: Promise<{ id: string }>;
}

export default async function RoadmapPage({ params }: RoadmapPageProps) {
    const { id } = await params;

    return (
        <div className="min-h-screen bg-black">
            {/* Navbar */}


            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    }
                >
                    <RoadmapDetailWrapper id={id} />
                </Suspense>
            </div>
        </div>
    );
}

async function RoadmapDetailWrapper({ id }: { id: string }) {
    const result = await getRoadmapById(id);

    if (!result.success || !result.roadmap) {
        notFound();
    }

    const roadmap = result.roadmap;

    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Badge
                        variant="outline"
                        className={
                            roadmap.currentSkillLevel === "beginner"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : roadmap.currentSkillLevel === "intermediate"
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        }
                    >
                        {roadmap.currentSkillLevel}
                    </Badge>
                    {roadmap.progress === 100 && (
                        <Badge className="bg-emerald-500 text-white">
                            <Trophy className="w-3 h-3 mr-1" />
                            Completed
                        </Badge>
                    )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">{roadmap.title}</h1>
                <p className="text-lg text-zinc-400 mb-6">
                    {roadmap.description}
                </p>

                {/* Stats Bar */}
                <div className="flex flex-wrap items-center gap-6 text-zinc-400 mb-6">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <span>{roadmap.totalWeeks} weeks</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        <span>{roadmap.totalHours} hours total</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        <span>{roadmap.weeklyHours}h/week</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-white">Overall Progress</span>
                        <span className="text-2xl font-bold text-white">
                            {roadmap.progress}%
                        </span>
                    </div>
                    <Progress value={roadmap.progress} className="h-3 bg-zinc-800" />
                </div>
            </div>

            {/* Learning Outcomes */}
            {roadmap.learningOutcomes && roadmap.learningOutcomes.length > 0 && (
                <div className="mb-8 p-6 rounded-xl bg-zinc-900/30 border border-zinc-800">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                        <Target className="h-5 w-5 text-white" />
                        What You&apos;ll Learn
                    </h2>
                    <ul className="grid sm:grid-cols-2 gap-3">
                        {roadmap.learningOutcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-zinc-400">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                                {outcome}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <Separator className="mb-8 bg-zinc-800" />

            {/* Modules */}
            <RoadmapDetailContent
                roadmapId={id}
                modules={roadmap.modules}
                skillLevel={roadmap.currentSkillLevel}
            />
        </>
    );
}
