"use server";

import { headers } from "next/headers";
import { getFromCache, setToCache, checkRateLimit } from "@server/redis";
import { CreateRoadmapInput, AIRoadmapResponse } from "@/lib/types";
import { smartRoute, cleanAndParseJSON } from "@server/ai/model-router";

/**
 * Fallback: Generate a basic structure when AI fails
 * Uses a template-based approach to ensure users get SOMETHING
 */
function generateFallbackStructure(input: CreateRoadmapInput): AIRoadmapResponse {
    const weeksPerModule = Math.max(1, Math.ceil(input.weeklyHours / 2));
    const totalWeeks = Math.max(4, Math.ceil(52 * (input.weeklyHours / 10))); // Estimate based on hours
    const moduleCount = Math.max(3, Math.ceil(totalWeeks / weeksPerModule));

    const modules: Record<string, unknown>[] = [];

    // Generate modules based on common learning paths
    const moduleTemplates = [
        { title: "Fundamentals & Setup", description: "Core concepts and environment setup" },
        { title: "Core Concepts", description: "Essential knowledge and best practices" },
        { title: "Practical Application", description: "Real-world projects and exercises" },
        { title: "Advanced Topics", description: "Advanced patterns and optimization" },
        { title: "Professional Practice", description: "Professional tools and workflows" },
    ];

    for (let i = 0; i < moduleCount && i < moduleTemplates.length; i++) {
        const template = moduleTemplates[i];
        modules.push({
            id: `mod-${i + 1}`,
            week: i + 1,
            title: template.title,
            description: template.description,
            topics: [
                {
                    id: `t-${i}-1`,
                    title: `Introduction to ${template.title}`,
                    description: `Learn the fundamentals of ${template.title.toLowerCase()}`,
                },
                {
                    id: `t-${i}-2`,
                    title: `${template.title} in Practice`,
                    description: `Apply ${template.title.toLowerCase()} to real scenarios`,
                },
                {
                    id: `t-${i}-3`,
                    title: `Best Practices and Patterns`,
                    description: `Industry standards for ${input.title.toLowerCase()}`,
                },
            ],
        });
    }

    return {
        title: input.title,
        description: `A comprehensive ${input.currentSkillLevel}-level learning path for ${input.title}`,
        totalWeeks,
        totalHours: totalWeeks * input.weeklyHours,
        prerequisites: ["Basic programming knowledge", "Problem-solving skills"],
        learningOutcomes: [
            `Master fundamental concepts of ${input.title}`,
            `Apply practical techniques in real projects`,
            `Understand best practices and industry standards`,
            `Build professional-level skills`,
        ],
        modules: modules as any[],
    };
}

/**
 * Generate a unique cache key for roadmap requests
 */
function generateCacheKey(input: CreateRoadmapInput): string {
    const normalized = `${input.title.toLowerCase().trim()}-${input.currentSkillLevel}-${input.weeklyHours}`;
    return `roadmap:${normalized.replace(/\s+/g, "-")}`;
}

/**
 * Get client IP address for rate limiting
 */
async function getClientIP(): Promise<string> {
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const realIP = headersList.get("x-real-ip");

    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    if (realIP) {
        return realIP;
    }
    return "127.0.0.1";
}

/**
 * Generate a learning roadmap using multi-provider AI
 */
