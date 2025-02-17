// app/api/wordpress/media/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.access_token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const siteId = formData.get('siteId');
    const file = formData.get('file') as File;
    const title = formData.get('title');

    if (!siteId || !file) {
      return NextResponse.json({ error: "Site ID and file are required" }, { status: 400 });
    }

    // Create a new FormData instance for the WordPress API
    const mediaFormData = new FormData();
    mediaFormData.append('media[]', file);
    
    if (title) {
      mediaFormData.append('attrs[0][title]', title as string);
    }

    const response = await fetch(
      `https://public-api.wordpress.com/rest/v1.1/sites/${siteId}/media/new`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: mediaFormData,
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}