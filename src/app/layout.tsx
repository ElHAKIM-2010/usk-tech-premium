import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { CartProvider } from "@/components/cart/cart-provider";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { auth } from "@/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "USK Tech Premium — Elektronik pilihan",
    template: "%s | USK Tech Premium",
  },
  description:
    "Laptop, smartphone, audio, dan aksesori pilihan dari USK Tech Premium. Katalog terkurasi dengan spesifikasi jelas dan harga transparan.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080908" },
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem("usk-theme");var d=t==="light"||t==="dark"?t:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=d;}catch(e){document.documentElement.dataset.theme="dark";}})();`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  const userName = session?.user?.name ?? null;

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-bg font-sans text-text antialiased">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-accent focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-accent-ink"
        >
          Lewati ke konten
        </a>
        <CartProvider>
          <Navbar userName={userName} />
          <main id="konten" className="flex-1">
            {children}
          </main>
          <Footer userName={userName} />
        </CartProvider>
      </body>
    </html>
  );
}
