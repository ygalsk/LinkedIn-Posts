import { NextRequest, NextResponse } from "next/server";
import { FacebookClient } from "@/lib/facebook-client";

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.FACEBOOK_ACCESSTOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "Facebook access token not configured" }, { status: 500 });
    }

    const { pageId, content, imageUrl } = await request.json();
    if (!pageId || !content) {
      return NextResponse.json({ error: "Page ID and content are required" }, { status: 400 });
    }

    const client = new FacebookClient(accessToken);
    const result = await client.createPost(pageId, content, imageUrl);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating Facebook post:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}