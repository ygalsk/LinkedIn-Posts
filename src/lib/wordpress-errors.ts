export enum ErrorCode {
    AUTH_REQUIRED = 'auth_required',
    NETWORK_ERROR = 'network_error',
    WORDPRESS_API_ERROR = 'wordpress_api_error',
    VALIDATION_ERROR = 'validation_error',
    MEDIA_UPLOAD_ERROR = 'media_upload_error',
    IMAGE_SIZE_ERROR = 'image_size_error',
    IMAGE_FORMAT_ERROR = 'image_format_error',
    RATE_LIMIT_ERROR = 'rate_limit_error',
  }
  
  export const UserFriendlyErrors: Record<string, string> = {
    'Default': 'An error occurred while communicating with WordPress. Please try again later.',
    'Invalid access token': 'Your login session has expired. Please log in again.',
    'Rate limit exceeded': 'Too many requests. Please try again later.',
    'Network Error': 'Connection failed. Please check your internet connection and try again.',
    'Failed to fetch': 'Could not connect to WordPress. Please check your internet connection.',
    'Image too large': 'The image is too large. Maximum size is 10MB.',
    'Invalid image format': 'Unsupported image format. Please use JPEG, PNG, GIF, or WebP.',
    'Too many images': 'You can only upload up to 20 images per post.'
  };
  
  export class WordPressError extends Error {
    constructor(
      message: string,
      public readonly code: ErrorCode,
      public readonly status: number,
      public readonly userMessage: string = UserFriendlyErrors['Default']
    ) {
      super(message);
      this.name = 'WordPressError';
    }
  }