"use client";

import { useState } from "react";
import { RoadmapCard } from "@client/components/feature/RoadmapCard";
import { deleteRoadmap } from "@server/actions/db-actions";
import { IRoadmap } from "@server/models/Roadmap";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutList } from "lucide-react";

interface ProjectsContentProps {
    initialRoadmaps: IRoadmap[];
}

export function ProjectsContent({ initialRoadmaps }: ProjectsContentProps) {
    const [roadmaps, setRoadmaps] = useState<IRoadmap[]>(initialRoadmaps);

    const handleDelete = async (id: string) => {
        const originalRoadmaps = [...roadmaps];
        setRoadmaps((prev) => prev.filter((r) => r._id?.toString() !== id));

        const result = await deleteRoadmap(id);

        if (result.success) {
            toast.success("Roadmap deleted successfully");
        } else {
            setRoadmaps(originalRoadmaps);
            toast.error(result.error || "Failed to delete roadmap");
        }
    };

    if (roadmaps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg border-dashed border-zinc-800 bg-zinc-900/50">
                <LayoutList className="h-10 w-10 text-zinc-500 mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-white">No projects yet</h3>
                <p className="text-zinc-400 max-w-sm mt-1">
                    Start a new roadmap to see it appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
                {roadmaps.map((roadmap) => (
                    <RoadmapCard
                        key={roadmap._id?.toString()}
                        roadmap={roadmap}
                        onDelete={handleDelete}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
