/**
 * Zod schemas — account delete confirmation (step-up stub).
 */

import { z } from "zod";

export const deleteAccountSchema = z.object({
  /** Must match the signed-in account email (step-up until Clerk reverification). */
  confirmEmail: z.string().trim().email(),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
