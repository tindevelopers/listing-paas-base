/**
 * @listing-platform/media
 *
 * Wasabi S3-compatible media storage for the listing platform.
 *
 * Features:
 * - Image upload to Wasabi
 * - Presigned URL generation
 * - Image optimization with Sharp
 * - Thumbnail generation
 */

export { wasabiClient, getWasabiConfig, createWasabiClient } from './client';
export {
  uploadImage,
  uploadImages,
  deleteImage,
  deleteImages,
  getImageUrl,
  generatePresignedUploadUrl,
} from './upload';
export { optimizeImage, generateThumbnail, ImageSize } from './optimize';
export type { WasabiConfig, UploadResult, ImageOptions } from './types';
