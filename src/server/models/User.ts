import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    image?: string;
    provider: "credentials" | "google" | "github";
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            minlength: [6, "Password must be at least 6 characters"],
            select: false, // Don't include password by default in queries
        },
        image: {
            type: String,
        },
        provider: {
            type: String,
            enum: ["credentials", "google", "github"],
            default: "credentials",
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
UserSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) {
        return;
    }

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

// Prevent model overwrite in development
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
