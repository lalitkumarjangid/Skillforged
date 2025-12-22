"use server";

import connectDB from "@server/db";
import User from "@server/models/User";
import { z } from "zod";

const RegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerUser(
    input: z.infer<typeof RegisterSchema>
): Promise<{ success: boolean; error?: string }> {
    try {
        const validated = RegisterSchema.parse(input);

        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email: validated.email });
        if (existingUser) {
            return { success: false, error: "Email already registered" };
        }

        // Create new user
        await User.create({
            name: validated.name,
            email: validated.email,
            password: validated.password,
            provider: "credentials",
        });

        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        console.error("Registration error:", error);
        return { success: false, error: "Failed to register user" };
    }
}
