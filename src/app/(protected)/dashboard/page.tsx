import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getRoadmaps } from "@server/actions/db-actions";
import DashboardContent from "./DashboardContent";
import { auth } from "@server/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const { roadmaps, error } = await getRoadmaps();

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen text-destructive">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="h-full">
            <Suspense
                fallback={
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                }
            >
                <DashboardContent
                    initialRoadmaps={roadmaps || []}
                    user={session.user}
                />
            </Suspense>
        </div>
    );
}
