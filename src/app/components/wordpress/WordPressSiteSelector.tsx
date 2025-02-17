"use client";

import { useState, useEffect } from "react";

interface Site {
  ID: number;
  name: string;
  URL: string;
}

interface Page {
  ID: number;
  title: string;
  URL: string;
  parent: number;
  children: Page[];
}

interface WordPressSiteSelectorProps {
  onSiteSelect: (site: Site | null) => void;
  onPageSelect: (page: Page | null) => void;
}

export default function WordPressSiteSelector({ onSiteSelect, onPageSelect }: WordPressSiteSelectorProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingPages, setLoadingPages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available WordPress sites
  useEffect(() => {
    async function fetchSites() {
      try {
        setLoadingSites(true);
        const response = await fetch("/api/wordpress/sites");
        if (!response.ok) {
          throw new Error("Failed to fetch sites");
        }
        const data = await response.json();
        setSites(data.sites || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sites");
      } finally {
        setLoadingSites(false);
      }
    }
    fetchSites();
  }, []);

  // Fetch pages when a site is selected
  useEffect(() => {
    if (!selectedSite) return;
    
    async function fetchPages() {
      try {
        setLoadingPages(true);
        console.log("Fetching pages for site:", selectedSite?.ID);
        const response = await fetch(`/api/wordpress/pages?siteId=${selectedSite?.ID}`);
        if (!response.ok) {
          throw new Error("Failed to fetch pages");
        }
        const data = await response.json();
        // Assuming the API returns { posts: Page[] }
        setPages(data.posts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load pages");
      } finally {
        setLoadingPages(false);
      }
    }
    fetchPages();
  }, [selectedSite]);

  const handleSiteChange = (siteId: string) => {
    if (!siteId) {
      setSelectedSite(null);
      onSiteSelect(null);
      setPages([]);
      return;
    }
    const site = sites.find((s) => s.ID === Number(siteId)) || null;
    setSelectedSite(site);
    onSiteSelect(site);
    setPages([]); // Reset pages when a new site is selected
  };

  const handlePageChange = (pageId: string) => {
    if (!pageId) {
      onPageSelect(null);
      return;
    }
    const page = pages.find((p) => p.ID === Number(pageId)) || null;
    onPageSelect(page);
  };

  if (loadingSites) return <div>Loading sites...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      {/* Site Selection */}
      <div>
        <label htmlFor="site-select" className="block mb-2 font-medium">
          Choose a WordPress site:
        </label>
        <select 
          id="site-select"
          onChange={(e) => handleSiteChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a site</option>
          {sites.map((site) => (
            <option key={site.ID} value={site.ID}>
              {site.name} ({site.URL})
            </option>
          ))}
        </select>
      </div>

      {/* Page Selection */}
      {selectedSite && (
        <div>
          <label htmlFor="page-select" className="block mb-2 font-medium">
            Choose a Page:
          </label>
          {loadingPages ? (
            <div className="text-gray-500">Loading pages...</div>
          ) : pages.length > 0 ? (
            <select 
              id="page-select"
              onChange={(e) => handlePageChange(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a page</option>
              {pages.map((page) => (
                <option key={page.ID} value={page.ID}>
                  {page.title}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-gray-500">No pages found</div>
          )}
        </div>
      )}
    </div>
  );
}