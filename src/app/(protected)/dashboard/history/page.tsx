import { Suspense } from "react";
import { getRoadmaps } from "@server/actions/db-actions";
import { RoadmapCard } from "@client/components/feature/RoadmapCard";
import { History, LayoutList } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@server/auth";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
    const session = await auth();
    if (!session?.user) redirect("/auth/signin");

    const { roadmaps } = await getRoadmaps();

    // Filter completed roadmaps
    const completedRoadmaps = roadmaps?.filter(r => r.progress === 100) || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <History className="h-6 w-6" />
                    History
                </h1>
                <p className="text-muted-foreground">
                    Your completed learning journeys.
                </p>
            </div>

            {completedRoadmaps.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {completedRoadmaps.map((roadmap) => (
                        <RoadmapCard
                            key={roadmap._id.toString()}
                            roadmap={roadmap}
                        // No delete handler here to keep history safe? Or allow delete?
                        // Let's not pass delete to history view for now to distinguish it.
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg border-dashed bg-muted/20">
                    <LayoutList className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No completed roadmaps yet</h3>
                    <p className="text-muted-foreground max-w-sm mt-1">
                        Finish your first roadmap to see it here!
                    </p>
                </div>
            )}
        </div>
    );
}
