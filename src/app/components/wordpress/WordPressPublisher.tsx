// components/WordPressPublisher.tsx
"use client";

import { useState } from 'react';
import WordPressSiteSelector from './WordPressSiteSelector';

interface Site {
  ID: number;
  name: string;
  URL: string;
}

interface Post {
  title: string;
  content: string;
}

export default function WordPressPublisher() {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [post, setPost] = useState<Post>({ title: '', content: '' });
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!selectedSite) {
      setError('Please select a WordPress site first');
      return;
    }

    try {
      setPublishing(true);
      setError(null);
      
      const response = await fetch('/api/wordpress/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId: selectedSite.ID,
          title: post.title,
          content: post.content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish post');
      }

      const result = await response.json();
      // Handle successful publish
      setPost({ title: '', content: '' }); // Clear form
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <WordPressSiteSelector onSiteSelect={setSelectedSite} />
      
      {selectedSite && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-4">
            Publishing to: {selectedSite.name}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block mb-2">
                Post Title
              </label>
              <input
                id="title"
                type="text"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label htmlFor="content" className="block mb-2">
                Post Content
              </label>
              <textarea
                id="content"
                value={post.content}
                onChange={(e) => setPost({ ...post, content: e.target.value })}
                className="w-full p-2 border rounded min-h-[200px]"
              />
            </div>

            {error && (
              <div className="text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {publishing ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}