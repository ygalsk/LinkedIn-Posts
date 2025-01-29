declare namespace LinkedIn {
  export interface UserInfo {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
  }

  export interface MediaUploadResponse {
    value: {
      asset: string;
      uploadMechanism: {
        'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest': {
          uploadUrl: string;
        };
      };
    };
  }

  export interface PostContent {
    text: string;
    mediaItems?: string[];
    visibility?: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN';
  }

  export interface LinkedInPostRequest {
    commentary: string;
    mediaItems?: string[];
    visibility?: "PUBLIC" | "CONNECTIONS";
  }

  export interface LinkedInApiError extends Error {
    code: string;
    status: number;
    userMessage: string;
  }

  export interface PostResponse {
    id: string;
    created: number;
    edited: number;
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': string;
    };
  }

  export interface ProfileResponse {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: {
      displayImage: string;
    };
  }

  export interface ConnectionsResponse {
    elements: Array<{
      miniProfile: {
        id: string;
        firstName: string;
        lastName: string;
      };
    }>;
    paging: {
      count: number;
      start: number;
      total: number;
    };
  }
}