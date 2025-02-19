declare namespace WordPress {
    interface UserInfo {
      id: number;
      username: string;
      name: string;
      email: string;
      avatar_URL: string;
    }
  
    interface MediaResponse {
      id: number;
      date: string;
      date_gmt: string;
      guid: {
        rendered: string;
      };
      link: string;
      modified: string;
      modified_gmt: string;
      slug: string;
      status: string;
      type: string;
      title: {
        rendered: string;
      };
      author: number;
      comment_status: string;
      ping_status: string;
      template: string;
      meta: Record<string, unknown>;
      description: {
        rendered: string;
      };
      caption: {
        rendered: string;
      };
      alt_text: string;
      media_type: string;
      mime_type: string;
      media_details: {
        width: number;
        height: number;
        file: string;
        sizes: Record<string, {
          file: string;
          width: number;
          height: number;
          mime_type: string;
          source_url: string;
        }>;
      };
      source_url: string;
    }
  
    interface PostRequest {
      title: string;
      content: string;
      status?: string;
      parent_id?: number;
      featured_media?: number;
    }
  
    interface PostResponse {
      ID: number;
      title: string;
      content: string;
      URL: string;
      status: string;
      parent?: {
        ID: number;
      };
    }
  
    interface CategoryResponse {
      id: number;
      name: string;
      description: string;
    }
  
    interface TagResponse {
      id: number;
      name: string;
      description: string;
    }
  
    interface CommentRequest {
      content: string;
      author?: string;
      author_email?: string;
    }
  
    interface CommentResponse {
      id: number;
      content: string;
      author_name: string;
      date: string;
    }
  
    interface PostQueryParams {
      status?: string;
      search?: string;
      author?: number;
      category?: number;
      tag?: number;
      page?: number;
      per_page?: number;
    }

    interface Site {
      ID: number;
      name: string;
      URL: string;
    }
}

export interface WordPressResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface WordPressError {
  code: string;
  message: string;
  data: Record<string, unknown>;
}

export interface WordPressRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}

export = WordPress;
export as namespace WordPress;