import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Root — signed-in → dashboard; signed-out → Clerk sign-in (CDEC-016).
 * `instant = false` — auth() needs cookies (cacheComponents).
 */
export const instant = false;

export default async function Home() {
  const { userId } = await auth();
  redirect(userId ? "/dashboard" : "/sign-in");
}
