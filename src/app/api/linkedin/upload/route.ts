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

    const account = await db.collection("accounts").findOne({
      userId: userId,  // Use the ObjectId here
      provider: "linkedin",
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: "No linked LinkedIn account found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const linkedInClient = new LinkedInClient(account.access_token);
    const userInfo = await linkedInClient.getUserInfo();
    // Update the client with the user ID
    linkedInClient.userId = userInfo.sub;
    
    const asset = await linkedInClient.uploadImage(file);
    
    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}