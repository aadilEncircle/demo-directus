import type { ImageLoader } from 'next/image';

export const directusImageLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src);

  url.searchParams.set('width', width.toString());
  url.searchParams.set('fit', 'cover');
  url.searchParams.set('quality', (quality || 85).toString());

  return url.toString();
};
