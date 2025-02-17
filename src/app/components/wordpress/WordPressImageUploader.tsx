// components/WordPressImageUploader.tsx
"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  siteId: number;
  onUploadComplete: (mediaData: any) => void;
}

export default function WordPressImageUploader({ siteId, onUploadComplete }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Please select an image first');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('siteId', siteId.toString());
      formData.append('title', file.name);

      const response = await fetch('/api/wordpress/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      onUploadComplete(data);
      
      // Clear the input and preview
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileSelect}
          className="flex-1"
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !preview}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {error && (
        <div className="text-red-600">
          {error}
        </div>
      )}

      {preview && (
        <div className="relative w-full h-48">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}