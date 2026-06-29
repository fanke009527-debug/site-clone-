---
name: site-clone
description: |
  One-shot website cloning — navigate a URL, capture all assets (Performance API +
  network log), exhaustive attribute rewriting (srcset/data-*/inline-styles/12+
  patterns), UTF-8 verification, byte-level HTML comparison. Iterates until zero
  console errors. Use when asked to "clone this site", "复刻这个网站", "save this
  page offline", "mirror this page".
triggers:
  - clone this site
  - 复刻网站
  - save this page offline
  - mirror this page
  - 扒站
  - archive website
allowed-tools:
  - Bash
  - PowerShell
  - Read
  - Write
  - Edit
  - mcp__playwright__browser_navigate
  - mcp__playwright__browser_network_requests
  - mcp__playwright__browser_evaluate
  - mcp__playwright__browser_snapshot
  - mcp__playwright__browser_take_screenshot
  - mcp__playwright__browser_console_messages
---

# Site Clone — Optimized Website Mirroring Skill

One-shot website cloning. Navigate → capture → download → rewrite → validate → fix → done.
Produces a byte-exact offline copy with **zero console errors**.

## Workflow

### Step 1: Capture (one pass)

1. Navigate to the target URL with Playwright:
   ```
   mcp__playwright__browser_navigate → url
   ```
2. Wait 3 seconds for lazy-loaded assets and route chunks to fire.
3. Capture the **Performance API resource list** — this catches everything the browser actually loaded
   (CSS `@font-face`, dynamic `import()`, web workers, Shadow DOM assets that network log misses):
   ```
   mcp__playwright__browser_evaluate → () => JSON.stringify(performance.getEntriesByType('resource').map(r => ({name: r.name, type: r.initiatorType, duration: Math.round(r.duration)})))
   ```
4. Capture ALL network requests as secondary source:
   ```
   mcp__playwright__browser_network_requests → static: true
   ```
5. Save the rendered HTML with Shadow DOM serialization:
   ```
   mcp__playwright__browser_evaluate → () => { const walk = (root) => { for (const el of root.querySelectorAll('*')) { if (el.shadowRoot) { const container = document.createElement('template'); container.setAttribute('shadow-root',''); container.content.appendChild(el.shadowRoot.cloneNode(true)); el.appendChild(container); walk(el.shadowRoot); } } }; walk(document.documentElement); return '<!DOCTYPE html>\n' + document.documentElement.outerHTML; }
   ```
6. **Cross-reference**: Compare Performance API entries against network requests. Performance API is the
   **ground truth** — any URL in Performance API but NOT in network requests is a dynamic/lazy asset
   that must be downloaded.

### Step 2: Setup clone directory

Create the clone directory at `E:\Projects\claude-code\site-clones\{domain}\`:

- Extract the URLʼs hostname (e.g. `example.com`) — this is `{domain}`
- Parse the Performance API resource list to extract all unique directory paths
- Create all needed subdirectories in one call:

```powershell
$dirs = @($assetPaths | ForEach-Object { Split-Path $_ -Parent } | Where-Object { $_ } | Sort-Object -Unique)
$dirs | ForEach-Object { New-Item -ItemType Directory -Force -Path "E:\Projects\claude-code\site-clones\$domain\$_" }
```

### Step 3: Save HTML with verified UTF-8 encoding

Save the captured HTML with correct encoding — **this is the #1 silent failure point**:

```powershell
$html = @" 
<captured-html-content>
"@
$outPath = "E:\Projects\claude-code\site-clones\$domain\index.html"
[System.IO.File]::WriteAllText($outPath, $html, [System.Text.UTF8Encoding]::new($false))
```

**Immediately verify encoding integrity:**

```powershell
$saved = Get-Content $outPath -Raw -Encoding UTF8
$hasCJK = $saved -match '[一-鿿]'
Write-Host "UTF-8 check: $($hasCJK ? 'PASS - CJK preserved' : 'no CJK detected')"
$hasEmoji = $saved -match '\p{So}'
Write-Host "Emoji check: $($hasEmoji ? 'PASS' : 'no emoji detected')"
if ($saved.Length -lt $html.Length * 0.98) { throw "HTML TRUNCATED: $($saved.Length) vs $($html.Length)" }
```

### Step 4: Download all assets

Merge Performance API entries + network request URLs into a single deduplicated list.
**Download from both sources — Performance API catches what network log misses.**

```powershell
$allUrls = @($perfEntries | ForEach-Object { $_.name }) + @($networkUrls)
$allUrls = $allUrls | Where-Object { $_ -match "^https?://$([regex]::Escape($domain))" } | Sort-Object -Unique

