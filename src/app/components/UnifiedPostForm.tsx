"use client";

import { useState, useEffect } from "react";
import LinkedInPostForm from "./linkedin/LinkedInPostForm";

interface PlatformOption {
  id: string;
  name: string;
}

interface PostData {
  facebookPage?: string;
  linkedin?: boolean;
  wordpressSite?: string;
  wordpressPage?: string;
  content: string;
  media?: string;
}

interface PostResults {
  facebook?: { success: boolean; error?: string };
  linkedin?: { success: boolean; error?: string };
  wordpress?: { success: boolean; error?: string };
}

export default function UnifiedPostForm() {
  const [platforms, setPlatforms] = useState<{
    facebook: PlatformOption[];
  }>({
    facebook: [],
  });

  const [postData, setPostData] = useState<PostData>({ content: "" });
  const [loading, setLoading] = useState(false);
  const [postResults, setPostResults] = useState<PostResults>({});

  useEffect(() => {
    async function fetchPlatforms() {
      try {
        const [fbRes] = await Promise.all([
          fetch("/api/facebook/pages"),
        ]);

        const [fbData] = await Promise.all([
          fbRes.json(),
        ]);

        setPlatforms({
          facebook: fbData.data || [],
        });
      } catch (err) {
        console.error("Failed to load platforms:", err);
      }
    }

    fetchPlatforms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPostResults({});

    const results: PostResults = {};

    try {
      if (postData.facebookPage) {
        try {
          const fbResponse = await fetch("/api/facebook/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pageId: postData.facebookPage, content: postData.content }),
          });
          
          if (!fbResponse.ok) throw new Error("Facebook post failed");
          results.facebook = { success: true };
        } catch (error: unknown) {
          console.error('Facebook post error:', error);
          results.facebook = { success: false, error: "Failed to post to Facebook" };
        }
      }

      if (postData.linkedin) {
        try {
          const linkedinResponse = await fetch("/api/linkedin/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ commentary: postData.content }),
          });
          
          if (!linkedinResponse.ok) throw new Error("LinkedIn post failed");
          results.linkedin = { success: true };
        } catch (error: unknown) {
          console.error('LinkedIn post error:', error);
          results.linkedin = { success: false, error: "Failed to post to LinkedIn" };
        }
      }

    } finally {
      setPostResults(results);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Create a Post</h2>
    <div>

    <LinkedInPostForm />
    </div>

      <div className="mb-4">
        <h3 className="font-semibold">Select Platforms:</h3>

        <div className="mt-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!postData.facebookPage}
              onChange={(e) => {
                const checked = e.target.checked;
                setPostData(prev => ({
                  ...prev,
                  facebookPage: checked ? platforms.facebook[0]?.id : undefined
                }));
              }}
            />
            Post to Facebook
          </label>

          {postData.facebookPage && platforms.facebook.length > 0 && (
            <select
              value={postData.facebookPage}
              onChange={(e) => setPostData(prev => ({ ...prev, facebookPage: e.target.value }))}
              className="w-full p-2 border rounded-md mt-2"
            >
              {platforms.facebook.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mt-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!postData.linkedin}
              onChange={(e) => setPostData(prev => ({ ...prev, linkedin: e.target.checked }))}
            />
            Post to LinkedIn
          </label>
        </div>
      </div>

      <div className="mb-3">
        {Object.entries(postResults).map(([platform, result]) => (
          result && (
            <div 
              key={platform}
              className={`mb-2 p-2 rounded ${result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {result.success ? (
                `Successfully posted to ${platform}`
              ) : (
                result.error || `Failed to post to ${platform}`
              )}
            </div>
          )
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
      >
        {loading ? "Publishing..." : "Publish Post"}
      </button>
    </form>
  );
}