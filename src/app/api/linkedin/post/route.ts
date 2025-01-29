import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { LinkedInClient } from "@/lib/linkedin-client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.access_token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postRequest: LinkedIn.LinkedInPostRequest = await request.json();
    if (!postRequest.commentary && (!postRequest.mediaItems || postRequest.mediaItems.length === 0)) {
      return NextResponse.json({ error: "Post must contain either commentary or media" }, { status: 400 });
    }
    const client = new LinkedInClient(session.access_token);
    const userInfo = await client.getUserInfo();
    // Update the client with the user ID
    client.userId = userInfo.sub;
    const result = await client.createPost(postRequest);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating LinkedIn post:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}