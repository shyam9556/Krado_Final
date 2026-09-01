import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SmoothScrollProvider } from "@/components/layout/smooth-scroll-provider";
import { IntroStateProvider } from "@/components/layout/intro-state-provider";
import { DecodeIntro } from "@/components/intro/DecodeIntro";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // "300" removed — not used in any CSS file
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kradotech.com"),
  title: {
    default: "Krado — IT Solutions That Scale",
    template: "%s | Krado",
  },
  description:
    "Krado is a software development and IT services company delivering scalable, high-quality digital solutions for businesses worldwide.",
  keywords: [
    "software development",
    "IT services",
    "web development",
    "mobile app development",
    "digital solutions",
    "Krado",
    "scalable software",
  ],
  authors: [{ name: "Krado", url: "https://kradotech.com" }],
  creator: "Krado",
  publisher: "Krado",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/krado-favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/krado-favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kradotech.com",
    siteName: "Krado",
    title: "Krado — IT Solutions That Scale",
    description:
      "Krado is a software development and IT services company delivering scalable, high-quality digital solutions for businesses worldwide.",
    images: [
      {
        url: "/krado-og-image.png",
        width: 1200,
        height: 630,
        alt: "Krado — IT Solutions That Scale",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Krado — IT Solutions That Scale",
    description:
      "Krado is a software development and IT services company delivering scalable, high-quality digital solutions for businesses worldwide.",
    images: ["/krado-og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased overflow-x-hidden`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden">
        {/* Blocking inline script — runs BEFORE React hydration.
            Must execute before any GSAP ScrollTrigger measures positions.
            useEffect/useLayoutEffect in components is too late — browser
            has already restored scroll position by then. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if(history.scrollRestoration)history.scrollRestoration='manual';
              window.scrollTo(0,0);
              if(location.hash){
                window.__kradoDeepLink=location.hash;
                history.replaceState(null,'',location.pathname+location.search);
              }
              requestAnimationFrame(function(){window.scrollTo(0,0)});
            `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SmoothScrollProvider>
            <IntroStateProvider>
              <DecodeIntro />
              <Navbar />
              {children}
            </IntroStateProvider>
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
