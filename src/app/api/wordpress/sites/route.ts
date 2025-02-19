import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

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
      provider: "wordpress",
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: "No linked wordpress account found" }, { status: 404 });
    }
      // Your WordPress API call here
      const response = await fetch("https://public-api.wordpress.com/rest/v1.1/me/sites", {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
        },
      });
  
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  }