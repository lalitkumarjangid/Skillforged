import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, ModelConfig, MODEL_CONFIGS, ALL_MODELS, PRIMARY_MODEL, FALLBACK_MODELS } from "./config";
import { getFromCache, setToCache } from "../redis";
import crypto from "crypto";

export type AIResponse = {
    success: boolean;
    text?: string;
    error?: string;
    provider?: AIProvider;
    model?: string;
    responseTime?: number;
    fromCache?: boolean;
};

// Track rate-limited models with expiry time
const rateLimitedModels = new Map<string, number>();
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 500; // Minimum 500ms between requests to avoid hammering APIs

/**
 * Generate cache key for AI requests
 */
function generateCacheKey(prompt: string, taskType?: string): string {
    const hash = crypto.createHash("md5").update(prompt).digest("hex").substring(0, 16);
    return `ai:${taskType || "general"}:${hash}`;
}

/**
 * Check if a model is currently rate limited
 */
function isRateLimited(modelId: string): boolean {
    const expiry = rateLimitedModels.get(modelId);
    if (!expiry) return false;
    if (Date.now() > expiry) {
        rateLimitedModels.delete(modelId);
        return false;
    }
    return true;
}

/**
 * Mark a model as rate limited for a duration
 */
function markRateLimited(modelId: string, durationMs: number = 60000): void {
    rateLimitedModels.set(modelId, Date.now() + durationMs);
    console.log(`⏸️ ${modelId} rate limited for ${durationMs / 1000}s`);
}

/**
 * Helper to sanitize JSON string from AI response
 */
export async function cleanAndParseJSON(text: string): Promise<Record<string, unknown>> {
    try {
        if (!text || text.trim() === "") {
            throw new Error("Empty response from AI");
        }
        
        // Remove markdown code blocks
        let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
        
        // Try to extract JSON array or object
        const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
        const objectMatch = cleaned.match(/\{[\s\S]*\}/);
        
        if (arrayMatch) {
            cleaned = arrayMatch[0];
        } else if (objectMatch) {
            cleaned = objectMatch[0];
        }
        
        // Try to parse as-is first
        try {
            return JSON.parse(cleaned) as Record<string, unknown>;
        } catch {
            // Fix common JSON issues
            console.log("Initial parse failed, attempting to fix JSON...");
            
            // Remove trailing commas before closing brackets
            cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
            
            // Check if JSON is incomplete
            const openBraces = (cleaned.match(/\{/g) || []).length;
            const closeBraces = (cleaned.match(/\}/g) || []).length;
            const openBrackets = (cleaned.match(/\[/g) || []).length;
            const closeBrackets = (cleaned.match(/\]/g) || []).length;
            
            if (openBrackets > closeBrackets || openBraces > closeBraces) {
                console.log(`Incomplete JSON: {${openBraces}vs${closeBraces}} [${openBrackets}vs${closeBrackets}]`);
                
                // Find last complete entry
                const lastComma = cleaned.lastIndexOf(',');
                const lastBracket = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));
                
                if (lastComma > lastBracket) {
                    cleaned = cleaned.substring(0, lastComma);
                }
                
                // Close open structures
                cleaned += ']'.repeat(openBrackets - closeBrackets);
                cleaned += '}'.repeat(openBraces - closeBraces);
            }
            
            return JSON.parse(cleaned) as Record<string, unknown>;
        }
    } catch (e) {
        console.error("JSON Parse Error. First 300 chars:", text.substring(0, 300));
        throw new Error(`Failed to parse AI response: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
}

/**
 * Call Gemini API with retry
 */
async function callGemini(model: string, prompt: string, retries: number = 2): Promise<AIResponse> {
    const modelId = `gemini:${model}`;
    
    if (isRateLimited(modelId)) {
        return { success: false, error: "Rate limited", provider: "gemini", model };
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const startTime = Date.now();
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
            const geminiModel = genAI.getGenerativeModel({ model });

            const result = await geminiModel.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" },
            });

            const text = result.response.text();
            const responseTime = Date.now() - startTime;

            return {
                success: true,
                text,
                provider: "gemini",
                model,
                responseTime,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Gemini API call failed";
            
            if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("Too Many")) {
                markRateLimited(modelId, 60000); // 1 minute cooldown
                return { success: false, error: "Rate limited", provider: "gemini", model };
            }
            
            if (attempt < retries) {
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                console.log(`⏳ Gemini retry ${attempt + 1}/${retries} in ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            
            return { success: false, error: errorMessage, provider: "gemini", model };
        }
    }
    
    return { success: false, error: "Max retries exceeded", provider: "gemini", model };
}

