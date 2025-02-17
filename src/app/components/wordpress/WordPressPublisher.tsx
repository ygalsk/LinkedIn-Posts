// components/WordPressPublisher.tsx
"use client";

import { useState } from 'react';
import WordPressSiteSelector from './WordPressSiteSelector';
import WordPressImageUploader from './WordPressImageUploader';

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

interface Post {
 title: string;
 content: string;
}

interface PostMedia {
 ID: number;
 URL: string;
 title: string;
}

export default function WordPressPublisher() {
 const [selectedSite, setSelectedSite] = useState<Site | null>(null);
 const [selectedPage, setSelectedPage] = useState<Page | null>(null);
 const [post, setPost] = useState<Post>({ title: '', content: '' });
 const [selectedMedia, setSelectedMedia] = useState<PostMedia | null>(null);
 const [publishing, setPublishing] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState<string | null>(null);

 const handlePublish = async () => {
   if (!selectedSite) {
     setError('Please select a WordPress site first');
     return;
   }

   if (!post.title || !post.content) {
     setError('Please provide both title and content for the post');
     return;
   }

   try {
     setPublishing(true);
     setError(null);
     setSuccess(null);
     
     const response = await fetch('/api/wordpress/publish', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         siteId: selectedSite.ID,
         title: post.title,
         content: post.content,
         pageId: selectedPage?.ID, // Include if posting to a specific page
       }),
     });

     if (!response.ok) {
       throw new Error('Failed to publish post');
     }

     const result = await response.json();
     setSuccess('Post published successfully!');
     setPost({ title: '', content: '' }); // Clear form
     setSelectedMedia(null); // Clear media selection
   } catch (err) {
     setError(err instanceof Error ? err.message : 'Failed to publish post');
   } finally {
     setPublishing(false);
   }
 };
 
 const handleMediaUpload = (mediaData: PostMedia) => {
  setSelectedMedia(mediaData);
  // Add the image with proper WordPress alignment and size classes
  const imageHtml = `
<!-- wp:image {"id":${mediaData.ID},"sizeSlug":"large","align":"center"} -->
<figure class="wp-block-image aligncenter size-large">
  <img src="${mediaData.URL}" alt="${mediaData.title}" class="wp-image-${mediaData.ID}"/>
  ${mediaData.title ? `<figcaption>${mediaData.title}</figcaption>` : ''}
</figure>
<!-- /wp:image -->

`;
  
  setPost(prev => ({
    ...prev,
    content: prev.content + imageHtml
  }));
};

 return (
   <div className="max-w-2xl mx-auto p-4">
     <h2 className="text-2xl font-bold mb-6">Create WordPress Post</h2>

     <div className="space-y-6">
       {/* Site and Page Selection */}
       <div className="bg-white p-4 rounded-lg shadow">
         <WordPressSiteSelector 
           onSiteSelect={setSelectedSite} 
           onPageSelect={setSelectedPage} 
         />
       </div>

       {selectedSite && (
         <div className="bg-white p-4 rounded-lg shadow space-y-6">
           <h3 className="text-lg font-semibold">
             Publishing to: {selectedSite.name}
             {selectedPage && ` > ${selectedPage.title}`}
           </h3>
           
           {/* Image Upload Section */}
           <div>
             <h4 className="font-medium mb-2">Add Images</h4>
             <WordPressImageUploader
               siteId={selectedSite.ID}
               onUploadComplete={handleMediaUpload}
             />
           </div>

           {/* Post Form */}
           <div className="space-y-4">
             <div>
               <label htmlFor="title" className="block mb-2 font-medium">
                 Post Title
               </label>
               <input
                 id="title"
                 type="text"
                 value={post.title}
                 onChange={(e) => setPost({ ...post, title: e.target.value })}
                 className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 placeholder="Enter post title"
               />
             </div>

             <div>
               <label htmlFor="content" className="block mb-2 font-medium">
                 Post Content
               </label>
               <textarea
                 id="content"
                 value={post.content}
                 onChange={(e) => setPost({ ...post, content: e.target.value })}
                 className="w-full p-2 border rounded min-h-[200px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 placeholder="Enter post content"
               />
             </div>

             {/* Error and Success Messages */}
             {error && (
               <div className="p-3 bg-red-100 text-red-700 rounded">
                 {error}
               </div>
             )}

             {success && (
               <div className="p-3 bg-green-100 text-green-700 rounded">
                 {success}
               </div>
             )}

             {/* Publish Button */}
             <button
               onClick={handlePublish}
               disabled={publishing || !selectedSite}
               className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {publishing ? 'Publishing...' : 'Publish Post'}
             </button>
           </div>
         </div>
       )}
     </div>
   </div>
 );
}