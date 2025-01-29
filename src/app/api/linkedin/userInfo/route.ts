import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { LinkedInClient } from "@/lib/linkedin-client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.access_token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = new LinkedInClient(session.access_token);
    const data = await client.getUserInfo();
    return NextResponse.json({ sub: data.sub });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}