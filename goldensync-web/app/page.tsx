// WHAT: Server-side login check and redirect helper. RISK: High — security routing.
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Root — signed-in → dashboard; signed-out → Clerk sign-in (CDEC-016).
 * `instant = false` — auth() needs cookies (cacheComponents).
 */
// WHAT: Next.js route config. HOW: false means this page waits for cookies so auth() works. KEEP: Do not set true without developer. RISK: High
export const instant = false;

// WHAT: Home route at URL "/". HOW: If user is signed in, send to dashboard; else send to sign-in. SCREEN: User never sees a page here — instant redirect. RISK: High
export default async function Home() {
  const { userId } = await auth();
  redirect(userId ? "/dashboard" : "/sign-in");
}
