import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no, viewport-fit=cover" />

        <link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg" />
        <link rel="icon" type="image/png" href="/assets/images/favicon.png" sizes="48x48" />
        <link rel="apple-touch-icon" href="/assets/images/icon.png" />
        <title>TopRanker - Trust-Weighted Restaurant Rankings</title>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="description" content="Trust-weighted restaurant rankings for Texas. Rate, discover, and track the best places to eat — powered by community credibility." />
        <meta name="theme-color" content="#0D1B2A" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="TopRanker - Where Your Rankings Matter" />
        <meta property="og:description" content="Trust-weighted restaurant rankings for Texas. Rate, discover, and track the best places to eat — powered by community credibility." />

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
