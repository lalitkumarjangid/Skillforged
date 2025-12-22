import { auth } from "@server/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@client/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@client/components/ui/card";
import { Separator } from "@client/components/ui/separator";

export default async function SettingsPage() {
    const session = await auth();
    const user = session?.user;

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback className="text-xl">{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">Profile Picture</p>
                            <p className="text-sm text-muted-foreground">Provided by your auth provider.</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Display Name</label>
                        <div className="p-2 rounded-md bg-muted/50 border text-sm">
                            {user.name}
                        </div>
                    </div>

                    <div className="grid gap-1">
                        <label className="text-sm font-medium">Email</label>
                        <div className="p-2 rounded-md bg-muted/50 border text-sm">
                            {user.email}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-destructive/20">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Deleting your account will permanently remove all your roadmaps and progress.
                    </p>
                    {/* Placeholder for Delete Account */}
                    <div className="text-sm text-destructive font-medium cursor-not-allowed opacity-50">
                        Delete Account (Coming Soon)
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
