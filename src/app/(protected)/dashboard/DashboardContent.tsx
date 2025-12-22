"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@client/components/ui/button";
import { RoadmapCard, RoadmapGeneratorModal } from "@client/components/feature";
import { ProgressChart } from "@client/components/feature/ProgressChart";
import { deleteRoadmap } from "@server/actions/db-actions";
import { IRoadmap } from "@server/models/Roadmap";
import { toast } from "sonner";
import type { User } from "next-auth";

interface DashboardContentProps {
    initialRoadmaps: IRoadmap[];
    user: User;
}

export default function DashboardContent({ initialRoadmaps, user }: DashboardContentProps) {
    const [roadmaps, setRoadmaps] = useState<IRoadmap[]>(initialRoadmaps);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleDelete = async (id: string) => {
        // Optimistic update
        const originalRoadmaps = [...roadmaps];
        setRoadmaps((prev) => prev.filter((r) => r._id?.toString() !== id));

        const result = await deleteRoadmap(id);

        if (result.success) {
            toast.success("Roadmap deleted successfully");
        } else {
            // Revert on error
            setRoadmaps(originalRoadmaps);
            toast.error(result.error || "Failed to delete roadmap");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white">
                        My Learning Paths
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">
                        Manage and track your AI-generated curriculums
                    </p>
                </div>

                <div className="flex items-center gap-4 max-h-16 overflow-hidden">
                    <Button 
                        size="lg" 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-white text-black hover:bg-gray-200 shadow-lg transition-all duration-300"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        New Roadmap
                    </Button>

                    <RoadmapGeneratorModal 
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={(id) => {
                            setShowCreateModal(false);
                            toast.success("Roadmap created successfully!");
                            window.location.reload();
                        }}
                    />
                </div>
            </header>

            {roadmaps.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800"
                >
                    <div className="w-16 h-16 bg-zinc-800 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                        <Plus className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">No roadmaps yet</h3>
                    <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                        Create your first AI-generated learning roadmap to start mastering new skills.
                    </p>
                    <Button
                        size="lg"
                        onClick={() => setShowCreateModal(true)}
                        className="bg-white text-black hover:bg-zinc-200 shadow-lg"
                    >
                        Create Roadmap
                    </Button>
                </motion.div>
            ) : (
                <div className="space-y-8">
                    {/* Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="lg:col-span-2">
                            <ProgressChart roadmaps={roadmaps} />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-white">Your Projects</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    </div>
                </div>
            )}
        </div>
    );
}
