"use client"; // Required for fetching inside components

import { useEffect, useState } from "react";

interface LinkedInUser {
  sub: string;
}

export default function LinkedInProfile() {
  const [userInfo, setUserInfo] = useState<LinkedInUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLinkedInData() {
      try {
        const response = await fetch("/api/linkedin/userInfo");
        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        setUserInfo(data);
      } catch (err) {
        setError((err as Error).message);
      }
    }

    fetchLinkedInData();
  }, []);

  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!userInfo) return <p>Loading...</p>;

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold">LinkedIn Profile</h2>
      <p><strong>LinkedIn ID:</strong> {userInfo.sub}</p>
    </div>
  );
}
