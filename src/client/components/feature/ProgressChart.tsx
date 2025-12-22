"use client";

import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";
import { IRoadmap } from "@server/models/Roadmap";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@client/components/ui/card";

interface ProgressChartProps {
    roadmaps: IRoadmap[];
}

export function ProgressChart({ roadmaps }: ProgressChartProps) {
    // Transform data for chart
    const data = roadmaps.map((r) => ({
        name: r.title.length > 15 ? r.title.substring(0, 15) + "..." : r.title,
        fullName: r.title,
        progress: r.progress,
        fill: "hsl(var(--primary))",
    }));

    // Calculate overall stats
    const totalRoadmaps = roadmaps.length;
    const completed = roadmaps.filter(r => r.progress === 100).length;
    const inProgress = totalRoadmaps - completed;

    if (totalRoadmaps === 0) {
        return (
            <Card className="col-span-2 bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white">Learning Activity</CardTitle>
                    <CardDescription className="text-zinc-400">Your progress over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-zinc-500 border border-dashed border-zinc-800 rounded-md m-6 bg-black/20">
                    No active roadmaps to display. Start a new journey!
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full bg-zinc-900/50 border-zinc-800">
            <CardHeader>
                <CardTitle className="text-white">Learning Curve</CardTitle>
                <CardDescription className="text-zinc-400">
                    You have {inProgress} active and {completed} completed roadmaps.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                            <XAxis
                                dataKey="name"
                                stroke="#71717a"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#71717a"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip
                                cursor={{ fill: "#27272a" }}
                                contentStyle={{
                                    backgroundColor: "#000000",
                                    borderColor: "#27272a",
                                    borderRadius: "8px",
                                    color: "#ffffff"
                                }}
                                itemStyle={{ color: "#ffffff" }}
                                labelStyle={{ color: "#a1a1aa" }}
                            />
                            <Bar
                                dataKey="progress"
                                radius={[4, 4, 0, 0]}
                                className="fill-white"
                                maxBarSize={50}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
