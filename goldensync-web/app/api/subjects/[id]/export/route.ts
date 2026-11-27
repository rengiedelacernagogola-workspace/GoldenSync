// WHAT: Download subject data as CSV or JSON attachment. SCREEN: Export page download button.

/**
 * GET /api/subjects/:id/export?format=csv|json — owner export (Appendix B).
 */

import { unauthenticated, withApi, validationFailed } from "@/lib/http";
import { exportSubject, type ExportFormat } from "@/lib/services/export-subject";

// WHAT: GET — file response; format query csv|json.
export const GET = withApi({ auth: "required", rateLimit: "read" }, async (ctx) => {
  if (!ctx.userId) throw unauthenticated();

  const url = new URL(ctx.request.url);
  const format = (url.searchParams.get("format") ?? "csv") as ExportFormat;
  if (format !== "csv" && format !== "json") {
    throw validationFailed("format must be csv or json.");
  }

  const exported = await exportSubject(ctx.userId, ctx.params.id, format);
  return new Response(exported.body, {
    status: 200,
    headers: {
      "Content-Type": exported.contentType,
      "Content-Disposition": `attachment; filename="${exported.filename}"`,
      "X-Content-Type-Options": "nosniff",
      "X-Request-Id": ctx.requestId,
    },
  });
});
