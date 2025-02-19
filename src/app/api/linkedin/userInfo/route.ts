import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { LinkedInClient } from "@/lib/linkedin-client";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";  // Add this import

export async function GET() {
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

    const linkedInClient = new LinkedInClient(account.access_token);
    const data = await linkedInClient.getUserInfo();
    
    return NextResponse.json({ sub: data.sub });
  } catch (error) {
    console.error('Provider API error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}