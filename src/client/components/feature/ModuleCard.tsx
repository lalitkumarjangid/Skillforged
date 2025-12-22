"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@client/components/ui/card";
import { Button } from "@client/components/ui/button";
import { Badge } from "@client/components/ui/badge";
import { Progress } from "@client/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@client/components/ui/dialog";
import { ScrollArea } from "@client/components/ui/scroll-area";
import { Separator } from "@client/components/ui/separator";
import {
    Check,
    Circle,
    Clock,
    HelpCircle,
    Loader2,
    BookOpen,
    Video,
    Code,
    FileText,
    Folder,
    ChevronDown,
    ExternalLink,
    Maximize2
} from "lucide-react";
import { explainTopic } from "@server/actions/ai-actions";
import { updateTopicCompletion } from "@server/actions/db-actions";

interface Resource {
    title: string;
    url?: string;
    type: "article" | "video" | "exercise" | "project" | "documentation";
    duration?: string;
}

interface Topic {
    id: string;
    title: string;
    description: string;
    resources: Resource[];
    estimatedHours: number;
    isCompleted: boolean;
}

interface ModuleCardProps {
    roadmapId: string;
    moduleId: string;
    week: number;
    title: string;
    description: string;
    topics: Topic[];
    status: "not_started" | "in_progress" | "completed";
    skillLevel: "beginner" | "intermediate" | "advanced";
    onProgressUpdate?: () => void;
}

const resourceIcons = {
    article: FileText,
    video: Video,
    exercise: Code,
    project: Folder,
    documentation: BookOpen,
};

const statusColors = {
    not_started: "bg-zinc-800 text-zinc-400 border-zinc-700",
    in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
};

