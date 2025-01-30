import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.access_token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    console.log("session", session);
      // Your WordPress API call here
      const response = await fetch("https://public-api.wordpress.com/rest/v1.1/me/sites", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
  
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  }