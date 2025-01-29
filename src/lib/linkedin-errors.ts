export enum ErrorCode {
    AUTH_REQUIRED = 'AUTH_REQUIRED',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    IMAGE_UPLOAD_ERROR = 'IMAGE_UPLOAD_ERROR',
    IMAGE_SIZE_ERROR = 'IMAGE_SIZE_ERROR',
    IMAGE_FORMAT_ERROR = 'IMAGE_FORMAT_ERROR',
    LINKEDIN_API_ERROR = 'LINKEDIN_API_ERROR',
    RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR'
  }
  
  export const ErrorMessages: Record<ErrorCode, string> = {
    AUTH_REQUIRED: "You need to sign in to post on LinkedIn",
    VALIDATION_ERROR: "Please check your post content",
    IMAGE_UPLOAD_ERROR: "We couldn't upload your image to LinkedIn",
    IMAGE_SIZE_ERROR: "Your image is too large (maximum 8MB)",
    IMAGE_FORMAT_ERROR: "This image format isn't supported by LinkedIn",
    LINKEDIN_API_ERROR: "LinkedIn couldn't process your post",
    RATE_LIMIT_ERROR: "You're posting too quickly. Please wait a moment",
    NETWORK_ERROR: "Check your internet connection and try again"
  };
  
  export const UserFriendlyErrors: Record<string, string> = {
    'Failed to fetch': "We can't reach LinkedIn right now. Check your internet connection!",
    'Network request failed': "Looks like you're offline. Check your internet connection!",
    'Post content too long': "Your post is too long for LinkedIn. Try making it shorter!",
    'Invalid image format': "LinkedIn doesn't like this type of image. Try using a JPG or PNG!",
    'Image too large': "This image is too big for LinkedIn. Try using a smaller one (under 8MB)!",
    'Too many images': "LinkedIn only allows up to 5 images per post. Try removing some!",
    'Rate limit exceeded': "Whoa there! You're posting too quickly. Take a short break and try again!",
    'Invalid access token': "Your LinkedIn login has expired. Please sign in again!",
    'User not authorized': "LinkedIn needs you to sign in again to post!",
    'Default': "Oops! Something went wrong. Please try again!"
  };
  
  export class LinkedInError extends Error {
    constructor(
      message: string,
      public code: ErrorCode,
      public status: number = 500,
      public userMessage?: string
    ) {
      super(message);
      this.name = 'LinkedInError';
      this.userMessage = userMessage || ErrorMessages[code];
    }
  }
  