foreach ($url in $allUrls) {
    $relPath = $url -replace '^https?://' + [regex]::Escape($domain) + '/?', ''
    if (-not $relPath) { $relPath = 'index.html' }
    $outFile = "E:\Projects\claude-code\site-clones\$domain\$relPath"
    $outDir = Split-Path $outFile -Parent
    if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir }
    try {
        Invoke-WebRequest -Uri $url -OutFile $outFile -UseBasicParsing -TimeoutSec 30
    } catch {
        Write-Host "WARN: Failed to download $url — $_"
    }
}
```

### Step 5: Rewrite paths — exhaustive attribute coverage

**Do NOT hardcode directory names.** Derive replacement patterns from the actual paths that
were downloaded. Handle all 12+ attribute patterns that can contain URLs:

```powershell
$domain = "example.com"
$html = [System.IO.File]::ReadAllText("$cloneDir\index.html", [System.Text.UTF8Encoding]::new($false))

# 1. Generic absolute-path replacement — handles ALL directories dynamically
#    Matches: src="/anything/..."  href="/anything/..."  action="/anything/..."
$html = $html -replace " (src|href|action|poster|data|cite|longdesc|profile|usemap|formaction|manifest)=""/", ' $1="./'

# 2. srcset attribute — handles multi-URL values like "/a.jpg 1x, /b.jpg 2x"
$html = [regex]::Replace($html, '(srcset)="([^"]*)"', { param($m)
    $val = [regex]::Replace($m.Groups[2].Value, '/([^\s,]+)', './$1')
    return $m.Groups[1].Value + '="' + $val + '"'
})

# 3. Lazy-load data attributes — data-src, data-background, data-image, data-defer-src, data-lazy, data-original
$html = $html -replace " (data-src|data-background|data-image|data-defer-src|data-lazy|data-original|data-thumb|data-poster|data-video|data-url)=""/", ' $1="./'

# 4. <object> / <embed> data= attribute
$html = $html -replace " (data)=""/([^""]+\.(svg|pdf|swf))", ' $1="./$2'

# 5. <video>/<audio> <source src=> and <track src=>
$html = $html -replace " (src)=""/([^""]+\.(mp4|webm|ogg|mp3|wav|vtt))", ' $1="./$2'

# 6. CSS url() in inline styles — url(/path...) → url(./path...)
$html = $html -replace ":(\s*)url\(/(?![/])", ':$1url(./'

# 7. <link> href — stylesheets, favicons, canonical, preload, etc.
$html = $html -replace " (href)=""/([^""]+\.(css|ico|png|svg|webp|json|xml|txt))", ' $1="./$2'

# 8. Protocol-relative URLs (//example.com/...) → relative
$html = $html -replace "//$([regex]::Escape($domain))/", './'

# 9. <meta> content= URLs (Open Graph, Twitter Cards)
$html = $html -replace " (content)=""https?://$([regex]::Escape($domain))/", ' $1="./'

# 10. JSON-LD / schema.org inline URLs
$html = $html -replace "(""url|""logo|""image|""thumbnailUrl|""contentUrl)"":\s*""https?://$([regex]::Escape($domain))/", '$1:"./'

# 11. <source srcset> inside <picture> — same multi-URL handling as #2
$html = [regex]::Replace($html, '<source\s+([^>]*\s)?(srcset)="([^"]*)"', { param($m)
    $prefix = if ($m.Groups[1].Success) { $m.Groups[1].Value } else { '' }
    $val = [regex]::Replace($m.Groups[3].Value, '/([^\s,]+)', './$1')
    return '<source ' + $prefix + 'srcset="' + $val + '"'
})

# 12. Inline background-image style with url()
$html = $html -replace "background-image:\s*url\(/(?![/])", 'background-image: url(./'

Write-Host "Path rewrite complete — 12 attribute patterns processed"
[System.IO.File]::WriteAllText("$cloneDir\index.html", $html, [System.Text.UTF8Encoding]::new($false))
```

**Post-rewrite verification:**
```powershell
$remaining = Select-String -Path "$cloneDir\index.html" -Pattern "https?://$domain/" -AllMatches
if ($remaining.Matches.Count -gt 0) {
    Write-Host "WARN: $($remaining.Matches.Count) absolute URLs to $domain remain — may need manual review"
    $remaining.Matches | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" }
}
```

### Step 6: Byte-level HTML comparison

Before starting the server, verify the rewrite didn't corrupt anything:

```powershell
# Strip dynamic runtime attributes from both versions for fair comparison
$strip = { $_ -replace '\s+data-v-[a-f0-9]+=""', '' -replace '\s+data-.*?="[^""]*"', '' -replace '\s+style="[^""]*"', '' -replace '\s+class="[^""]*"', '' -replace '\s+id="[^""]*"', '' -replace '\s+aria-[^=]+="[^""]*"', '' -replace '\s+scoped=""', '' -replace '\s+data-v-[\w-]+', '' -replace '\s+__hash="[^""]*"', '' -replace '\s+v-\w+="[^""]*"', '' }

