"use client";

import { useRouter } from "next/navigation";
import { ModuleCard } from "@client/components/feature";
import { IModule } from "@server/models/Roadmap";

interface RoadmapDetailContentProps {
    roadmapId: string;
    modules: IModule[];
    skillLevel: "beginner" | "intermediate" | "advanced";
}

export function RoadmapDetailContent({
    roadmapId,
    modules,
    skillLevel,
}: RoadmapDetailContentProps) {
    const router = useRouter();

    const handleProgressUpdate = () => {
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-mono text-zinc-400">
                        {modules.length} WEEKS
                    </span>
                    Curriculum
                </h2>
            </div>
            <div className="space-y-4">
                {modules.map((module) => (
                    <ModuleCard
                        key={module.id}
                        roadmapId={roadmapId}
                        moduleId={module.id}
                        week={module.week}
                        title={module.title}
                        description={module.description}
                        topics={module.topics}
                        status={module.status}
                        skillLevel={skillLevel}
                        onProgressUpdate={handleProgressUpdate}
                    />
                ))}
            </div>
        </div>
    );
}
