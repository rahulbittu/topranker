import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no, viewport-fit=cover" />

        {/* Rich multi-size favicons */}
        <link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg" />
        <link rel="icon" type="image/png" href="/assets/images/favicon.png" sizes="48x48" />
        <link rel="icon" type="image/png" href="/assets/images/favicon-32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/assets/images/favicon-192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png" sizes="180x180" />
        <title>TopRanker - Trust-Weighted Restaurant Rankings</title>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="description" content="Trust-weighted restaurant rankings for Texas. Rate, discover, and track the best places to eat — powered by community credibility." />
        <meta name="theme-color" content="#0D1B2A" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="TopRanker - Where Your Rankings Matter" />
        <meta property="og:description" content="Trust-weighted restaurant rankings for Texas. Rate, discover, and track the best places to eat — powered by community credibility." />
        <meta property="og:site_name" content="TopRanker" />
        <meta property="og:url" content="https://topranker.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TopRanker - Trust-Weighted Rankings" />
        <meta name="twitter:description" content="Trust-weighted restaurant rankings for Texas." />
        <link rel="canonical" href="https://topranker.com" />

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
