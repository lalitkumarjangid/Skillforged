import { Suspense } from "react";
import { getRoadmaps } from "@server/actions/db-actions";
import { RoadmapCard } from "@client/components/feature/RoadmapCard";
import { FolderDot, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@server/auth";
import { Button } from "@client/components/ui/button";
import Link from "next/link";
import { ProjectsContent } from "./ProjectsContent";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
    const session = await auth();
    if (!session?.user) redirect("/auth/signin");

    const { roadmaps } = await getRoadmaps();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <FolderDot className="h-6 w-6 text-white" />
                        </div>
                        My Projects
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Manage and track your learning roadmaps.
                    </p>
                </div>
                <Link href="/dashboard">
                    <Button className="bg-white text-black hover:bg-zinc-200 font-medium">
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </Link>
            </div>

            <Suspense fallback={<div className="text-zinc-500">Loading projects...</div>}>
                <ProjectsContent initialRoadmaps={roadmaps || []} />
            </Suspense>
        </div>
    );
}
