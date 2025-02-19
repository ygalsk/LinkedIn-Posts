import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { WordPressClient } from "@/lib/wordpress-client";

export async function GET(req: Request) {
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
      provider: "wordpress",
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: "No linked wordpress account found" }, { status: 404 });
    }
          // Get siteId from URL parameters
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json({ error: "Site ID is required" }, { status: 400 });
    }

    const wpClient = new WordPressClient(
      'https://public-api.wordpress.com',
      account.access_token
    );
    const pages = await wpClient.getPages(Number(siteId));

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Pages fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}