import { auth } from "@server/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@client/components/layout/AppSidebar";
import { AppHeader } from "@client/components/layout/AppHeader";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-black">
            {/* Desktop Sidebar */}
            <AppSidebar user={session.user} />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Mobile Header */}
                <AppHeader user={session.user} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-black">
                    {children}
                </main>
            </div>
        </div>
    );
}