/**
 * Call OpenRouter API with retry
 */
async function callOpenRouter(model: string, prompt: string, retries: number = 2): Promise<AIResponse> {
    const modelId = `openrouter:${model}`;
    
    if (isRateLimited(modelId)) {
        return { success: false, error: "Rate limited", provider: "openrouter", model };
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const startTime = Date.now();
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || ""}`,
                    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                    "X-Title": "SkillForged",
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                    max_tokens: 4096,
                }),
            });

            if (!response.ok) {
                const error = await response.json() as Record<string, unknown>;
                const errorData = error.error as Record<string, unknown> | undefined;
                const errorMsg = errorData?.message as string || response.statusText;
                
                // Rate limit or model unavailable
                if (errorMsg.includes("Rate limit") || errorMsg.includes("per-day") || errorMsg.includes("per-min")) {
                    const duration = errorMsg.includes("per-day") ? 3600000 : 60000;
                    markRateLimited(modelId, duration);
                    return { success: false, error: "Rate limited", provider: "openrouter", model };
                }
                
                if (errorMsg.includes("not a valid model") || errorMsg.includes("No endpoints")) {
                    markRateLimited(modelId, 86400000); // 24h for invalid models
                    return { success: false, error: "Model unavailable", provider: "openrouter", model };
                }
                
                throw new Error(errorMsg);
            }

            const data = await response.json() as Record<string, unknown>;
            const choices = data.choices as Array<Record<string, unknown>> | undefined;
            const text = (choices?.[0]?.message as Record<string, unknown> | undefined)?.content as string | undefined || "";

            if (!text || text.trim() === "") {
                throw new Error("Empty response");
            }

            return {
                success: true,
                text,
                provider: "openrouter",
                model,
                responseTime: Date.now() - startTime,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "OpenRouter API call failed";
            
            if (attempt < retries && !errorMessage.includes("Rate limit")) {
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`⏳ OpenRouter retry ${attempt + 1}/${retries} in ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            
            return { success: false, error: errorMessage, provider: "openrouter", model };
        }
    }
    
    return { success: false, error: "Max retries exceeded", provider: "openrouter", model };
}

/**
 * Route API call to appropriate provider
 */
async function callProvider(modelConfig: ModelConfig, prompt: string): Promise<AIResponse> {
    if (modelConfig.provider === "gemini") {
        return callGemini(modelConfig.model, prompt);
    } else if (modelConfig.provider === "openrouter") {
        return callOpenRouter(modelConfig.model, prompt);
    }
    return { success: false, error: "Unknown provider" };
}

/**
 * Get available (non-rate-limited) models
 */
function getAvailableModels(models: ModelConfig[]): ModelConfig[] {
    return models.filter(m => {
        const modelId = `${m.provider}:${m.model}`;
        return !isRateLimited(modelId);
    });
}

/**
 * Call with intelligent wait-and-retry
 * If all models are rate limited, waits and retries instead of failing
 */
