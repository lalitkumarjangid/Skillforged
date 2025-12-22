"use server";

import { v4 as uuidv4 } from "uuid";
import { setToCache, getFromCache } from "@server/redis";
import { CreateRoadmapInput } from "@/lib/types";
import { normalizeResourceType } from "@/lib/utils";
import { generateRoadmapStructure } from "./ai-actions";
import { scrapeResourcesForTopics, generateRelatedLinks } from "@server/scrapers/resource-scraper";
import connectDB from "@server/db";
import Roadmap from "@server/models/Roadmap";
import { auth } from "@server/auth";
import { revalidatePath } from "next/cache";

/**
 * Validate a URL to ensure it's accessible and not a 404
 */
async function validateUrl(url: string, retries: number = 2): Promise<boolean> {
    if (!url || typeof url !== "string") return false;

    // Filter out obviously bad URLs
    if (url.length < 10 || !url.includes(".")) return false;
    if (url.includes("undefined") || url.includes("null")) return false;

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            // YouTube - use oEmbed API
            if (url.includes("youtube.com") || url.includes("youtu.be")) {
                try {
                    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
                    const response = await fetch(oembedUrl, {
                        signal: AbortSignal.timeout(5000),
                        headers: { "User-Agent": "SkillForged-AI-Agent/1.0" }
                    });

                    if (response.ok) {
                        const data = await response.json() as Record<string, unknown>;
                        // Verify it's valid video metadata
                        if (data.video_id || data.title) return true;
                    }
                } catch {
                    // Continue to next attempt
                }
            } else {
                // For non-YouTube URLs - try HEAD first
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);

                    const headResponse = await fetch(url, {
                        method: "HEAD",
                        signal: controller.signal,
                        headers: {
                            "User-Agent": "SkillForged-AI-Agent/1.0",
                            "Accept": "*/*"
                        },
                        redirect: "follow"
                    });

                    clearTimeout(timeoutId);

                    // 200-299 = success, 405 = method not allowed but resource exists
                    if (headResponse.ok || headResponse.status === 405) {
                        return true;
                    }

                    // 404 is definitely invalid
                    if (headResponse.status === 404) {
                        return false;
                    }
                } catch {
                    // Continue to GET method
                }

                // Try GET method if HEAD failed
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);

                    const getResponse = await fetch(url, {
                        method: "GET",
                        signal: controller.signal,
                        headers: {
                            "User-Agent": "SkillForged-AI-Agent/1.0",
                            "Range": "bytes=0-1" // Only fetch 2 bytes to check if valid
                        },
                        redirect: "follow"
                    });

                    clearTimeout(timeoutId);

                    // Success if we get any 2xx response
                    if (getResponse.ok) {
                        return true;
                    }

                    // 404 means resource not found
                    if (getResponse.status === 404) {
                        return false;
                    }

                    // Other 4xx errors are usually bad
                    if (getResponse.status >= 400 && getResponse.status < 500) {
                        continue; // Try again
                    }

                    // 5xx errors might be temporary
                    if (getResponse.status >= 500) {
                        continue; // Try again
                    }
                } catch {
                    // Continue to next attempt
                }
            }
        } catch {
            // Continue to next attempt
        }

        // Small delay before retry
        if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return false;
}

/**
 * Normalize a resource object, ensuring type is valid
 */
function normalizeResource(resource: Record<string, unknown>): Record<string, unknown> {
    return {
        ...resource,
        type: normalizeResourceType(String(resource.type || ""))
    };
}

/**
 * Normalize all resources in the enriched modules
 */
function normalizeModuleResources(modules: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    return modules.map(module => ({
        ...module,
        topics: (module.topics as Array<Record<string, unknown>>)?.map(topic => ({
            ...topic,
            resources: (topic.resources as Array<Record<string, unknown>>)?.map(normalizeResource) || []
        })) || []
    }));
}

export type GenerationStatus = {
    status: "starting" | "analyzing" | "generating" | "structuring" | "saving" | "completed" | "failed";
    progress: number;
    message: string;
    logs?: string[]; // Add logs array
    roadmapId?: string;
    error?: string;
};

/**
 * Start the roadmap generation process in the background.
 * Returns a jobId immediately.
 */
export async function startRoadmapGeneration(
    input: CreateRoadmapInput
): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const jobId = uuidv4();
        const userId = session.user.id; // Capture userId for the background task

        // Set initial status
        await updateStatus(jobId, {
            status: "starting",
            progress: 5,
            message: "Initializing generation..."
        });

        // Trigger background process without awaiting
        // We catch errors inside to update the status to failed
        (async () => {
            try {
                await processRoadmapGeneration(jobId, userId, input);
            } catch (err) {
                console.error("Background generation failed:", err);
                await updateStatus(jobId, {
                    status: "failed",
                    progress: 0,
                    message: "Generation failed",
                    error: "An unexpected error occurred in the background process."
                });
            }
        })();

        return { success: true, jobId };
    } catch (error) {
        console.error("Error starting generation:", error);
        return { success: false, error: "Failed to start generation" };
    }
}

/**
 * Check the status of a generation job
 */
export async function checkGenerationStatus(jobId: string): Promise<GenerationStatus | null> {
    return await getFromCache<GenerationStatus>(`job:${jobId}`);
}

/**
 * Internal helper to update Redis status with logs
 */
