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
  title: "Krado — IT Solutions That Scale",
  description:
    "Krado is a software development and IT services company delivering scalable, high-quality digital solutions for businesses worldwide.",
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
