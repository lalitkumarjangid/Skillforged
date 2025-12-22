"use client";

import { MobileSidebar } from "./AppSidebar";
import type { User } from "next-auth";

interface AppHeaderProps {
    user: User;
}

export function AppHeader({ user }: AppHeaderProps) {
    return (
        <header className="sticky top-0 z-30 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 md:hidden">
            <div className="container flex h-14 items-center px-4">
                <MobileSidebar user={user} />
                <div className="mr-4 hidden md:flex">
                    <span className="font-semibold text-sm text-white">SkillForged</span>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">

                </div>
            </div>
        </header>
    );
}
