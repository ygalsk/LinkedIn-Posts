// app/api/wordpress/publish/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.access_token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId, title, content, pageId } = await request.json();

    if (!siteId || !title || !content) {
      return NextResponse.json(
        { error: "Site ID, title and content are required" }, 
        { status: 400 }
      );
    }

    // Note the featured_image parameter if you want to set it as the post thumbnail
    const response = await fetch(
      `https://public-api.wordpress.com/rest/v1.1/sites/${siteId}/posts/new`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          status: 'publish',
          parent_id: pageId || undefined,
          // If you want the first image to be the featured image, you can parse the content and get the first image ID
          featured_image: content.match(/wp-image-(\d+)/)?.[1] || undefined
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to publish post');
    }

    const post = await response.json();
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    );
  }
}