export function ModuleCard({
    roadmapId,
    moduleId,
    week,
    title,
    description,
    topics,
    status,
    skillLevel,
    onProgressUpdate,
}: ModuleCardProps) {
    const [isExpanded, setIsExpanded] = useState(status === "in_progress");
    const [loadingTopic, setLoadingTopic] = useState<string | null>(null);

    // Explanation Dialog
    const [explainDialog, setExplainDialog] = useState<{
        open: boolean;
        topic: string;
        explanation: string;
        loading: boolean;
    }>({ open: false, topic: "", explanation: "", loading: false });

    // Resource Preview Dialog
    const [previewDialog, setPreviewDialog] = useState<{
        open: boolean;
        resource: Resource | null;
    }>({ open: false, resource: null });

    const completedTopics = topics.filter((t) => t.isCompleted).length;
    const progress = (completedTopics / topics.length) * 100;

    const handleTopicComplete = async (topicId: string, isCompleted: boolean) => {
        setLoadingTopic(topicId);
        try {
            await updateTopicCompletion(roadmapId, moduleId, topicId, isCompleted);
            onProgressUpdate?.();
        } catch (error) {
            console.error("Failed to update topic:", error);
        } finally {
            setLoadingTopic(null);
        }
    };

    const handleExplain = async (topic: Topic) => {
        setExplainDialog({
            open: true,
            topic: topic.title,
            explanation: "",
            loading: true,
        });

        try {
            const result = await explainTopic(
                topic.title,
                `Learning ${title} as part of a ${skillLevel} curriculum`,
                skillLevel
            );

            if (result.success && result.explanation) {
                setExplainDialog((prev) => ({
                    ...prev,
                    explanation: result.explanation || "",
                    loading: false,
                }));
            } else {
                setExplainDialog((prev) => ({
                    ...prev,
                    explanation: result.error || "Failed to get explanation",
                    loading: false,
                }));
            }
        } catch (error) {
            setExplainDialog((prev) => ({
                ...prev,
                explanation: "An error occurred",
                loading: false,
            }));
        }
    };

    const handleResourceClick = (resource: Resource) => {
        if (!resource.url) return;
        
        // If it's a video, try to preview it
        if (resource.type === 'video' && (resource.url.includes('youtube.com') || resource.url.includes('youtu.be'))) {
            setPreviewDialog({ open: true, resource });
        } else {
            // For articles and other content that might block embedding (dev.to, medium, etc),
            // open in a new tab directly to avoid "refused to connect" errors.
            window.open(resource.url, '_blank');
        }
    };

    const getEmbedUrl = (url: string) => {
        // Simple YouTube Embed transform
        const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (ytMatch && ytMatch[1]) {
            return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
        }
        return url;
    };

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="overflow-hidden border-zinc-800 bg-[#09090b] hover:border-zinc-700 transition-colors">
                    <CardHeader
                        className="cursor-pointer select-none"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold text-lg shadow-inner shadow-white/5">
                                    W{week}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-lg text-white">{title}</h3>
                                        <Badge variant="outline" className={statusColors[status]}>
                                            {status.replace("_", " ")}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-zinc-400 line-clamp-1">
                                        {description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-500">
                                    <span>{completedTopics}/{topics.length} topics</span>
                                    <div className="w-24">
                                        <Progress value={progress} className="h-2 bg-zinc-800" />
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown className="h-5 w-5 text-zinc-500" />
                                </motion.div>
                            </div>
                        </div>
                    </CardHeader>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CardContent className="pt-0">
                                    <Separator className="mb-4 bg-zinc-800" />
                                    <div className="space-y-4">
                                        {topics.map((topic, index) => (
                                            <motion.div
                                                key={topic.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className={`p-4 rounded-lg border transition-all ${topic.isCompleted
                                                    ? "bg-emerald-950/10 border-emerald-900/30"
                                                    : "bg-black/40 border-zinc-800 hover:border-zinc-700"
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <button
                                                        onClick={() =>
                                                            handleTopicComplete(topic.id, !topic.isCompleted)
                                                        }
                                                        disabled={loadingTopic === topic.id}
                                                        className="mt-0.5 flex-shrink-0"
                                                    >
                                                        {loadingTopic === topic.id ? (
                                                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                                                        ) : topic.isCompleted ? (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center"
                                                            >
                                                                <Check className="h-3 w-3 text-white" />
                                                            </motion.div>
                                                        ) : (
                                                            <Circle className="h-5 w-5 text-zinc-600 hover:text-white transition-colors" />
                                                        )}
                                                    </button>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <h4
                                                                className={`font-medium ${topic.isCompleted
                                                                    ? "line-through text-zinc-500"
                                                                    : "text-zinc-200"
                                                                    }`}
                                                            >
                                                                {topic.title}
                                                            </h4>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {topic.estimatedHours}h
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 px-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
                                                                    onClick={() => handleExplain(topic)}
                                                                >
                                                                    <HelpCircle className="h-3 w-3 mr-1" />
                                                                    Explain
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-zinc-400 mb-3">
                                                            {topic.description}
                                                        </p>

                                                        {/* Resources */}
                                                        <div className="flex flex-wrap gap-2">
                                                            {topic.resources.map((resource, rIndex) => {
                                                                const Icon = resourceIcons[resource.type];
                                                                return (
                                                                    <Badge
                                                                        key={rIndex}
                                                                        variant={resource.url ? "default" : "secondary"}
                                                                        className={`text-xs transition-colors flex items-center group border border-zinc-800 ${resource.url
                                                                            ? "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
                                                                            : "bg-zinc-900/50 text-zinc-600 cursor-default"
                                                                            }`}
                                                                        onClick={() => handleResourceClick(resource)}
                                                                    >
                                                                        <Icon className="h-3 w-3 mr-1.5" />
                                                                        {resource.title}
                                                                        {resource.duration && (
                                                                            <span className="ml-1.5 opacity-70 border-l pl-1.5 border-zinc-700">
                                                                                {resource.duration}
                                                                            </span>
                                                                        )}
                                                                        {resource.url && (
                                                                            <Maximize2 className="ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                        )}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>

            {/* Explain Dialog */}
            <Dialog
                open={explainDialog.open}
                onOpenChange={(open) =>
                    setExplainDialog((prev) => ({ ...prev, open }))
                }
            >
                <DialogContent className="max-w-2xl max-h-[80vh] bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <HelpCircle className="h-5 w-5 text-white" />
                            {explainDialog.topic}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            AI-powered explanation tailored to your skill level
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] pr-4">
                        {explainDialog.loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                            </div>
                        ) : (
                            <div className="prose prose-sm prose-invert max-w-none text-zinc-300">
                                <div className="whitespace-pre-wrap">{explainDialog.explanation}</div>
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Resource Preview Dialog */}
            <Dialog
                open={previewDialog.open}
                onOpenChange={(open) =>
                    setPreviewDialog((prev) => ({ ...prev, open }))
                }
            >
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-zinc-900 border-zinc-800">
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900 z-10">
                        <DialogTitle className="flex items-center gap-2 text-base text-white">
                            {previewDialog.resource?.type === 'video' ? <Video className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                            {previewDialog.resource?.title}
                        </DialogTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 ml-auto mr-8 bg-black border-zinc-800 text-white hover:bg-zinc-800 hover:text-white"
                            onClick={() => window.open(previewDialog.resource?.url, '_blank')}
                        >
                            <ExternalLink className="h-3 w-3" />
                            Open Fullscreen
                        </Button>
                    </div>

                    <div className="flex-1 bg-black relative w-full h-full">
                        {previewDialog.resource?.url && (
                            <div className="relative w-full h-full">
                                <iframe
                                    src={getEmbedUrl(previewDialog.resource.url)}
                                    className="w-full h-full border-0 absolute inset-0 z-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                    onError={() => {
                                        // This often won't fire for X-Frame-Options, so we need a UI overlay guide
                                    }}
                                />
                                {/* Fallback overlay that sits behind iframe but is visible if iframe blocks/fails or is just blank */}
                                <div className="absolute inset-0 z-[-1] flex flex-col items-center justify-center p-8 text-center bg-zinc-900">
                                    <div className="bg-black/80 backdrop-blur rounded-xl p-6 shadow-lg border border-zinc-800 max-w-md">
                                        <h3 className="font-semibold mb-2 text-white">Content Loading...</h3>
                                        <p className="text-sm text-zinc-400 mb-4">
                                            If this content doesn't load or says "refused to connect", it likely blocks embedding.
                                        </p>
                                        <Button 
                                            onClick={() => window.open(previewDialog.resource?.url, '_blank')}
                                            className="bg-white text-black hover:bg-zinc-200"
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Open in New Tab
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
