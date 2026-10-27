export interface Category {
  slug: string;
  name: string;
  tagline: string;
  image: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  image: string;
  specs: ProductSpec[];
  badge?: string;
  featured?: boolean;
  isNew?: boolean;
  releasedAt: string;
}

export type SeedProduct = Omit<Product, "categoryName">;