$original = & $strip (Invoke-WebRequest -Uri $sourceUrl -UseBasicParsing).Content
$cloned = & $strip (Get-Content "$cloneDir\index.html" -Raw -Encoding UTF8)

if ($original.Length -eq 0) { throw "Failed to fetch original for comparison" }
$ratio = [Math]::Min($original.Length, $cloned.Length) / [Math]::Max($original.Length, $cloned.Length)
Write-Host "HTML byte ratio (stripped): $($ratio.ToString('P2'))"
if ($ratio -lt 0.85) { Write-Host "WARN: Unexpected divergence < 85% — check for corruption" }
if ($ratio -gt 0.99) { Write-Host "PASS: Byte-exact match after normalization" }
```

### Step 7: Start local verification server

Node.js built-in `http` module — zero dependencies. **Works on both Windows and Unix:**

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');
const baseDir = __dirname;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.htm':  'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.xml':  'application/xml; charset=utf-8',
  '.webp': 'image/webp',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.eot':  'application/vnd.ms-fontobject',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.mp3':  'audio/mpeg',
  '.wav':  'audio/wav',
  '.pdf':  'application/pdf',
  '.txt':  'text/plain; charset=utf-8',
  '.vtt':  'text/vtt; charset=utf-8',
};

http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0].split('#')[0];
  filePath = decodeURIComponent(filePath);
  const fullPath = path.join(baseDir, filePath);

  // Security: prevent directory traversal
  if (!fullPath.startsWith(baseDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(fullPath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
}).listen(8765, () => {
  console.log('http://localhost:8765/');
});
```

Save as `server.js` in the clone directory.

**Start server (cross-platform):**
- **Windows (PowerShell):** `Start-Process node -ArgumentList "server.js" -NoNewWindow`
- **Linux/Mac (Bash):** `node server.js &`
- Or unified: `node server.js` (in a separate terminal tab)

### Step 8: Validate — Console Zero Error Loop

1. Navigate Playwright to `http://localhost:8765/{page-path}`
2. Wait 1 second for JavaScript execution
3. Read console messages: `mcp__playwright__browser_console_messages → level: error`
4. Filter out CORS errors (expected on localhost — these are NOT real errors):
   - Ignore: `Access-Control-Allow-Origin`, `Mixed Content`, `ERR_SSL`
5. Extract all genuine 404 URLs from the remaining errors
6. For each 404 URL:
   - Strip the `http://localhost:8765` prefix
   - Reconstruct the original URL: `https://{domain}/{stripped-path}`
   - Download from original domain into the clone directory
7. Reload the page in Playwright
8. Repeat until **genuine console errors = 0**
9. Only "Slow network" font warnings are acceptable (not real errors)

### Step 9: Generate manifest

Write `site-manifest.json` to the clone directory:

```json
{
  "source": "{original_url}",
  "cloned_at": "{ISO8601_timestamp}",
  "version": "1.0.2",
  "total_files": N,
  "total_size_bytes": N,
  "total_size_human": "{X.Y MB}",
  "pages": ["/index.html"],
  "assets": {
    "images": N,
    "fonts": N,
    "scripts": N,
    "styles": N,
    "videos": N,
    "audio": N,
    "documents": N,
    "other": N
  },
  "validation": {
    "console_errors_final": 0,
    "html_byte_ratio": "0.99",
    "cjk_preserved": true
  },
  "missing": []
}
```

### Step 10: Screenshot comparison

Take a full-page screenshot of the local clone via Playwright and report back with a visual
pass/fail summary.

## Stop conditions

- **DONE**: 0 genuine console errors, HTML byte ratio ≥ 99%, visual match confirmed
- **DONE_WITH_CONCERNS**: ≤ 2 minor missing assets (e.g. favicon), byte ratio ≥ 90%, layout intact
- **BLOCKED**: Original site requires login / CAPTCHA / bot detection that we can't bypass

## Output

After completion, tell the user:
- Local URL: `http://localhost:8765/{page-path}`
- Clone directory path
- File count and total size
- Validation results (byte ratio, CJK preserved, console errors)
- Any assets that couldn't be downloaded and why

## Cleanup

Do NOT delete the clone directory or server — leave them running for the user to inspect.
