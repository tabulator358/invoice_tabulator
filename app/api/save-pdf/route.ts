import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export async function POST(req: NextRequest) {
  const { name, data, dir } = await req.json() as { name: string; data: string; dir?: string };

  if (!name || !data) {
    return NextResponse.json({ error: "missing name or data" }, { status: 400 });
  }

  const safeName = name.replace(/[^a-zA-Z0-9_\-]/g, "_") + ".pdf";
  const destDir = dir ?? join(homedir(), "Desktop");
  mkdirSync(destDir, { recursive: true });
  const destPath = join(destDir, safeName);

  writeFileSync(destPath, Buffer.from(data, "base64"));
  return NextResponse.json({ ok: true, path: destPath });
}
