// components/WordPressSiteSelector.tsx
"use client";

import { useState, useEffect } from 'react';

interface Site {
  ID: number;
  name: string;
  URL: string;
}

interface WordPressSiteSelectorProps {
  onSiteSelect: (site: Site | null) => void;
}

export default function WordPressSiteSelector({ onSiteSelect }: WordPressSiteSelectorProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSites() {
      try {
        setLoading(true);
        const response = await fetch('/api/wordpress/sites');
        if (!response.ok) {
          throw new Error('Failed to fetch sites');
        }
        const data = await response.json();
        // Assuming the API returns { sites: Site[] }
        setSites(data.sites || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sites');
      } finally {
        setLoading(false);
      }
    }
    fetchSites();
  }, []);

  const handleSiteChange = (siteId: string) => {
    if (!siteId) {
      onSiteSelect(null);
      return;
    }
    
    const site = sites.find(s => s.ID === Number(siteId));
    if (site) {
      onSiteSelect(site);
    }
  };

  if (loading) {
    return <div>Loading sites...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <label htmlFor="site-select" className="block mb-2">
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
  );
}