import { productImageViewByKey } from "@adegaos/assets";

export interface ProductImageView {
  readonly url: string;
  readonly altText: string;
  readonly width: number;
  readonly height: number;
  readonly status: string;
}

export function productImageForKey(key: string): ProductImageView | null {
  return productImageViewByKey(key);
}

export function storageKeyToPublicUrl(storageKey: string): string {
  return storageKey.startsWith("/") ? storageKey : `/${storageKey}`;
}
