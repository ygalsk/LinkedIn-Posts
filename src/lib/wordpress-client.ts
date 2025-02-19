import { ErrorCode, WordPressError, UserFriendlyErrors } from './wordpress-errors';

interface PostMedia {
  ID: number;
  URL: string;
  title: string;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export class WordPressClient {
  private static readonly API_VERSION = 'wp/v2';
  
  private _siteUrl: string;
  private _userId?: number;

  constructor(
    private readonly baseUrl: string,
    private readonly accessToken: string,
    userId?: number
  ) {
    if (!baseUrl) {
      throw new WordPressError(
        'WordPress site URL is required',
        ErrorCode.VALIDATION_ERROR,
        400,
        'Invalid WordPress configuration. Site URL is missing.'
      );
    }
    // Ensure baseUrl doesn't end with a slash
    this._siteUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this._userId = userId;

    if (!accessToken) {
      throw new WordPressError(
        'Access token is required',
        ErrorCode.VALIDATION_ERROR,
        400
      );
    }
  }

  get userId(): number {
    if (!this._userId) {
      throw new WordPressError(
        'User ID not set',
        ErrorCode.AUTH_REQUIRED,
        401
      );
    }
    return this._userId;
  }

  set userId(value: number) {
    this._userId = value;
  }

  private get apiUrl(): string {
    return `${this._siteUrl}/wp-json/${WordPressClient.API_VERSION}`;
  }

  private handleNetworkError(error: Error): never {
    const userMessage = UserFriendlyErrors[error.message] || UserFriendlyErrors['Default'];
    throw new WordPressError(
      error.message,
      ErrorCode.NETWORK_ERROR,
      0,
      userMessage
    );
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any;
      
      try {
        data = await response.json();
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Handle empty responses
        data = null;
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new WordPressError(
            'Invalid access token',
            ErrorCode.AUTH_REQUIRED,
            401,
            UserFriendlyErrors['Invalid access token']
          );
        }
        if (response.status === 429) {
          throw new WordPressError(
            'Rate limit exceeded',
            ErrorCode.RATE_LIMIT_ERROR,
            429,
            UserFriendlyErrors['Rate limit exceeded']
          );
        }

        throw new WordPressError(
          data?.message || 'WordPress API error',
          ErrorCode.WORDPRESS_API_ERROR,
          response.status
        );
      }

      return data;
    } catch (error) {
      if (error instanceof WordPressError) {
        throw error;
      }
      this.handleNetworkError(error as Error);
    }
  }

  async getUserInfo(): Promise<WordPress.UserInfo> {
    try {
      const data = await this.request<WordPress.UserInfo>('/users/me');
      this._userId = data.id;
      return data;
    } catch (error) {
      if (error instanceof WordPressError) {
        throw error;
      }
      throw new WordPressError(
        'Failed to fetch user info',
        ErrorCode.AUTH_REQUIRED,
        401
      );
    }
  }

  private validateImage(file: File) {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new WordPressError(
        'Image exceeds maximum size',
        ErrorCode.IMAGE_SIZE_ERROR,
        400,
        UserFriendlyErrors['Image too large']
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new WordPressError(
        'Invalid image format',
        ErrorCode.IMAGE_FORMAT_ERROR,
        400,
        UserFriendlyErrors['Invalid image format']
      );
    }
  }

  async uploadMedia(file: File, siteId: number, title?: string): Promise<PostMedia> {
    this.validateImage(file);

    try {
      const formData = new FormData();
      formData.append('media[]', file);
      
      if (title) {
        formData.append('attrs[0][title]', title);
      }

      const response = await fetch(
        `https://public-api.wordpress.com/rest/v1.1/sites/${siteId}/media/new`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: formData
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new WordPressError(
          error.message || 'Failed to upload media',
          ErrorCode.MEDIA_UPLOAD_ERROR,
          response.status
        );
      }

      const data = await response.json();
      return {
        ID: data.media[0].ID,
        URL: data.media[0].URL,
        title: title || data.media[0].title || 'Uploaded Image'
      };
    } catch (error) {
      if (error instanceof WordPressError) {
        throw error;
      }
      throw new WordPressError(
        'Media upload failed',
        ErrorCode.MEDIA_UPLOAD_ERROR,
        500
      );
    }
  }

  private validatePost(content: WordPress.PostRequest) {
    if (!content.title && !content.content) {
      throw new WordPressError(
        'Post must contain either title or content',
        ErrorCode.VALIDATION_ERROR,
        400
      );
    }
  }
  
  async createPost(siteId: number, post: {
    title: string;
    content: string;
    status?: string;
    parent_id?: number;
    featured_media?: number;
  }): Promise<WordPress.PostResponse> {
    try {
      const response = await fetch(
        `https://public-api.wordpress.com/rest/v1.1/sites/${siteId}/posts/new`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...post,
            status: post.status || 'publish'
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new WordPressError(
          error.message || 'Failed to create post',
          ErrorCode.WORDPRESS_API_ERROR,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof WordPressError) {
        throw error;
      }
      throw new WordPressError(
        'Failed to create post',
        ErrorCode.WORDPRESS_API_ERROR,
        500
      );
    }
  }

  async updatePost(postId: number, content: WordPress.PostRequest): Promise<WordPress.PostResponse> {
    try {
      return await this.request<WordPress.PostResponse>(`/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(content)
      });
    } catch (error) {
      if (error instanceof WordPressError) {
        throw error;
      }
      throw new WordPressError(
        'Failed to update post',
        ErrorCode.WORDPRESS_API_ERROR,
        500
      );
    }
  }

  async deletePost(postId: number): Promise<WordPress.PostResponse> {
    try {
      return await this.request<WordPress.PostResponse>(`/posts/${postId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      if (error instanceof WordPressError) {
        throw error;
      }
      throw new WordPressError(
        'Failed to delete post',
        ErrorCode.WORDPRESS_API_ERROR,
        500
      );
    }
  }

  async getPosts(params: WordPress.PostQueryParams = {}): Promise<WordPress.PostResponse[]> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<WordPress.PostResponse[]>(`/posts?${queryString}`);
  }

  async getCategories(): Promise<WordPress.CategoryResponse[]> {
    return this.request<WordPress.CategoryResponse[]>('/categories');
  }

  async getTags(): Promise<WordPress.TagResponse[]> {
    return this.request<WordPress.TagResponse[]>('/tags');
  }

  async createComment(postId: number, content: WordPress.CommentRequest): Promise<WordPress.CommentResponse> {
    try {
      return await this.request<WordPress.CommentResponse>('/comments', {
        method: 'POST',
        body: JSON.stringify({
          post: postId,
          ...content
        })
      });
    } catch (error) {
      if (error instanceof WordPressError) {
        throw error;
      }
      throw new WordPressError(
        'Failed to create comment',
        ErrorCode.WORDPRESS_API_ERROR,
        500
      );
    }
  }

  async getComments(postId: number): Promise<WordPress.CommentResponse[]> {
    return this.request<WordPress.CommentResponse[]>(`/comments?post=${postId}`);
  }

  async getPages(siteId: number): Promise<WordPress.PostResponse[]> {
    try {
      const response = await fetch(
        `https://public-api.wordpress.com/rest/v1.1/sites/${siteId}/posts?type=page&status=publish`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new WordPressError(
          error.message || 'Failed to fetch pages',
          ErrorCode.WORDPRESS_API_ERROR,
          response.status
        );
      }

      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      if (error instanceof WordPressError) {
        throw error;
      }
      throw new WordPressError(
        'Failed to fetch pages',
        ErrorCode.WORDPRESS_API_ERROR,
        500
      );
    }
  }
}