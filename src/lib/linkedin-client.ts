import { ErrorCode, LinkedInError, UserFriendlyErrors } from './linkedin-errors';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_IMAGES_PER_POST = 5;

export class LinkedInClient {
  private static readonly BASE_URL = 'https://api.linkedin.com/v2';
  private static readonly API_VERSION = '2.0.0';
  
  private _userId?: string;

  constructor(
    private readonly accessToken: string,
    userId?: string
  ) {
    this._userId = userId;
  }

  get userId(): string {
    if (!this._userId) {
      throw new LinkedInError(
        'User ID not set',
        ErrorCode.AUTH_REQUIRED,
        401
      );
    }
    return this._userId;
  }

  set userId(value: string) {
    this._userId = value;
  }

  private handleNetworkError(error: Error): never {
    const userMessage = UserFriendlyErrors[error.message] || UserFriendlyErrors['Default'];
    throw new LinkedInError(
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
    const url = `${LinkedInClient.BASE_URL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': LinkedInClient.API_VERSION,
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
          throw new LinkedInError(
            'Invalid access token',
            ErrorCode.AUTH_REQUIRED,
            401,
            UserFriendlyErrors['Invalid access token']
          );
        }
        if (response.status === 429) {
          throw new LinkedInError(
            'Rate limit exceeded',
            ErrorCode.RATE_LIMIT_ERROR,
            429,
            UserFriendlyErrors['Rate limit exceeded']
          );
        }

        throw new LinkedInError(
          data?.message || 'LinkedIn API error',
          ErrorCode.LINKEDIN_API_ERROR,
          response.status
        );
      }

      return data;
    } catch (error) {
      if (error instanceof LinkedInError) {
        throw error;
      }
      this.handleNetworkError(error as Error);
    }
  }

  async getUserInfo(): Promise<LinkedIn.UserInfo> {
    try {
      const data = await this.request<LinkedIn.UserInfo>('/userinfo');
      this._userId = data.sub;
      return data;
    } catch (error) {
      if (error instanceof LinkedInError) {
        throw error;
      }
      throw new LinkedInError(
        'Failed to fetch user info',
        ErrorCode.AUTH_REQUIRED,
        401
      );
    }
  }

  private validateImage(file: File) {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new LinkedInError(
        'Image exceeds maximum size',
        ErrorCode.IMAGE_SIZE_ERROR,
        400,
        UserFriendlyErrors['Image too large']
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new LinkedInError(
        'Invalid image format',
        ErrorCode.IMAGE_FORMAT_ERROR,
        400,
        UserFriendlyErrors['Invalid image format']
      );
    }
  }

  async uploadImage(file: File): Promise<string> {
    this.validateImage(file);

    try {
      const registerData = await this.request<LinkedIn.MediaUploadResponse>(
        '/assets?action=registerUpload',
        {
          method: 'POST',
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: `urn:li:person:${this.userId}`,
              serviceRelationships: [{
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent'
              }]
            }
          })
        }
      );

      const { uploadUrl } = registerData.value.uploadMechanism[
        'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
      ];
      
      const arrayBuffer = await file.arrayBuffer();
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': file.type,
        },
        body: arrayBuffer
      });

      if (!uploadResponse.ok) {
        throw new LinkedInError(
          'Failed to upload image',
          ErrorCode.IMAGE_UPLOAD_ERROR,
          uploadResponse.status
        );
      }

      return registerData.value.asset;
    } catch (error) {
      if (error instanceof LinkedInError) {
        throw error;
      }
      throw new LinkedInError(
        'Image upload failed',
        ErrorCode.IMAGE_UPLOAD_ERROR,
        500
      );
    }
  }

  private validatePost(content: LinkedIn.LinkedInPostRequest) {
    if (!content.commentary && (!content.mediaItems || content.mediaItems.length === 0)) {
      throw new LinkedInError(
        'Post must contain either commentary or media',
        ErrorCode.VALIDATION_ERROR,
        400
      );
    }
  
    if (content.mediaItems && content.mediaItems.length > MAX_IMAGES_PER_POST) {
      throw new LinkedInError(
        'Too many images in post',
        ErrorCode.VALIDATION_ERROR,
        400,
        UserFriendlyErrors['Too many images']
      );
    }
  }
  
  async createPost(content: LinkedIn.LinkedInPostRequest): Promise<LinkedIn.PostResponse> {
    this.validatePost(content);
    const { commentary, mediaItems = [], visibility = 'PUBLIC' } = content;
  
    try {
      return await this.request<LinkedIn.PostResponse>('/ugcPosts', {
        method: 'POST',
        body: JSON.stringify({
          author: `urn:li:person:${this.userId}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: commentary },
              shareMediaCategory: mediaItems.length ? "IMAGE" : "NONE",
              media: mediaItems.length ? mediaItems.map(media => ({
                status: "READY",
                media,
              })) : undefined
            }
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": visibility
          }
        })
      });
    } catch (error) {
      if (error instanceof LinkedInError) {
        throw error;
      }
      throw new LinkedInError(
        'Failed to create post',
        ErrorCode.LINKEDIN_API_ERROR,
        500
      );
    }
  }

  async getProfile(): Promise<LinkedIn.ProfileResponse> {
    return this.request(`/people/${this.userId}`);
  }

  async getConnections(
    start = 0,
    count = 50
  ): Promise<LinkedIn.ConnectionsResponse> {
    return this.request(`/connections?start=${start}&count=${count}`);
  }
}