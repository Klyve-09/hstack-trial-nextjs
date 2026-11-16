import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("pn_user")?.value || "guest";

  return NextResponse.json(
    {
      userId,
      heading: userId === "guest" ? "Your notes" : `Notes for ${userId}`,
      storage: "localStorage",
      description:
        "Notes and pins are saved in this browser. Open your items to see counts and pinned notes.",
    },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}
