/**
 * POST /api/blob/upload — Vercel Blob client-upload token (architecture §8.3).
 * FLOW: Clerk auth → rate limit → pathname must be ingest/{userId}/*.pdf → handleUpload.
 */

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ensureUser } from "@/lib/auth/ensure-user";
import { limits } from "@/lib/config/limits";
import { isValidIngestPathname } from "@/lib/domain/ingest-path";
import { checkRateLimit } from "@/lib/http/rate-limit";

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error: {
          code: "CONFIG_ERROR",
          message: "BLOB_READ_WRITE_TOKEN is not configured.",
        },
      },
      { status: 500 },
    );
  }

  const session = await auth();
  if (!session.userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Sign in to continue." } },
      { status: 401 },
    );
  }

  const clerk = await currentUser();
  const email =
    clerk?.primaryEmailAddress?.emailAddress ??
    clerk?.emailAddresses[0]?.emailAddress;
  if (!email) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHENTICATED",
          message: "Email required on the Clerk account.",
        },
      },
      { status: 401 },
    );
  }

  const local = await ensureUser({
    clerkUserId: session.userId,
    email,
    name: clerk?.fullName ?? clerk?.firstName ?? null,
  });

  const rl = checkRateLimit(
    `upload-token:${local.id}`,
    limits.UPLOAD_TOKENS_PER_HOUR,
    60 * 60 * 1000,
  );
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Upload token rate limit exceeded.",
        },
      },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!isValidIngestPathname(pathname, local.id)) {
          throw new Error(
            "pathname must be ingest/{userId}/{file}.pdf under your account.",
          );
        }
        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: limits.MAX_PDF_BYTES,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({ userId: local.id }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        void blob;
        void tokenPayload;
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_FAILED",
          message: err instanceof Error ? err.message : String(err),
        },
      },
      { status: 400 },
    );
  }
}
