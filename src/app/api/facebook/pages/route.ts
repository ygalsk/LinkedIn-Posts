import { NextResponse } from "next/server";
import { FacebookClient } from "@/lib/facebook-client";

export async function GET() {
  try {
    const accessToken = process.env.FACEBOOK_ACCESSTOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "Facebook access token not configured" }, { status: 500 });
    }

    console.log('Initializing Facebook client...');
    const client = new FacebookClient(accessToken);
    
    console.log('Fetching pages...');
    const pages = await client.getPages();
    console.log('Pages received:', pages);
    
    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching Facebook pages:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}