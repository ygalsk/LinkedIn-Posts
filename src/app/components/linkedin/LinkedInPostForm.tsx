"use client";

import { useState } from "react";

export default function LinkedInPostForm() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<string[]>([]);

  async function handleImageUpload(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/linkedin/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.asset;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          commentary: content,
          mediaItems
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setContent("");
      setMediaItems([]);
      alert("Posted successfully to LinkedIn!");
    } catch (err) {
      console.error("Form submission error:", err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const asset = await handleImageUpload(file);
      setMediaItems([...mediaItems, asset]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your LinkedIn post..."
        className="w-full p-3 border rounded-md mb-3 min-h-[120px]"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-3"
      />
      {mediaItems.length > 0 && (
        <div className="mb-3">
          {mediaItems.length} image(s) attached
        </div>
      )}
      <button 
        type="submit" 
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isLoading ? "Posting..." : "Post to LinkedIn"}
      </button>
      {error && <div className="text-red-500 mb-3">{error}</div>}
    </form>
  );
}