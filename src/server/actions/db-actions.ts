"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@server/db";
import Roadmap, { IRoadmap } from "@server/models/Roadmap";
import { CreateRoadmapInput } from "@/lib/types";
import { generateRoadmap as generateAIRoadmap } from "./ai-actions";

import { auth } from "@server/auth";

/**
 * Create a new roadmap with AI-generated content
 */
export async function createRoadmap(
    input: CreateRoadmapInput
): Promise<{ success: boolean; roadmapId?: string; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Generate AI roadmap first
        const aiResult = await generateAIRoadmap(input);

        if (!aiResult.success || !aiResult.data) {
            return { success: false, error: aiResult.error || "Failed to generate roadmap" };
        }

        // Connect to database
        await connectDB();

        // Create the roadmap document
        const roadmap = new Roadmap({
            userId: session.user.id,
            title: aiResult.data.title,
            description: aiResult.data.description,
            currentSkillLevel: input.currentSkillLevel,
            targetGoal: input.targetGoal,
            weeklyHours: input.weeklyHours,
            totalWeeks: aiResult.data.totalWeeks,
            totalHours: aiResult.data.totalHours,
            modules: aiResult.data.modules,
            prerequisites: aiResult.data.prerequisites || [],
            learningOutcomes: aiResult.data.learningOutcomes || [],
            progress: 0,
        });

        await roadmap.save();

        // Revalidate dashboard
        revalidatePath("/dashboard");

        return { success: true, roadmapId: roadmap._id.toString() };
    } catch (error) {
        console.error("Error creating roadmap:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create roadmap",
        };
    }
}

/**
 * Get all roadmaps for the authenticated user
 */
export async function getRoadmaps(): Promise<{ success: boolean; roadmaps?: IRoadmap[]; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        await connectDB();

        const roadmaps = await Roadmap.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .lean<IRoadmap[]>();

        return {
            success: true,
            roadmaps: JSON.parse(JSON.stringify(roadmaps))
        };
    } catch (error) {
        console.error("Error fetching roadmaps:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch roadmaps",
        };
    }
}

/**
 * Get a single roadmap by ID (must belong to user)
 */
export async function getRoadmapById(
    id: string
): Promise<{ success: boolean; roadmap?: IRoadmap; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        await connectDB();

        const roadmap = await Roadmap.findOne({
            _id: id,
            userId: session.user.id
        }).lean<IRoadmap>();

        if (!roadmap) {
            return { success: false, error: "Roadmap not found" };
        }

        return {
            success: true,
            roadmap: JSON.parse(JSON.stringify(roadmap))
        };
    } catch (error) {
        console.error("Error fetching roadmap:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch roadmap",
        };
    }
}

/**
 * Update topic completion status (must belong to user)
 */
export async function updateTopicCompletion(
    roadmapId: string,
    moduleId: string,
    topicId: string,
    isCompleted: boolean
): Promise<{ success: boolean; progress?: number; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        await connectDB();

        const roadmap = await Roadmap.findOne({
            _id: roadmapId,
            userId: session.user.id
        });

        if (!roadmap) {
            return { success: false, error: "Roadmap not found" };
        }

        // Find and update the topic
        let found = false;
        roadmap.modules.forEach((module) => {
            if (module.id === moduleId) {
                module.topics.forEach((topic) => {
                    if (topic.id === topicId) {
                        topic.isCompleted = isCompleted;
                        found = true;
                    }
                });
            }
        });

        if (!found) {
            return { success: false, error: "Topic not found" };
        }

        // Save triggers pre-save hook that updates progress
        await roadmap.save();

        // Revalidate paths
        revalidatePath(`/roadmap/${roadmapId}`);
        revalidatePath("/dashboard");

        return { success: true, progress: roadmap.progress };
    } catch (error) {
        console.error("Error updating completion:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update completion",
        };
    }
}

/**
 * Delete a roadmap (must belong to user)
 */
export async function deleteRoadmap(
    roadmapId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        await connectDB();

        const result = await Roadmap.findOneAndDelete({
            _id: roadmapId,
            userId: session.user.id
        });

        if (!result) {
            return { success: false, error: "Roadmap not found" };
        }

        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Error deleting roadmap:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete roadmap",
        };
    }
}
