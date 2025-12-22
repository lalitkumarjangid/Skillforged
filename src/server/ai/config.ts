// Model configuration - shared types and constants
// This file is imported by both server and client code

export type AIProvider = "gemini" | "openrouter";

export type ModelConfig = {
    provider: AIProvider;
    model: string;
    priority?: number; // Higher = faster, use first
    rateLimit?: number; // Requests per minute
};

// ============================================
// GEMINI MODELS (Free tier: 15 RPM, most reliable)
// ============================================
const GEMINI_FLASH_LITE: ModelConfig = {
    provider: "gemini",
    model: "gemini-2.0-flash-lite",
    priority: 5,
    rateLimit: 15,
};

const GEMINI_FLASH: ModelConfig = {
    provider: "gemini",
    model: "gemini-2.0-flash",
    priority: 4,
    rateLimit: 15,
};

// ============================================
// OPENROUTER LIGHTWEIGHT MODELS
// Free models can have aggressive rate limiting
// Using lite/small models that are more stable
// ============================================

// Mistral 7B - Small, fast, reliable
const OPENROUTER_MISTRAL_7B: ModelConfig = {
    provider: "openrouter",
    model: "mistralai/mistral-7b-instruct:free",
    priority: 3,
    rateLimit: 30,
};

// Phi-3.5 - Microsoft's small model (very fast)
const OPENROUTER_PHI35: ModelConfig = {
    provider: "openrouter",
    model: "microsoft/phi-3.5-mini-instruct:free",
    priority: 3,
    rateLimit: 30,
};

export const MODEL_CONFIGS = {
    // Primary: Gemini (most reliable free model)
    GEMINI_FLASH_LITE,
    GEMINI_FLASH,
    // Fallback: Lightweight OpenRouter models
    OPENROUTER_MISTRAL_7B,
    OPENROUTER_PHI35,
} as const;

// Get all models as array for easy iteration
export const ALL_MODELS = Object.values(MODEL_CONFIGS);

// Primary model for structure - Gemini is most reliable
export const PRIMARY_MODEL = MODEL_CONFIGS.GEMINI_FLASH_LITE;

// Fallback models for when primary fails
export const FALLBACK_MODELS = [
    MODEL_CONFIGS.GEMINI_FLASH,
    MODEL_CONFIGS.OPENROUTER_MISTRAL_7B,
    MODEL_CONFIGS.OPENROUTER_PHI35,
];
