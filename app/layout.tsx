import {ClerkProvider} from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "RoadWatch",
  description:
    "AI-powered citizen chatbot for road quality, accountability and safety.",
  manifest: "/manifest.json",
  applicationName: "RoadWatch",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "RoadWatch",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "RoadWatch",
    description:
      "AI-powered citizen chatbot for road quality, accountability and safety.",
    images: ["/og.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoadWatch",
    description: "AI road accountability for citizens.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-canvas text-ink">
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
        >
          <ServiceWorkerRegister />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}