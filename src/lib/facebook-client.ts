export class FacebookClient {
    private baseUrl = 'https://graph.facebook.com/v19.0';
    
    constructor(private accessToken: string) {}
  
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
      const url = `${this.baseUrl}${endpoint}?access_token=${this.accessToken}`;
      console.log('Making request to:', url);
  
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
  
      const data = await response.json();
      console.log('Response:', data);
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Facebook API error');
      }
  
      return data;
    }
  
    async getPages() {
      return this.request<{ data: Array<{ id: string; name: string }> }>('/me/accounts');
    }
    
    async createPost(pageId: string, content: string, imageUrl?: string) {
      const pageAccessToken = "EAAI8HvbvFL8BOxUwcyRUeBeW7mYEe9xa20hRLq3HMzdez2AIgRNll0MCuJHqk9hZCSy74ZCG1WyM190eXicYb9zN3AQPOcuFsg7ObZBM8j6oq0HNmWgCuorYuIebTRos0fMEAN3K3M7447gpHnOyKWe1RAqYckUbrSnhQsbhtbINoZB97n1Sh34D4i8umveN4mKOy2dfrm5ELU3y04biOAZA6JQZDZD";
    
      const endpoint = imageUrl ? `/${pageId}/photos` : `/${pageId}/feed`;
    
      return this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          message: content,
          url: imageUrl,
          access_token: pageAccessToken, // Explicitly pass the Page Access Token
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }