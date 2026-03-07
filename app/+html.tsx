import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no, viewport-fit=cover" />

        <link rel="icon" type="image/png" href="/assets/images/favicon.png" />
        <link rel="apple-touch-icon" href="/assets/images/favicon.png" />
        <title>Top Ranker - Dallas Restaurant Rankings</title>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="description" content="Community-powered restaurant rankings for Dallas. Rate, discover, and track the best places to eat." />
        <meta name="theme-color" content="#C49A1A" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Top Ranker - Dallas Restaurant Rankings" />
        <meta property="og:description" content="Community-powered restaurant rankings for Dallas. Rate, discover, and track the best places to eat." />

        {/* Prevent text scaling on web */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: `
          body { overflow: hidden; height: 100vh; }
          #root { display: flex; height: 100vh; }
          * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
          html { scroll-behavior: smooth; color-scheme: light; }
          input, textarea { font-size: 16px !important; outline: none; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
