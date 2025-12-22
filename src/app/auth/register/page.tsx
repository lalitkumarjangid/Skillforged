"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@client/components/ui/button";
import { Input } from "@client/components/ui/input";
import { Label } from "@client/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@client/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { registerUser } from "@server/actions/auth-actions";

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const result = await registerUser({ name, email, password });

            if (!result.success) {
                toast.error(result.error);
                return;
            }

            toast.success("Account created successfully! Please sign in.");
            router.push("/auth/signin");
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-white/10 transition-transform group-hover:scale-105">
                            <Sparkles className="w-5 h-5 text-black" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">
                            SkillForged
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Create an account</h1>
                    <p className="text-zinc-400 mt-2">
                        Start your AI learning journey today
                    </p>
                </div>

                <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-white">Sign Up</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Enter your details to create your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    required
                                    className="bg-black/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0 h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="bg-black/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0 h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="bg-black/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0 h-11"
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-zinc-300">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="bg-black/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0 h-11"
                                    minLength={6}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Create Account
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-zinc-400">
                            Already have an account?{" "}
                            <Link href="/auth/signin" className="text-white hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