export async function callWithFallback(
    prompt: string,
    taskType: string = "general",
    preferredModels?: ModelConfig[]
): Promise<AIResponse> {
    // Check cache first
    const cacheKey = generateCacheKey(prompt, taskType);
    const cached = await getFromCache<AIResponse>(cacheKey);
    if (cached && cached.success) {
        console.log(`📦 Cache hit for ${taskType}`);
        return { ...cached, fromCache: true };
    }

    const modelsToTry = preferredModels || FALLBACK_MODELS;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
        const available = getAvailableModels(modelsToTry);
        
        if (available.length === 0) {
            if (retryCount < maxRetries) {
                const waitTime = Math.pow(2, retryCount) * 3000; // 3s, 6s, 12s, 24s
                console.log(`⏳ All models rate limited. Waiting ${waitTime / 1000}s before retry ${retryCount + 1}/${maxRetries}...`);
                await new Promise(r => setTimeout(r, waitTime));
                retryCount++;
                continue;
            } else {
                // After max retries, return error
                return {
                    success: false,
                    error: "All models are rate limited. Please try again in a few minutes.",
                };
            }
        }

        // Sort by priority
        const sorted = [...available].sort((a, b) => (b.priority || 0) - (a.priority || 0));

        // Try top model(s) sequentially with proper delays
        for (const model of sorted.slice(0, 2)) {
            // Enforce minimum interval between requests
            const timeSinceLastRequest = Date.now() - lastRequestTime;
            if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
                await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
            }

            console.log(`🚀 Trying ${model.provider}/${model.model.split('/').pop()}`);
            const result = await callProvider(model, prompt);
            lastRequestTime = Date.now();

            if (result.success) {
                console.log(`✅ Success with ${result.provider}/${result.model} (${result.responseTime}ms)`);
                await setToCache(cacheKey, result, 3600);
                return result;
            }
        }

        // If we get here, both primary models failed
        if (retryCount < maxRetries) {
            const waitTime = Math.pow(2, retryCount) * 3000;
            console.log(`⏳ First batch failed. Waiting ${waitTime / 1000}s before retry ${retryCount + 1}/${maxRetries}...`);
            await new Promise(r => setTimeout(r, waitTime));
            retryCount++;
        } else {
            break;
        }
    }

    return {
        success: false,
        error: "Failed to generate response. All models exhausted. Please try again in a few minutes.",
    };
}

/**
 * Smart routing based on task type
 * Uses different model combinations for different tasks
 */
export async function smartRoute(
    prompt: string,
    taskType: "structure" | "research" | "explanation" | "quick"
): Promise<AIResponse> {
    let models: ModelConfig[];

    switch (taskType) {
        case "structure":
            // Complex curriculum design - prioritize Gemini
            models = [
                MODEL_CONFIGS.GEMINI_FLASH_LITE,
                MODEL_CONFIGS.GEMINI_FLASH,
                MODEL_CONFIGS.OPENROUTER_MISTRAL_7B,
            ];
            break;

        case "research":
            // Resource research - use fallback models
            models = [
                MODEL_CONFIGS.GEMINI_FLASH_LITE,
                MODEL_CONFIGS.OPENROUTER_MISTRAL_7B,
                MODEL_CONFIGS.OPENROUTER_PHI35,
            ];
            break;

        case "explanation":
            // Simple explanations - fast models
            models = [
                MODEL_CONFIGS.GEMINI_FLASH_LITE,
                MODEL_CONFIGS.OPENROUTER_PHI35,
            ];
            break;

        case "quick":
            // Urgent/simple tasks
            models = [
                MODEL_CONFIGS.GEMINI_FLASH_LITE,
            ];
            break;
    }

    return callWithFallback(prompt, taskType, models);
}

/**
 * Legacy function for backwards compatibility
 */
export async function callFastest(models: ModelConfig[], prompt: string): Promise<AIResponse> {
    return callWithFallback(prompt, "general", models);
}

/**
 * Legacy function for backwards compatibility
 */
export async function callDistributed(
    prompt: string,
    models?: ModelConfig[]
): Promise<AIResponse> {
    return callWithFallback(prompt, "distributed", models);
}