async function updateStatus(jobId: string, status: GenerationStatus) {
    // Fetch existing status to append logs if needed, but for simplicity 
    // we might just overwrite or manage logs cumulatively in the worker.
    // Better approach: The worker manages the full state object.
    await setToCache(`job:${jobId}`, status, 3600);
}

/**
 * The actual background worker function
 */
async function processRoadmapGeneration(
    jobId: string,
    userId: string,
    input: CreateRoadmapInput
) {
    const logs: string[] = [];
    const addLog = async (msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        logs.push(`[${timestamp}] ${msg}`);
        // We only persist the last 50 logs to avoid huge payloads
        if (logs.length > 50) logs.shift();
    };

    // Helper to sync status
    const syncStatus = async (status: GenerationStatus["status"], progress: number, message: string) => {
        await updateStatus(jobId, {
            status,
            progress,
            message,
            logs
        });
    }

    await addLog("Initializing background job...");
    await syncStatus("analyzing", 5, "Initializing...");

    // 1. Analyzing & Structuring (Step 1)
    await addLog("Consulting AI Architect to design curriculum...");
    await syncStatus("analyzing", 10, "Designing your learning path...");

    // Initial Structure Call
    const structureResult = await generateRoadmapStructure(input);
    if (!structureResult.success || !structureResult.data) {
        throw new Error(structureResult.error || "Failed to design curriculum");
    }

    await addLog("Curriculum Design Complete.");
    await syncStatus("structuring", 20, "Curriculum designed. Beginning Deep Search...");

    const partialRoadmap = structureResult.data;
    const totalModules = partialRoadmap.modules.length;

    // 2. Deep Search & Enrichment (The Loop)
    // We will process modules in parallel batches to speed up, or sequential for "Deep Search" feel?
    // Sequential allows for more detailed progress updates which user wants ("min 5 requests").

    const enrichedModules = [];

    // SEQUENTIAL PROCESSING WITH DELAYS - Avoid rate limits
    // Reduced delay since we're using direct web scraping APIs
    const DELAY_MS = 1000; // 1 second delay between modules

    for (let i = 0; i < totalModules; i++) {
        const mod = partialRoadmap.modules[i] as Record<string, unknown>;
        const progressBase = 20 + ((i / totalModules) * 60);

        await syncStatus("generating", Math.round(progressBase), `🔍 Scraping Real Resources: Module ${i + 1}/${totalModules} - ${String(mod.title)}...`);
        await addLog(`[Scraping Web] Module ${i + 1}: ${String(mod.title)}`);

        // SCRAPE REAL RESOURCES from actual websites (YouTube, Dev.to, Medium, GFG, etc.)
        const resourcesData = await scrapeResourcesForTopics(mod.topics as Array<{ title: string; description: string }>);

        // Merge resources into topics
        const enrichedTopics = (mod.topics as Array<Record<string, unknown>>).map((topic: Record<string, unknown>) => {
            const topicResources = resourcesData.find((r: Record<string, unknown>) => r.topicTitle === topic.title)?.resources as Array<{ url: string; title: string; type?: string }> || [];

            // Real scraped resources - no validation needed, they're from actual APIs
            return {
                ...topic,
                resources: topicResources,
                estimatedHours: 2
            };
        });

        const resourceCount = enrichedTopics.reduce((acc: number, t: Record<string, unknown>) => {
            return acc + ((t.resources as Array<unknown>) || []).length;
        }, 0);
        
        await addLog(`✅ Module ${i + 1} scraped ${resourceCount} real resources from web`);

        // Generate related links for this module
        const relatedLinks = generateRelatedLinks(String(mod.title));
        
        await addLog(`🔗 Module ${i + 1} enriched with ${relatedLinks.length} related reference links`);

        enrichedModules.push({ 
            ...mod, 
            topics: enrichedTopics,
            relatedLinks: relatedLinks
        });

        // RATE LIMIT PROTECTION - Delay between modules to avoid hitting API limits
        if (i + 1 < totalModules) {
            await addLog(`⏳ Cooling down (${DELAY_MS/1000}s) before next module...`);
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
    }

    // 3. Final Assembly
    await syncStatus("saving", 90, "Assembling final roadmap...");
    await addLog("✨ All modules researched. Saving to database...");

    // Normalize all resource types before saving
    const finalModules = normalizeModuleResources(enrichedModules);

    await connectDB();

    const roadmap = new Roadmap({
        userId: userId,
        title: partialRoadmap.title,
        description: partialRoadmap.description,
        currentSkillLevel: input.currentSkillLevel,
        targetGoal: input.targetGoal,
        weeklyHours: input.weeklyHours,
        totalWeeks: partialRoadmap.totalWeeks,
        totalHours: partialRoadmap.totalHours,
        modules: finalModules,
        prerequisites: partialRoadmap.prerequisites || [],
        learningOutcomes: partialRoadmap.learningOutcomes || [],
        progress: 0,
    });

    await roadmap.save();
    await addLog("Roadmap Saved Successfully.");

    revalidatePath("/dashboard");

    // 5. Completed
    await addLog("Mission Complete.");
    await updateStatus(jobId, {
        status: "completed",
        progress: 100,
        message: "Roadmap ready!",
        logs,
        roadmapId: roadmap._id.toString()
    });
}
