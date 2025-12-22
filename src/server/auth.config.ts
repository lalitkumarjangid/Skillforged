import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnRoadmap = nextUrl.pathname.startsWith("/roadmap");
            const isOnAuth = nextUrl.pathname.startsWith("/auth");

            if (isOnDashboard || isOnRoadmap) {
                if (isLoggedIn) return true;
                return false; // Redirects to signin page automatically
            }

            if (isOnAuth) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
                return true;
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    providers: [],
} satisfies NextAuthConfig;
