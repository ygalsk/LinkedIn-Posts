// app/api/wordpress/media/route.ts
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
      userId,
      provider: "wordpress",
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: "No linked wordpress account found" }, { status: 404 });
    }

    const formData = await request.formData();
    const siteId = formData.get('siteId');
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!siteId || !file) {
      return NextResponse.json({ error: "Site ID and file are required" }, { status: 400 });
    }

    const wpClient = new WordPressClient(
      'https://public-api.wordpress.com',
      account.access_token
    );
    const mediaData = await wpClient.uploadMedia(file, Number(siteId), title);

    return NextResponse.json(mediaData);
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload media' },
      { status: 500 }
    );
  }
}