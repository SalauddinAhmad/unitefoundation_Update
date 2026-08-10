export default function Index() {
  return (
    <body>
      Fix Cloudflare caching for unitefoundation.bd. The Node.js server sends cache-control: no-cache, no-store, must-revalidate which prevents Cloudflare from caching. Remove those headers from the Express app (likely from helmet or middleware). For static React build files, set Cache-Control: public, max-age=7200. If using helmet: helmet({"{"} noCache: false {"}"}). After fix, cf-cache-status should change from DYNAMIC to HIT and latency should drop from 1.3s to &lt;100ms.
    </body>
  );
}
