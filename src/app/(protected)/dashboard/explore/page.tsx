import { Zap } from "lucide-react";
import { Button } from "@client/components/ui/button";

export default function ExplorePage() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Community Roadmaps</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
                Explore roadmaps created by the SkillForged community.
                This feature is coming soon!
            </p>
            <Button variant="outline" disabled>Coming Soon</Button>
        </div>
    );
}
