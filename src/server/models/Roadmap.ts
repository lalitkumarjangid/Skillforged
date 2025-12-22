import mongoose, { Schema, Document, Model } from "mongoose";

// ==================== Interfaces ====================

export interface IResource {
    title: string;
    url?: string;
    type: "article" | "video" | "exercise" | "project" | "documentation";
    duration?: string;
}

export interface ITopic {
    id: string;
    title: string;
    description: string;
    resources: IResource[];
    estimatedHours: number;
    isCompleted: boolean;
}

export interface IModule {
    id: string;
    week: number;
    title: string;
    description: string;
    topics: ITopic[];
    status: "not_started" | "in_progress" | "completed";
    completedAt?: Date;
}

export interface IRoadmap extends Document {
    userId: string;
    title: string;
    description: string;
    currentSkillLevel: "beginner" | "intermediate" | "advanced";
    targetGoal: string;
    weeklyHours: number;
    totalWeeks: number;
    totalHours: number;
    modules: IModule[];
    prerequisites?: string[];
    learningOutcomes?: string[];
    progress: number;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== Schemas ====================

const ResourceSchema = new Schema<IResource>(
    {
        title: { type: String, required: true },
        url: { type: String },
        type: {
            type: String,
            enum: ["article", "video", "exercise", "project", "documentation"],
            required: true,
        },
        duration: { type: String },
    },
    { _id: false }
);

const TopicSchema = new Schema<ITopic>(
    {
        id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        resources: { type: [ResourceSchema], default: [] },
        estimatedHours: { type: Number, required: true },
        isCompleted: { type: Boolean, default: false },
    },
    { _id: false }
);

const ModuleSchema = new Schema<IModule>(
    {
        id: { type: String, required: true },
        week: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        topics: { type: [TopicSchema], default: [] },
        status: {
            type: String,
            enum: ["not_started", "in_progress", "completed"],
            default: "not_started",
        },
        completedAt: { type: Date },
    },
    { _id: false }
);

const RoadmapSchema = new Schema<IRoadmap>(
    {
        userId: {
            type: String,
            required: [true, "User ID is required"],
            index: true,
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        currentSkillLevel: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            required: true,
        },
        targetGoal: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        weeklyHours: {
            type: Number,
            required: true,
            min: 1,
            max: 60,
        },
        totalWeeks: {
            type: Number,
            required: true,
            min: 1,
        },
        totalHours: {
            type: Number,
            required: true,
            min: 1,
        },
        modules: {
            type: [ModuleSchema],
            default: [],
        },
        prerequisites: {
            type: [String],
            default: [],
        },
        learningOutcomes: {
            type: [String],
            default: [],
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    {
        timestamps: true,
    }
);

// ==================== Indexes ====================

// Compound index for efficient querying
RoadmapSchema.index({ userId: 1, createdAt: -1 });

// Text index for search functionality
RoadmapSchema.index({ title: "text", description: "text", targetGoal: "text" });

// ==================== Virtuals ====================

// Calculate progress based on completed topics
RoadmapSchema.virtual("calculatedProgress").get(function () {
    if (!this.modules || this.modules.length === 0) return 0;

    let totalTopics = 0;
    let completedTopics = 0;

    this.modules.forEach((module) => {
        module.topics.forEach((topic) => {
            totalTopics++;
            if (topic.isCompleted) {
                completedTopics++;
            }
        });
    });

    return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
});

// ==================== Pre-save Hook ====================

RoadmapSchema.pre("save", function () {
    // Auto-update progress before saving
    if (this.modules && this.modules.length > 0) {
        let totalTopics = 0;
        let completedTopics = 0;

        this.modules.forEach((module) => {
            module.topics.forEach((topic) => {
                totalTopics++;
                if (topic.isCompleted) {
                    completedTopics++;
                }
            });

            // Update module status based on topics
            const moduleTopics = module.topics;
            const completedInModule = moduleTopics.filter((t) => t.isCompleted).length;

            if (completedInModule === 0) {
                module.status = "not_started";
            } else if (completedInModule === moduleTopics.length) {
                module.status = "completed";
                if (!module.completedAt) {
                    module.completedAt = new Date();
                }
            } else {
                module.status = "in_progress";
            }
        });

        this.progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    }
});

// ==================== Model ====================

// Check if model already exists (for hot reloading in development)
const Roadmap: Model<IRoadmap> =
    mongoose.models.Roadmap || mongoose.model<IRoadmap>("Roadmap", RoadmapSchema);

export default Roadmap;
