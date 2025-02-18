"use client";

import { useState, useEffect } from "react";

interface FacebookPage {
  id: string;
  name: string;
}

export default function FacebookPostForm() {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPages() {
      try {
        const response = await fetch("/api/facebook/pages");
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Received data:', data);

        if (!response.ok) throw new Error(data.error);
        
        if (!data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format from Facebook API');
        }

        setPages(data.data);
        if (data.data.length > 0) {
          setSelectedPage(data.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching pages:', err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPages();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/facebook/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: selectedPage,
          content
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setContent("");
      alert("Posted successfully to Facebook!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <div>Loading pages...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (pages.length === 0) {
    return <div>No Facebook pages found. Make sure you have admin access to at least one page.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
      <select
        value={selectedPage}
        onChange={(e) => setSelectedPage(e.target.value)}
        className="w-full p-2 border rounded-md mb-3"
        required
      >
        {pages.map(page => (
          <option key={page.id} value={page.id}>
            {page.name}
          </option>
        ))}
      </select>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your Facebook post..."
        className="w-full p-3 border rounded-md mb-3 min-h-[120px]"
        required
      />

      {error && <div className="text-red-500 mb-3">{error}</div>}
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isLoading ? "Posting..." : "Post to Facebook"}
      </button>
    </form>
  );
}