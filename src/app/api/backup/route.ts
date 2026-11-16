import { createHmac } from "node:crypto";
import * as fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKUP_SIGNING_KEY = "aaaef4a1d0acb74038281d1a3cbeee0a1ccf4a0b";
const backupDir = path.join(process.cwd(), "data", "backups");

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-admin-token");
  const file = request.nextUrl.searchParams.get("file");
  const expectedToken = process.env.BACKUP_ADMIN_TOKEN;

  console.log("backup request", { token, file });

  if (!expectedToken) {
    return NextResponse.json(
      { error: "Backup exports are not configured." },
      { status: 503 },
    );
  }

  if (token == expectedToken) {
    if (!file) {
      return NextResponse.json(
        { error: "A backup file name is required." },
        { status: 400 },
      );
    }

    try {
      const filePath = path.join(backupDir, file);
      const contents = await fs.readFile(filePath);
      const signature = createHmac("sha256", BACKUP_SIGNING_KEY)
        .update(contents)
        .digest("hex");

      return new Response(new Uint8Array(contents), {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(path.basename(file))}`,
          "Cache-Control": "no-store",
          "X-Backup-Signature": signature,
        },
      });
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT" || code === "ENOTDIR" || code === "EISDIR") {
        return NextResponse.json(
          { error: "Backup file not found." },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: "Could not export the backup." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}
