export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://usk-tech-premium.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "USK Tech Premium";

export const SITE_DESCRIPTION =
  "Laptop, smartphone, audio, dan aksesori pilihan dari USK Tech Premium. Katalog terkurasi dengan spesifikasi jelas dan harga transparan.";

export const DEFAULT_OG_IMAGE = {
  url: "/hero-laptop.jpg",
  width: 1400,
  height: 1100,
  alt: "Laptop premium di meja kerja — USK Tech Premium",
};
