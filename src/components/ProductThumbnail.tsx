import Image from "next/image";
import type { Product } from "@/lib/products";

// Small image for lists (cart, search results). The product name is always
// shown right next to it, so the image is decorative: alt="" stops screen
// readers from announcing the same thing twice.
export function ProductThumbnail({ product }: { product: Product }) {
  return (
    <Image
      src={product.image.src}
      alt=""
      width={28}
      height={28}
      className="inline-block rounded-md align-middle"
    />
  );
}
