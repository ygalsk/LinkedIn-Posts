import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { LinkedInClient } from "@/lib/linkedin-client";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Convert string ID to ObjectId
    const userId = new ObjectId(session.user.id);

    console.log("Searching for account with:", {
      userId: userId,
      provider: "linkedin"
    });

    const account = await db.collection("accounts").findOne({
      userId: userId,
      provider: "linkedin",
    });

    console.log("Found account:", account);

    if (!account?.access_token) {
      return NextResponse.json({ error: "No linked LinkedIn account found" }, { status: 404 });
    }

    const postRequest: LinkedIn.LinkedInPostRequest = await request.json();
    if (!postRequest.commentary && (!postRequest.mediaItems || postRequest.mediaItems.length === 0)) {
      return NextResponse.json({ error: "Post must contain either commentary or media" }, { status: 400 });
    }

    const linkedInClient = new LinkedInClient(account.access_token);
    const userInfo = await linkedInClient.getUserInfo();
    // Update the client with the user ID
    linkedInClient.userId = userInfo.sub;
    const result = await linkedInClient.createPost(postRequest);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating LinkedIn post:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}