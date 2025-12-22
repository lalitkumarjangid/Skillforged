"use client";

import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader
} from "@client/components/ui/card";
import { Progress } from "@client/components/ui/progress";
import { Badge } from "@client/components/ui/badge";
import { Button } from "@client/components/ui/button";
import { ArrowUpRight, Clock, Trash2, GitBranch, Calendar } from "lucide-react";
import Link from "next/link";
import { IRoadmap } from "@server/models/Roadmap";
import { formatDistanceToNow } from "date-fns"; // Standard date formatting if available, or custom

interface RoadmapCardProps {
    roadmap: IRoadmap;
    onDelete?: (id: string) => void;
}

const skillLevelColors = {
    beginner: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    intermediate: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
    advanced: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800",
};

export function RoadmapCard({
    roadmap,
    onDelete,
}: RoadmapCardProps) {
    const { _id, title, description, progress, totalHours, currentSkillLevel, updatedAt } = roadmap;
    const id = _id.toString();

    // Mock date if updatedAt is missing or format it
    const lastUpdated = updatedAt ? new Date(updatedAt).toLocaleDateString() : "Just now";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="group relative flex flex-col h-[280px] bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden">
                {/* Clickable Overlay */}
                <Link href={`/roadmap/${id}`} className="absolute inset-0 z-0" prefetch={false}>
                    <span className="sr-only">View Roadmap</span>
                </Link>

                <CardHeader className="p-5 pb-2 space-y-4 relative z-10 pointer-events-none">
                    <div className="flex items-start justify-between pointer-events-auto">
                        <div className="flex gap-2">
                            <div className="h-8 w-8 rounded-full border border-zinc-800 bg-black flex items-center justify-center">
                                <GitBranch className="h-4 w-4 text-zinc-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base leading-none tracking-tight text-white group-hover:text-white transition-colors line-clamp-1">
                                    {title}
                                </h3>
                                <div className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                                    <span>{currentSkillLevel}</span>
                                    <span className="text-zinc-600">•</span>
                                    <span>{totalHours}h</span>
                                </div>
                            </div>
                        </div>

                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 -mr-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity relative z-20"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation(); // Stop click from hitting the Link
                                    onDelete(id);
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-5 pt-2 flex-grow relative z-10 pointer-events-none">
                    <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
                        {description}
                    </p>
                </CardContent>

                <div className="mt-auto p-5 pt-0 relative z-10 pointer-events-none">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {progress === 100 ? "Completed" : `${progress}% complete`}
                            </span>
                            <span>Updated {lastUpdated}</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                    </div>
                </div>

                <CardFooter className="p-0 border-t bg-zinc-50/50 dark:bg-zinc-900/50 relative z-10 pointer-events-none">
                    <div className="w-full flex items-center justify-between p-4 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors pointer-events-auto">
                        <span>View Roadmap</span>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
