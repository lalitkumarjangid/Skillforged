"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@client/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@client/components/ui/avatar";
import {
    LayoutDashboard,
    Compass,
    Settings,
    LogOut,
    Sparkles,
    User as UserIcon,
    Menu,
    ChevronsUpDown,
    History,
    FolderDot
} from "lucide-react";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@client/components/ui/sheet";
import { useState } from "react";
import { Separator } from "@client/components/ui/separator";

interface SidebarProps {
    user: User;
    className?: string;
}

const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Projects",
        href: "/dashboard/projects",
        icon: FolderDot,
    },
];

export function AppSidebar({ user, className }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={cn("hidden md:flex flex-col w-64 border-r border-white/10 bg-black", className)}>
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-3 mb-8 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black transition-transform group-hover:scale-105">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-bold tracking-tight text-white">SkillForged</span>
                        <span className="text-[10px] text-zinc-500 font-medium">BETA</span>
                    </div>
                </Link>

                <div className="space-y-1">
                    <p className="px-3 text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Menu</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start gap-3 h-10 px-3 text-sm font-medium text-zinc-400 transition-all hover:text-white hover:bg-white/5",
                                        isActive && "bg-white/10 text-white hover:bg-white/10"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Button>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="mt-auto p-4 border-t border-white/10 bg-black">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                    <Avatar className="h-9 w-9 border border-white/10">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback className="bg-zinc-900 text-zinc-400 text-xs">
                            {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user.name || "User"}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                            {user.email}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => signOut()}
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </aside>
    );
}


export function MobileSidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white">
                    <Menu className="w-5 h-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col bg-black border-r border-white/10">
                <SheetHeader className="p-6 text-left border-b border-white/10">
                    <Link href="/dashboard" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black transition-transform group-hover:scale-105">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-bold tracking-tight text-white">SkillForged</span>
                            <span className="text-[10px] text-zinc-500 font-medium">BETA</span>
                        </div>
                    </Link>
                </SheetHeader>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    <p className="px-3 text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Menu</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start gap-3 h-10 px-3 text-sm font-medium text-zinc-400 transition-all hover:text-white hover:bg-white/5",
                                        isActive && "bg-white/10 text-white hover:bg-white/10"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 bg-black mt-auto">
                    <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-white/5">
                        <Avatar className="h-9 w-9 border border-white/10">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback className="bg-zinc-900 text-zinc-400 text-xs">
                                {user.name?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.name || "User"}</p>
                            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-zinc-400 hover:text-white hover:bg-white/5 text-xs h-9"
                        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Log Out
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
