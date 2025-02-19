// app/api/wordpress/publish/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { WordPressClient } from "@/lib/wordpress-client";

export async function POST(request: Request) {
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

    const { siteId, title, content, pageId, featured_media } = await request.json();

    if (!siteId || !title || !content) {
      return NextResponse.json(
        { error: "Site ID, title and content are required" }, 
        { status: 400 }
      );
    }

    const wpClient = new WordPressClient(
      'https://public-api.wordpress.com',
      account.access_token
    );
    const post = await wpClient.createPost(siteId, {
      title,
      content,
      status: 'publish',
      parent_id: pageId,
      featured_media
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create post' },
      { status: 500 }
    );
  }
}