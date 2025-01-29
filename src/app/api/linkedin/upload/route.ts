import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { LinkedInClient } from "@/lib/linkedin-client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.access_token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const client = new LinkedInClient(session.access_token);
    const userInfo = await client.getUserInfo();
    
    // Update the client with the user ID
    client.userId = userInfo.sub;
    
    const asset = await client.uploadImage(file);
    
    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}