export async function generateRoadmap(
    input: CreateRoadmapInput
): Promise<{ success: boolean; data?: AIRoadmapResponse; error?: string }> {
    try {
        // Rate limiting check
        const clientIP = await getClientIP();
        const rateLimitResult = await checkRateLimit(clientIP, 5, 60);

        if (!rateLimitResult.allowed) {
            return {
                success: false,
                error: `Rate limit exceeded. Please try again in ${rateLimitResult.resetIn} seconds.`,
            };
        }

        // Check cache first
        const cacheKey = generateCacheKey(input);
        const cachedResult = await getFromCache<AIRoadmapResponse>(cacheKey);

        if (cachedResult) {
            console.log("Cache hit for:", cacheKey);
            return { success: true, data: cachedResult };
        }

        // If not in cache, we should actually generate it (or this function should be deprecated/forward to new structure)
        // For now, since we refactored to use generateRoadmapStructure, we can just call that.
        return generateRoadmapStructure(input);

    } catch (error) {
        console.error("Error generating roadmap:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Step 1: Generate the Skeleton Structure
 * Uses smart routing to find the fastest capable model.
 * If all AI models fail, uses fallback template-based generation.
 */
export async function generateRoadmapStructure(input: CreateRoadmapInput): Promise<{ success: boolean; data?: AIRoadmapResponse; error?: string }> {
    try {
        // Using existing rate limit check
        const clientIP = await getClientIP();
        const rateLimitResult = await checkRateLimit(clientIP, 5, 60);

        if (!rateLimitResult.allowed) {
            return {
                success: false,
                error: `Rate limit exceeded. Please try again in ${rateLimitResult.resetIn} seconds.`,
            };
        }

        const prompt = `
        Act as an expert Senior Curriculum Architect.
        Create a detailed learning path for: "${input.title}"
        Target Goal: "${input.targetGoal}"
        Level: ${input.currentSkillLevel}
        Weekly Time: ${input.weeklyHours} hours
        
        Generate a JSON structure for the roadmap.
        
        Important Guidelines:
        1. Break down into logical Modules (Weeks).
        2. Each Module must have a title, specific learning outcome, and 3-5 sub-topics.
        3. Do NOT generate resources (links/videos) in this step. We will research them later.
        4. Focus on logical progression and conceptual depth.

        STRICT JSON OUTPUT RULES:
        - Return RAW JSON only.
        - Do NOT use markdown code blocks (\`\`\`json).
        - Ensure all strings are properly escaped.

        JSON Schema:
        {
          "title": "Strong, engaging title",
          "description": "Inspiring overview",
          "totalWeeks": number,
          "totalHours": number,
          "prerequisites": ["list of concepts"],
          "learningOutcomes": ["list of skills"],
          "modules": [
            {
              "id": "mod-1",
              "week": 1,
              "title": "Module Title",
              "description": "What they will learn",
              "topics": [
                { "id": "t-1", "title": "Topic Name", "description": "Concept detail" }
              ]
            }
          ]
        }
        `;

        // Use smart routing to find fastest capable model
        const response = await smartRoute(prompt, "structure");

        if (!response.success || !response.text) {
            console.warn("AI generation failed, using fallback structure:", response.error);
            // Use fallback structure when AI fails
            const fallbackData = generateFallbackStructure(input);
            return { success: true, data: fallbackData };
        }

        console.log(`Structure generated using ${response.provider}/${response.model} (${response.responseTime}ms)`);

        const data = await cleanAndParseJSON(response.text) as AIRoadmapResponse;

        return { success: true, data };
    } catch (error) {
        console.error("AI Structure Generation Failed:", error);
        // Use fallback when parsing fails
        const fallbackData = generateFallbackStructure(input);
        return { success: true, data: fallbackData };
    }
}

/**
 * Step 2: Enrich a specific module with high-quality resources
 * Uses distributed multi-model approach for speed.
 */
export async function enrichModuleWithResources(
    moduleTitle: string,
    topics: { title: string, description: string }[]
): Promise<Array<Record<string, unknown>>> {
    try {
        const prompt = `
         Act as a Senior Technical Researcher with expertise in finding the BEST learning resources.
         Find PREMIUM, ACTIVE learning resources for this module: "${moduleTitle}"
         
         Topics to cover:
         ${topics.map(t => `- ${t.title}: ${t.description}`).join('\n')}

         ⭐ CRITICAL REQUIREMENTS:
         
         1. **VIDEOS FIRST**: Prioritize high-quality video tutorials (YouTube, Udemy FREE sections, Vimeo)
            - Look for recent videos (2023+)
            - Prefer channels with 100K+ subscribers (credible)
            - Include complete tutorials, not just clips
            - Verify video length is 5+ minutes for substantial content
         
         2. **MINIMUM 5 RESOURCES PER TOPIC**:
            - At least 3 MUST be videos
            - Maximum 2 can be articles/documentation
            - Each resource must be DIFFERENT (not duplicates)
         
         3. **RESOURCE QUALITY STANDARDS**:
            - Only active, working URLs (test them mentally)
            - Recent content (last 2 years preferred)
            - Trusted sources: Official docs, YouTube channels, Medium, Dev.to, Hashnode
            - NO dead links, NO paywalls, NO 404 errors
            - Avoid generic placeholder content
         
         4. **VIDEO SOURCES** (Check these first):
            - YouTube: Search for best-rated videos by view count & engagement
            - LinkedIn Learning (some free content)
            - Egghead.io (some free)
            - freeCodeCamp (excellent free content)
            - Official docs demo videos
            - Conference talks (YouTube)
         
         5. **ARTICLE SOURCES** (If videos insufficient):
            - Official documentation
            - Medium (filter by "Member-only" = NO)
            - Dev.to (always free)
            - Hashnode (mostly free)
            - CSS-Tricks, Smashing Magazine (some free)
         
         6. **URL VALIDATION**:
            - Verify URLs are complete: https://...
            - Check domains are real and active
            - Avoid shortened URLs (bit.ly, tinyurl)
            - Avoid URLs with "preview" or "demo" only
         
         7. **DIVERSITY REQUIREMENT**:
            - Mix of different video creators/channels
            - Mix of different article platforms
            - Different perspectives on the topic
            - Range from beginner to intermediate explanations
         
         8. **ABSOLUTELY NO DEAD LINKS**:
            - Only include resources you're 100% confident are working
            - If unsure about a URL, skip it
            - Better 3 great links than 5 bad ones
            - Verify domains exist

         STRICT JSON OUTPUT RULES:
         - Return RAW JSON only.
         - Do NOT use markdown code blocks (\`\`\`json).
         - Ensure all strings are properly escaped.
         - Validate all URLs before including

         Return a JSON array of resources for each topic.
         Schema:
         [
           {
             "topicTitle": "Exact topic title from input",
             "resources": [
               { 
                 "title": "Clear, descriptive title", 
                 "type": "video|article|documentation", 
                 "url": "https://complete.url.com/path",
                 "source": "YouTube|Medium|Official Docs|etc"
               }
             ]
           }
         ]
         
         Remember: QUALITY > QUANTITY. Each link must be active and valuable.
         `;

        // Use smart routing for research - uses multiple models in parallel for speed
        const response = await smartRoute(prompt, "research");

        if (!response.success || !response.text) {
            console.warn(`Resource enrichment warning for ${moduleTitle}:`, response.error);
            return []; // Return empty on failure to not block entire process
        }

        console.log(`Resources researched for "${moduleTitle}" using ${response.provider}/${response.model} (${response.responseTime}ms)`);

        const result = await cleanAndParseJSON(response.text);
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error(`Enrichment failed for ${moduleTitle}:`, error);
        return []; // Return empty on failure to not block entire process
    }
}

/**
 * Explain a specific topic using multi-provider AI (fastest)
 */
export async function explainTopic(
    topic: string,
    context: string,
    skillLevel: "beginner" | "intermediate" | "advanced"
): Promise<{ success: boolean; explanation?: string; error?: string }> {
    try {
        // Rate limiting
        const clientIP = await getClientIP();
        const rateLimitResult = await checkRateLimit(clientIP, 5, 60);

        if (!rateLimitResult.allowed) {
            return {
                success: false,
                error: `Rate limit exceeded. Try again in ${rateLimitResult.resetIn} seconds.`,
            };
        }

        // Check cache
        const cacheKey = `explain:${topic.toLowerCase().replace(/\s+/g, "-")}-${skillLevel}`;
        const cached = await getFromCache<string>(cacheKey);

        if (cached) {
            return { success: true, explanation: cached };
        }

        const prompt = `You are a friendly and patient tutor. Explain the following topic to a ${skillLevel} learner.

**Topic:** ${topic}
**Learning Context:** ${context}

Provide a clear, concise explanation that:
1. Breaks down complex concepts into simple terms
2. Uses practical examples and analogies
3. Includes code examples if relevant (formatted in markdown)
4. Suggests next steps for deeper understanding

Keep the explanation focused and under 500 words.`;

        // Use smart routing for quick explanations
        const response = await smartRoute(prompt, "explanation");

        if (!response.success || !response.text) {
            return {
                success: false,
                error: response.error || "Failed to explain topic",
            };
        }

        const explanation = response.text;

        // Cache for 2 hours
        await setToCache(cacheKey, explanation, 7200);

        return { success: true, explanation };
    } catch (error) {
        console.error("Error explaining topic:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to explain topic",
        };
    }
}
