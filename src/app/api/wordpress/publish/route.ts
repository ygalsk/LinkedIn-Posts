// app/api/wordpress/publish/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.access_token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId, title, content } = await request.json();

    if (!siteId) {
      return NextResponse.json(
        { error: "No WordPress site selected" }, 
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://public-api.wordpress.com/rest/v1.1/sites/${siteId}/posts/new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          status: 'publish',
        }),
      }
    );

    const post = await response.json();
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    );
  }
}