// WHAT: Validate delete-account confirmation (typed email match).
// HOW: deleteAccountSchema compares email string.
// SCREEN: Delete account danger zone.
// EDIT: When Clerk reverification lands, extend schema here.
// KEEP: Must match signed-in user email — step-up auth.
// RISK: High — authentication; typo in schema blocks legitimate deletes or worse.

/**
 * Zod schemas — account delete confirmation (step-up stub).
 */

import { z } from "zod";

export const deleteAccountSchema = z.object({
  /** Must match the signed-in account email (step-up until Clerk reverification). */
  confirmEmail: z.string().trim().email(),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
