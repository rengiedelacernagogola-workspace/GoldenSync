/**
 * Class Policies — redirect to College Faculty (merged 50/50 layout).
 * Old bookmarks / links land on Faculty + Class policies.
 */

import { redirect } from "next/navigation";

export default async function PoliciesRedirectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  redirect(`/subjects/${subjectId || "ite-14"}/faculty`);
}
