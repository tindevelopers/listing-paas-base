import sharp from 'sharp';
import type { ImageOptions } from './types';
import { DEFAULT_IMAGE_OPTIONS, THUMBNAIL_SIZES } from './types';

/**
 * Image Optimization with Sharp
 */

export type ImageSize = keyof typeof THUMBNAIL_SIZES;

interface OptimizedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Optimize an image using Sharp
 */
export async function optimizeImage(
  input: Buffer,
  options: ImageOptions = {}
): Promise<OptimizedImage> {
  const opts = { ...DEFAULT_IMAGE_OPTIONS, ...options };

  let pipeline = sharp(input);

  // Get original metadata
  const metadata = await pipeline.metadata();

  // Resize if needed
  if (opts.maxWidth || opts.maxHeight) {
    pipeline = pipeline.resize({
      width: opts.maxWidth,
      height: opts.maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Apply format-specific optimization
  switch (opts.format) {
    case 'webp':
      pipeline = pipeline.webp({ quality: opts.quality });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality: opts.quality });
      break;
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 9 });
      break;
    case 'jpeg':
    default:
      pipeline = pipeline.jpeg({ quality: opts.quality, mozjpeg: true });
  }

  const buffer = await pipeline.toBuffer();
  const outputMetadata = await sharp(buffer).metadata();

  return {
    buffer,
    width: outputMetadata.width || metadata.width || 0,
    height: outputMetadata.height || metadata.height || 0,
    format: opts.format || 'jpeg',
    size: buffer.length,
  };
}

/**
 * Generate a thumbnail at a specific size
 */
export async function generateThumbnail(
  input: Buffer,
  size: ImageSize,
  options: Pick<ImageOptions, 'quality' | 'format'> = {}
): Promise<OptimizedImage> {
  const targetSize = THUMBNAIL_SIZES[size];

  return optimizeImage(input, {
    maxWidth: targetSize,
    maxHeight: targetSize,
    quality: options.quality || 80,
    format: options.format || 'jpeg',
  });
}

/**
 * Generate all thumbnails for an image
 */
export async function generateAllThumbnails(
  input: Buffer,
  options: Pick<ImageOptions, 'quality' | 'format'> = {}
): Promise<Record<ImageSize, OptimizedImage>> {
  const [small, medium, large] = await Promise.all([
    generateThumbnail(input, 'small', options),
    generateThumbnail(input, 'medium', options),
    generateThumbnail(input, 'large', options),
  ]);

  return { small, medium, large };
}

/**
 * Convert image to WebP format
 */
export async function convertToWebP(
  input: Buffer,
  quality = 85
): Promise<OptimizedImage> {
  return optimizeImage(input, {
    format: 'webp',
    quality,
  });
}

/**
 * Get image metadata without processing
 */
export async function getImageMetadata(input: Buffer): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
}> {
  const metadata = await sharp(input).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: input.length,
  };
}
