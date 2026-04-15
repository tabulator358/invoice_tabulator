import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

export async function POST(req: NextRequest) {
  const { name, data, dir } = await req.json() as { name: string; data: string; dir: string };

  if (!name || !data || !dir) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  mkdirSync(dir, { recursive: true });
  const safeName = name.replace(/[^a-zA-Z0-9_\-]/g, "_") + ".png";
  const destPath = join(dir, safeName);

  // data je base64 PNG (bez prefixu data:image/png;base64,)
  writeFileSync(destPath, Buffer.from(data, "base64"));
  return NextResponse.json({ ok: true, path: destPath });
}
