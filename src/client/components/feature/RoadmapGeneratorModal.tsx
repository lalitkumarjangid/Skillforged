"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@client/components/ui/button";
import { Input } from "@client/components/ui/input";
import { Label } from "@client/components/ui/label";
import { Textarea } from "@client/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@client/components/ui/select";
import { Slider } from "@client/components/ui/slider";
import { CreateRoadmapSchema, CreateRoadmapInput } from "@/lib/types";
import { Sparkles, Clock, Target, GraduationCap, X } from "lucide-react";
import { z } from "zod";
import { startRoadmapGeneration, checkGenerationStatus } from "@server/actions/generation-actions";

type FormData = z.infer<typeof CreateRoadmapSchema>;

interface RoadmapGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (roadmapId: string) => void;
}

export function RoadmapGeneratorModal({ isOpen, onClose, onSuccess }: RoadmapGeneratorModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Initializing...");
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const logEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm<CreateRoadmapInput>({
        resolver: zodResolver(CreateRoadmapSchema),
        defaultValues: {
            title: "",
            currentSkillLevel: "beginner",
            targetGoal: "",
            weeklyHours: 10,
        },
    });

    const weeklyHours = watch("weeklyHours");
    const skillLevel = watch("currentSkillLevel");

    const onSubmit = async (data: CreateRoadmapInput) => {
        setIsLoading(true);
        setError(null);
        setProgress(5);
        setStatusMessage("Connecting to AI Architect...");

        try {
            // 1. Start generation
            const startResult = await startRoadmapGeneration(data);

            if (!startResult.success || !startResult.jobId) {
                throw new Error(startResult.error || "Failed to start generation");
            }

            const jobId = startResult.jobId;

            // 2. Poll for status
            const interval = setInterval(async () => {
                const status = await checkGenerationStatus(jobId);

                if (status) {
                    setProgress(status.progress);
                    setStatusMessage(status.message);
                    if (status.logs) setLogs(status.logs);

                    if (status.status === "completed" && status.roadmapId) {
                        clearInterval(interval);

                        // Small delay to show 100%
                        setTimeout(() => {
                            if (onSuccess) {
                                onSuccess(status.roadmapId!);
                            } else {
                                router.push(`/roadmap/${status.roadmapId}`);
                            }
                            onClose();
                        }, 500);

                    } else if (status.status === "failed") {
                        clearInterval(interval);
                        setError(status.error || "Generation failed");
                        setIsLoading(false);
                    }
                }
            }, 1000);

            // Safety timeout (180s)
            setTimeout(() => {
                clearInterval(interval);
            }, 180000);

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            reset();
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/40 z-40"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-2xl">
                            {/* Clean Modern Container - Dark Vercel Style */}
                            <div className="relative bg-black rounded-2xl shadow-2xl overflow-hidden border border-zinc-800">
                                {/* Content */}
                                <div className="relative p-8 md:p-12">
                                    {/* Close Button */}
                                    <button
                                        onClick={handleClose}
                                        disabled={isLoading}
                                        className="absolute top-6 right-6 p-2 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <X className="w-5 h-5 text-zinc-500 hover:text-white" />
                                    </button>

                                    {isLoading ? (
                                        // Loading State
                                        <div className="space-y-8">
                                            <div className="flex flex-col items-center text-center space-y-4">
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="relative"
                                                >
                                                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                                                        <Sparkles className="h-8 w-8 text-gray-900" />
                                                    </div>
                                                </motion.div>

                                                <div className="space-y-3">
                                                    <motion.h3
                                                        key={statusMessage}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-2xl font-bold text-white"
                                                    >
                                                        {statusMessage}
                                                    </motion.h3>
                                                    <p className="text-zinc-400 text-sm">
                                                        {progress}% complete • Est. 2-3 minutes
                                                    </p>

                                                    {/* Progress Bar */}
                                                    <div className="w-full max-w-xs mx-auto bg-zinc-900 rounded-full h-1.5 overflow-hidden mt-6">
                                                        <motion.div
                                                            className="h-full bg-white"
                                                            initial={{ width: "0%" }}
                                                            animate={{ width: `${progress}%` }}
                                                            transition={{ duration: 0.5 }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Terminal-like Activity Feed */}
                                            <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-6 font-mono text-sm">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                    </div>
                                                    <span className="text-xs font-semibold text-green-400 tracking-widest">
                                                        PROCESSING
                                                    </span>
                                                </div>

                                                <div className="h-48 overflow-y-auto space-y-1.5 text-xs" style={{ scrollbarWidth: 'thin' }}>
                                                    {logs.filter(log => !log.includes("[Removed]") && !log.includes("[WARN]")).map((log, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="flex items-start gap-2 text-zinc-300"
                                                        >
                                                            <span className="text-green-500 flex-shrink-0 font-bold">→</span>
                                                            <span className="text-zinc-400 leading-tight break-words">
                                                                {log.split(']').slice(1).join(']').trim()}
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                    <div ref={logEndRef} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Form State
                                        <div className="space-y-8">
                                            {/* Header */}
                                            <div className="space-y-3">
                                                <div>
                                                    <h2 className="text-4xl font-bold text-white">
                                                        Create Your Roadmap
                                                    </h2>
                                                    <p className="text-zinc-400 text-base mt-3">
                                                        Tell us what you want to learn. Our AI will generate a personalized step-by-step curriculum.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Form */}
                                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                                {/* Title */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.05 }}
                                                    className="space-y-2"
                                                >
                                                    <Label className="flex items-center gap-2 text-white text-sm font-semibold">
                                                        <Target className="w-4 h-4 text-zinc-400" />
                                                        Topic
                                                    </Label>
                                                    <Input
                                                        placeholder="e.g., Python Programming, Web Development, Machine Learning"
                                                        {...register("title")}
                                                        className="h-11 bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-0"
                                                    />
                                                    {errors.title && (
                                                        <p className="text-sm text-red-400">{errors.title.message}</p>
                                                    )}
                                                </motion.div>

                                                {/* Skill Level */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                    className="space-y-2"
                                                >
                                                    <Label className="flex items-center gap-2 text-white text-sm font-semibold">
                                                        <GraduationCap className="w-4 h-4 text-zinc-400" />
                                                        Level
                                                    </Label>
                                                    <Select
                                                        value={skillLevel}
                                                        onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                                                            setValue("currentSkillLevel", value)
                                                        }
                                                    >
                                                        <SelectTrigger className="h-11 bg-black border-zinc-800 text-white focus:border-zinc-700 focus:ring-0">
                                                            <SelectValue placeholder="Select your level" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-black border-zinc-800">
                                                            <SelectItem value="beginner">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                                                    <span className="text-white">Beginner</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="intermediate">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                                    <span className="text-white">Intermediate</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="advanced">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-green-400" />
                                                                    <span className="text-white">Advanced</span>
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.currentSkillLevel && (
                                                        <p className="text-sm text-red-400">{errors.currentSkillLevel.message}</p>
                                                    )}
                                                </motion.div>

                                                {/* Target Goal */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.15 }}
                                                    className="space-y-2"
                                                >
                                                    <Label className="flex items-center gap-2 text-white text-sm font-semibold">
                                                        <Sparkles className="w-4 h-4 text-zinc-400" />
                                                        Goal
                                                    </Label>
                                                    <Textarea
                                                        placeholder="e.g., Build a full-stack web application, Get a job as a data scientist..."
                                                        {...register("targetGoal")}
                                                        className="min-h-[80px] resize-none bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-0"
                                                    />
                                                    {errors.targetGoal && (
                                                        <p className="text-sm text-red-400">{errors.targetGoal.message}</p>
                                                    )}
                                                </motion.div>

                                                {/* Weekly Hours */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    <div className="space-y-4 bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                                                        <Label className="flex items-center gap-2 text-white text-sm font-semibold">
                                                            <Clock className="w-4 h-4 text-zinc-400" />
                                                            Commitment <span className="font-bold text-white ml-auto">{weeklyHours}h/week</span>
                                                        </Label>
                                                        <Slider
                                                            value={[weeklyHours]}
                                                            onValueChange={(value) => setValue("weeklyHours", value[0])}
                                                            min={1}
                                                            max={40}
                                                            step={1}
                                                            className="py-2"
                                                        />
                                                        <div className="flex justify-between text-xs text-zinc-500">
                                                            <span>1h</span>
                                                            <span>20h</span>
                                                            <span>40h</span>
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                {/* Error Message */}
                                                <AnimatePresence>
                                                    {error && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="p-4 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 text-sm"
                                                        >
                                                            {error}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Submit Button */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.25 }}
                                                >
                                                    <Button
                                                        type="submit"
                                                        size="lg"
                                                        className="w-full h-12 text-base font-semibold bg-white hover:bg-zinc-200 text-black border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                                                    >
                                                        <Sparkles className="mr-2 h-5 w-5" />
                                                        Generate Roadmap
                                                    </Button>
                                                </motion.div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
