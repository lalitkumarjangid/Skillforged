import { z } from "zod";

// ==================== Enums ====================

export const SkillLevel = {
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    ADVANCED: "advanced",
} as const;

export type SkillLevelType = (typeof SkillLevel)[keyof typeof SkillLevel];

export const ModuleStatus = {
    NOT_STARTED: "not_started",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
} as const;

export type ModuleStatusType = (typeof ModuleStatus)[keyof typeof ModuleStatus];

// ==================== Zod Schemas ====================

/**
 * Schema for creating a new roadmap request
 */
export const CreateRoadmapSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title must be less than 100 characters"),
    currentSkillLevel: z.enum(["beginner", "intermediate", "advanced"]),
    targetGoal: z
        .string()
        .min(10, "Goal must be at least 10 characters")
        .max(500, "Goal must be less than 500 characters"),
    weeklyHours: z
        .number()
        .min(1, "Minimum 1 hour per week")
        .max(60, "Maximum 60 hours per week"),
});

export type CreateRoadmapInput = z.infer<typeof CreateRoadmapSchema>;

/**
 * Schema for a resource within a topic
 */
export const ResourceSchema = z.object({
    title: z.string(),
    url: z.string().url().optional(),
    type: z.enum(["article", "video", "exercise", "project", "documentation"]),
    duration: z.string().optional(), // e.g., "30 min", "2 hours"
});

export type Resource = z.infer<typeof ResourceSchema>;

/**
 * Schema for a topic within a module
 */
export const TopicSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    resources: z.array(ResourceSchema),
    estimatedHours: z.number(),
    isCompleted: z.boolean().default(false),
});

export type Topic = z.infer<typeof TopicSchema>;

/**
 * Schema for a learning module (week-based)
 */
export const ModuleSchema = z.object({
    id: z.string(),
    week: z.number(),
    title: z.string(),
    description: z.string(),
    topics: z.array(TopicSchema),
    status: z.enum(["not_started", "in_progress", "completed"]).default("not_started"),
    completedAt: z.date().optional(),
});

export type Module = z.infer<typeof ModuleSchema>;

/**
 * Schema for AI-generated roadmap content
 */
export const AIRoadmapResponseSchema = z.object({
    title: z.string(),
    description: z.string(),
    totalWeeks: z.number(),
    totalHours: z.number(),
    modules: z.array(ModuleSchema),
    prerequisites: z.array(z.string()).optional(),
    learningOutcomes: z.array(z.string()).optional(),
});

export type AIRoadmapResponse = z.infer<typeof AIRoadmapResponseSchema>;

/**
 * Full roadmap document schema (includes MongoDB fields)
 */
export const RoadmapSchema = z.object({
    _id: z.string().optional(),
    userId: z.string().optional(), // Optional for anonymous users
    title: z.string(),
    description: z.string(),
    currentSkillLevel: z.enum(["beginner", "intermediate", "advanced"]),
    targetGoal: z.string(),
    weeklyHours: z.number(),
    totalWeeks: z.number(),
    totalHours: z.number(),
    modules: z.array(ModuleSchema),
    prerequisites: z.array(z.string()).optional(),
    learningOutcomes: z.array(z.string()).optional(),
    progress: z.number().min(0).max(100).default(0),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type Roadmap = z.infer<typeof RoadmapSchema>;

/**
 * Schema for updating module completion
 */
export const UpdateModuleSchema = z.object({
    roadmapId: z.string(),
    moduleId: z.string(),
    topicId: z.string().optional(),
    isCompleted: z.boolean(),
});

export type UpdateModuleInput = z.infer<typeof UpdateModuleSchema>;

/**
 * Schema for AI explanation request
 */
export const ExplainTopicSchema = z.object({
    topic: z.string(),
    context: z.string().optional(), // The broader learning context
    skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

export type ExplainTopicInput = z.infer<typeof ExplainTopicSchema>;

// ==================== TypeScript Interfaces ====================

/**
 * Roadmap card display props
 */
export interface RoadmapCardProps {
    roadmap: Roadmap;
    onSelect?: (id: string) => void;
}

/**
 * Module card display props
 */
export interface ModuleCardProps {
    module: Module;
    onComplete?: (moduleId: string, topicId?: string) => void;
    onExplain?: (topic: string) => void;
}

/**
 * API response wrapper
 */
export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Pagination params
 */
export interface PaginationParams {
    page: number;
    limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
}
