import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";

import { ProtoFab } from "@/components/dev/proto-fab";

import "./globals.css";

/**
 * Root layout — fonts match Figma text styles (Inter + Roboto Mono).
 * ClerkProvider wraps the app (CDEC-006 lifted). ProtoFab stays outside auth UI.
 */

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoldenSync",
  description: "Personal semester, subject, and grade tracker",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeBootScript = `(function(){try{var t=localStorage.getItem("gs-theme");var d=document.documentElement;if(t==="light")d.classList.remove("dark");else d.classList.add("dark");}catch(e){document.documentElement.classList.add("dark");}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${robotoMono.variable} dark h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="bg-ambient flex min-h-dvh w-full min-w-0 flex-col overflow-x-hidden">
        <ClerkProvider appearance={{ theme: shadcn }}>
          {children}
          <ProtoFab />
        </ClerkProvider>
      </body>
    </html>
  );
}
