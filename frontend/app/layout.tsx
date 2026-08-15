import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Eventora — Discover events worth remembering",
    template: "%s · Eventora",
  },
  description:
    "Eventora is a premium event discovery and ticketing platform. Explore concerts, tech summits, workshops and more near you.",
  keywords: [
    "events",
    "tickets",
    "concerts",
    "workshops",
    "tech summits",
    "Eventora",
  ],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Eventora — Discover events worth remembering",
    description:
      "Discover and book experiences near you. Concerts, summits, workshops and more.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem("eventora-theme")==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`,
          }}
        />
        <AuthProvider>
          <ThemeProvider>
            <WishlistProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </WishlistProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}