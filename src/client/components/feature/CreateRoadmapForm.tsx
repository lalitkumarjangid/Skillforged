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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@client/components/ui/card";
import { CreateRoadmapSchema, CreateRoadmapInput } from "@/lib/types";
import { Loader2, Sparkles, Clock, Target, GraduationCap } from "lucide-react";
import { z } from "zod";
import { startRoadmapGeneration, checkGenerationStatus } from "@server/actions/generation-actions";

type FormData = z.infer<typeof CreateRoadmapSchema>;

interface CreateRoadmapFormProps {
    onSuccess?: (roadmapId: string) => void;
}

export function CreateRoadmapForm({ onSuccess }: CreateRoadmapFormProps) {
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
                // If we time out, we don't necessarily want to show an error if it's just slow,
                // but we should probably stop polling.
            }, 180000);

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="w-full max-w-2xl mx-auto border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm min-h-[500px] flex flex-col p-6">
                <CardContent className="flex-1 flex flex-col space-y-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                            <div className="relative h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center">
                                <Sparkles className="h-8 w-8 text-white animate-pulse" />
                            </div>
                        </motion.div>

                        <div className="space-y-1">
                            <motion.h3
                                key={statusMessage}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xl font-semibold"
                            >
                                {statusMessage}
                            </motion.h3>
                            <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-1.5 overflow-hidden mt-4">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Activity Feed (Clean UI) */}
                    <div className="flex-1 bg-muted/30 rounded-lg p-6 overflow-hidden flex flex-col border border-border/50">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </div>
                            <span className="text-sm font-medium text-foreground tracking-tight">Agent Activity</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 px-1" style={{ scrollbarWidth: 'none' }}>
                            {logs.filter(log => !log.includes("[Removed]") && !log.includes("[WARN]")).map((log, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-3 text-sm"
                                >
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                                    <span className="text-muted-foreground">
                                        {log.split(']').slice(1).join(']').trim()}
                                    </span>
                                </motion.div>
                            ))}
                            <div ref={logEndRef} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-2"
                >
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                </motion.div>
                <CardTitle className="text-2xl font-bold">Create Your Learning Roadmap</CardTitle>
                <CardDescription>
                    Tell us what you want to learn and we&apos;ll generate a personalized curriculum
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            What do you want to learn?
                        </Label>
                        <Input
                            id="title"
                            placeholder="e.g., Python Programming, Web Development, Machine Learning"
                            {...register("title")}
                            className="h-12"
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Skill Level */}
                    <div className="space-y-2">
                        <Label htmlFor="skillLevel" className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-primary" />
                            Your current skill level
                        </Label>
                        <Select
                            value={skillLevel}
                            onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                                setValue("currentSkillLevel", value)
                            }
                        >
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select your level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        Beginner - I&apos;m just starting out
                                    </div>
                                </SelectItem>
                                <SelectItem value="intermediate">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                                        Intermediate - I have some experience
                                    </div>
                                </SelectItem>
                                <SelectItem value="advanced">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                                        Advanced - I want to master this
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.currentSkillLevel && (
                            <p className="text-sm text-destructive">{errors.currentSkillLevel.message}</p>
                        )}
                    </div>

                    {/* Target Goal */}
                    <div className="space-y-2">
                        <Label htmlFor="targetGoal" className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            What&apos;s your goal?
                        </Label>
                        <Textarea
                            id="targetGoal"
                            placeholder="e.g., Build a full-stack web application, Get a job as a data scientist, Create my own mobile app..."
                            {...register("targetGoal")}
                            className="min-h-[100px] resize-none"
                        />
                        {errors.targetGoal && (
                            <p className="text-sm text-destructive">{errors.targetGoal.message}</p>
                        )}
                    </div>

                    {/* Weekly Hours */}
                    <div className="space-y-4">
                        <Label className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            Hours per week: <span className="font-bold text-primary">{weeklyHours}h</span>
                        </Label>
                        <Slider
                            value={[weeklyHours]}
                            onValueChange={(value) => setValue("weeklyHours", value[0])}
                            min={1}
                            max={40}
                            step={1}
                            className="py-4"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1h/week</span>
                            <span>20h/week</span>
                            <span>40h/week</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full h-14 text-lg font-semibold group"
                        disabled={isLoading}
                    >
                        <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                        Generate AI Roadmap
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
