# Phase 5: iOS Media Proxy - Research

**Researched:** 2026-01-22
**Domain:** HTTP video streaming with Range request support for iOS Safari
**Confidence:** HIGH

## Summary

iOS Safari has strict requirements for video streaming that differ significantly from other browsers. Safari **requires** HTTP Range request support (byte-range streaming) and will not play videos without proper 206 Partial Content responses. Safari proactively tests servers by requesting the first 2 bytes before attempting full playback—if the server doesn't respond with proper range headers, the video simply won't render.

Implementing an Express.js media proxy for Supabase Storage requires handling HTTP Range requests, setting proper CORS headers (especially `Access-Control-Expose-Headers` for cross-origin requests), and streaming files efficiently from Supabase Storage through the backend. The standard approach is to parse Range headers, fetch the appropriate byte range from storage, and return 206 Partial Content responses with correct Content-Range, Accept-Ranges, Content-Length, and Content-Type headers.

For production implementations, using the Node.js `stream.pipeline()` method is critical for proper error handling and memory management, avoiding the memory leaks and crashes that can occur with manual `.pipe()` implementations.

**Primary recommendation:** Implement Range request handling manually in Express rather than using the unmaintained `express-partial-content` package (last updated 2019). Use `stream.pipeline()` for streaming, fetch files from Supabase using signed URLs, and ensure all iOS Safari-specific headers are present.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Express.js | 4.x+ | HTTP server framework | Already in use (Phase 1), native HTTP support |
| Node.js fs | Built-in | File streaming with range support | Native `createReadStream({ start, end })` handles byte ranges |
| Node.js stream | Built-in | Stream management | `pipeline()` provides automatic error handling and backpressure |
| @supabase/supabase-js | Latest | Supabase client | Official SDK for Storage signed URLs |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cors | 2.x+ | CORS middleware for Express | Simplifies CORS configuration with `exposedHeaders` option |
| @aws-sdk/client-s3 | 3.x | S3-compatible client | Alternative to signed URLs for direct S3 protocol access to Supabase Storage |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual Range implementation | express-partial-content | Package unmaintained since 2019, manual gives full control |
| Signed URLs | S3 SDK direct access | S3 SDK more complex but avoids URL expiration issues |
| stream.pipeline() | stream.pipe() | pipe() requires manual error handling, risks memory leaks |

**Installation:**
```bash
npm install cors
# @aws-sdk/client-s3 only if using S3 protocol instead of signed URLs
```

## Architecture Patterns

### Recommended Project Structure
```
server/
├── routes/
│   └── media.js           # Media proxy routes
├── middleware/
│   └── cors.js            # CORS configuration for video
└── services/
    └── storage.js         # Supabase Storage interaction
```

### Pattern 1: Range Request Handler with Signed URLs
**What:** Express route that handles Range requests by fetching from Supabase signed URLs
**When to use:** Default approach, works with existing Supabase Storage setup
**Example:**
```javascript
// Source: https://blog.logrocket.com/build-video-streaming-server-node/
// Adapted for Supabase Storage
import { createClient } from '@supabase/supabase-js';
import { pipeline } from 'stream/promises';
import fetch from 'node-fetch';

const CHUNK_SIZE = 10 ** 6; // 1MB

app.get('/api/media/:bucket/:path(*)', async (req, res) => {
  try {
    const { bucket, path } = req.params;
    const range = req.headers.range;

    // Get signed URL from Supabase Storage
    const { data: signedData, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) throw error;

    // Fetch file metadata first
    const headResponse = await fetch(signedData.signedUrl, { method: 'HEAD' });
    const videoSize = parseInt(headResponse.headers.get('content-length'), 10);
    const contentType = headResponse.headers.get('content-type') || 'video/mp4';

    if (!range) {
      // No range requested, send entire file
      res.writeHead(200, {
        'Content-Length': videoSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes'
      });
      const response = await fetch(signedData.signedUrl);
      await pipeline(response.body, res);
      return;
    }

    // Parse range header
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;

    // Set 206 headers
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': contentType
    };

    res.writeHead(206, headers);

    // Fetch with Range header
    const response = await fetch(signedData.signedUrl, {
      headers: { Range: `bytes=${start}-${end}` }
    });

    await pipeline(response.body, res);
  } catch (error) {
    console.error('Media proxy error:', error);
    res.status(500).send('Media streaming error');
  }
});
```

### Pattern 2: CORS Configuration for iOS Safari
**What:** Express CORS middleware configured to expose Range-related headers
**When to use:** When frontend and backend are on different origins
**Example:**
```javascript
// Source: https://expressjs.com/en/resources/middleware/cors.html
import cors from 'cors';

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length']
};

app.use('/api/media', cors(corsOptions));
```

### Pattern 3: Error Handling for Range Requests
**What:** Proper 416 Range Not Satisfiable responses for invalid ranges
**When to use:** Always, to handle edge cases gracefully
**Example:**
```javascript
// Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/416
function validateRange(start, end, fileSize) {
  if (start >= fileSize || end >= fileSize || start > end) {
    return false;
  }
  return true;
}

// In route handler
if (!validateRange(start, end, videoSize)) {
  res.writeHead(416, {
    'Content-Range': `bytes */${videoSize}`
  });
  res.end();
  return;
}
```

### Anti-Patterns to Avoid
- **Using .pipe() without error handlers:** Can cause memory leaks and crashes. Use `stream.pipeline()` instead.
- **Returning 200 OK for Range requests:** Safari will fail to play video. Must return 206 Partial Content.
- **Missing Accept-Ranges header on non-range requests:** Safari tests Range support on initial request; missing header means no playback.
- **Setting Accept-Ranges without implementing Range logic:** Advertising support you don't implement causes playback failures.
- **Missing Content-Range in CORS exposedHeaders:** Cross-origin requests will fail on iOS Safari if Content-Range isn't exposed.
- **URL paths without file extensions:** Safari requires video URLs to end with appropriate extensions (e.g., `/video.mp4` not `/video/123`).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Stream error handling | Manual .pipe() with error listeners | stream.pipeline() | Handles errors, backpressure, cleanup automatically; prevents memory leaks |
| Range header parsing | Custom regex | Range header has edge cases (multiple ranges, suffix ranges like `bytes=-500`) that are easy to miss |
| CORS configuration | Manual header setting | cors npm package | Handles preflight, credentials, exposed headers correctly |
| Backpressure management | Manual drain events | stream.pipe() or pipeline() | Node.js handles backpressure automatically; manual is error-prone |

**Key insight:** Video streaming looks deceptively simple but has many edge cases. iOS Safari's strict requirements, memory management under load, proper error handling, and Range header variations all require careful implementation. The Node.js stream API is designed specifically to handle these cases—use it.

## Common Pitfalls

### Pitfall 1: Safari's Initial 2-Byte Request Fails
**What goes wrong:** Video doesn't play on iOS Safari despite working in other browsers. Safari makes a `Range: bytes=0-1` request to test Range support, and if the server responds with 200 OK instead of 206, Safari moves to next source or fails.
**Why it happens:** Developers test with Chrome/Firefox which are more forgiving, or test with full file downloads. Safari's proactive Range testing is unique.
**How to avoid:** Always respond with 206 Partial Content for ANY Range request, even single-byte requests. Include Accept-Ranges header on ALL responses, even 200 OK.
**Warning signs:** "Works in Chrome but not Safari," video element shows play button but clicking does nothing, no errors in console.

### Pitfall 2: CORS Headers Block Range Responses
**What goes wrong:** Cross-origin video requests fail on iOS Safari specifically. Browser makes Range request but JavaScript can't read Content-Range header, causing playback to fail or seek to break.
**Why it happens:** Content-Range, Accept-Ranges, and Content-Length are not CORS-safelisted headers. Without `Access-Control-Expose-Headers`, browsers block JavaScript access even if request succeeds.
**How to avoid:** Set `Access-Control-Expose-Headers: Content-Range, Accept-Ranges, Content-Length` in CORS configuration. Use cors middleware with `exposedHeaders` option.
**Warning signs:** Network tab shows 206 responses but video won't seek, CORS errors in console mentioning headers, works when served from same origin.

### Pitfall 3: Memory Leaks from .pipe() Without Error Handling
**What goes wrong:** Server memory grows unbounded under load, eventually crashes. Memory usage doesn't correspond to active connections.
**Why it happens:** Using `stream.pipe()` without proper error handling on all streams. If a stream emits error and isn't handled, Node.js may not clean up resources. Client disconnects mid-stream can leak memory.
**How to avoid:** Use `stream.pipeline()` from 'stream/promises' instead of .pipe(). Pipeline automatically handles errors and cleanup. If using .pipe(), attach error handlers to every stream.
**Warning signs:** Memory usage grows over time, more pronounced with video streaming, doesn't decrease after requests complete, "Maximum call stack size exceeded" or out-of-memory crashes.

### Pitfall 4: Wrong Content-Range Calculation
**What goes wrong:** Video plays but seeking fails, jumps to wrong positions, or shows incorrect duration. Safari may show errors like "This video format is not supported."
**Why it happens:** Off-by-one errors in byte range calculation. `Content-Range: bytes ${start}-${end}/${total}` uses inclusive end, but many calculate exclusive end. Also calculating end as `start + CHUNK_SIZE` without checking it doesn't exceed file size.
**How to avoid:** Remember: ranges are inclusive on both ends. Calculate as `end = Math.min(start + CHUNK_SIZE, fileSize - 1)`. Content-Length should be `end - start + 1`. Validate that end doesn't exceed fileSize - 1.
**Warning signs:** Seeking near end of video fails, last chunk errors, video duration shows incorrectly, "Content-Range" errors in server logs.

### Pitfall 5: Missing File Extension in Proxy URL
**What goes wrong:** Video fails to play specifically in Safari, works in other browsers. No clear error message.
**Why it happens:** Safari requires video URLs to end with appropriate file extension (.mp4, .webm, etc.). This is Safari-specific behavior not documented in standards.
**How to avoid:** Design proxy URLs to include extension: `/api/media/:id/:filename` where filename includes extension, or `/api/media/:id.mp4`. Ensure Content-Type header matches extension.
**Warning signs:** Works everywhere except Safari, no CORS or Range errors, Safari console may show "Failed to load resource" without details.

### Pitfall 6: Signed URL Expiration During Playback
**What goes wrong:** Video starts playing but fails partway through, especially if user pauses and resumes later. Seeking to unwatched portions fails.
**Why it happens:** Supabase signed URLs expire (typically 60-3600 seconds). If video playback + user interaction exceeds expiry, subsequent Range requests to Supabase fail with 403.
**How to avoid:** Generate signed URLs with generous expiry (3600s minimum) for video. Consider using S3 SDK for direct access to avoid expiration, or implement signed URL refresh in proxy. Document expected video length vs URL expiry.
**Warning signs:** Video fails mid-playback after several minutes, 403 errors in proxy logs, fails specifically when seeking to later parts of long videos.

### Pitfall 7: Not Handling Invalid Range Requests
**What goes wrong:** Server crashes or hangs when receiving malformed Range headers or ranges exceeding file size.
**Why it happens:** Not validating Range header before processing. Attackers or buggy clients can send `Range: bytes=999999999-` for small file, causing crashes.
**How to avoid:** Validate start < fileSize, end < fileSize, start <= end. Return 416 Range Not Satisfiable with `Content-Range: bytes */${fileSize}` for invalid ranges. Handle missing or malformed Range header gracefully.
**Warning signs:** Server crashes with specific clients, errors parsing Range header, negative or huge Content-Length values in logs.

## Code Examples

Verified patterns from official sources:

### Parsing Range Header Safely
```javascript
// Source: https://www.codeproject.com/Articles/813480/HTTP-Partial-Content-In-Node-js
function parseRange(rangeHeader, fileSize) {
  if (!rangeHeader) {
    return null;
  }

  const parts = rangeHeader.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  // Handle suffix-byte-range-spec (e.g., bytes=-500 means last 500 bytes)
  if (isNaN(start)) {
    const suffixLength = parseInt(parts[1], 10);
    return {
      start: Math.max(0, fileSize - suffixLength),
      end: fileSize - 1
    };
  }

  return { start, end: Math.min(end, fileSize - 1) };
}
```

### Using stream.pipeline for Safety
```javascript
// Source: https://nodejs.org/api/stream.html
import { pipeline } from 'stream/promises';

// Correct: Automatic error handling
try {
  await pipeline(sourceStream, transformStream, res);
} catch (error) {
  console.error('Pipeline failed:', error);
  if (!res.headersSent) {
    res.status(500).send('Stream error');
  }
}

// Incorrect: Manual .pipe() without error handling
// DON'T DO THIS:
// sourceStream.pipe(transformStream).pipe(res);
```

### Complete Range Request Implementation
```javascript
// Source: Adapted from https://blog.logrocket.com/build-video-streaming-server-node/
// and https://smoores.dev/post/http_range_requests/
import { createReadStream, promises as fs } from 'fs';
import { pipeline } from 'stream/promises';

app.get('/video/:id', async (req, res) => {
  try {
    const videoPath = `/path/to/videos/${req.params.id}.mp4`;
    const stats = await fs.stat(videoPath);
    const fileSize = stats.size;
    const range = req.headers.range;

    // Always include Accept-Ranges, even for non-range requests
    if (!range) {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes'
      });
      const stream = createReadStream(videoPath);
      await pipeline(stream, res);
      return;
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

    // Validate range
    if (start >= fileSize || end >= fileSize || start > end) {
      res.writeHead(416, {
        'Content-Range': `bytes */${fileSize}`
      });
      res.end();
      return;
    }

    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4'
    };

    res.writeHead(206, headers);
    const stream = createReadStream(videoPath, { start, end });
    await pipeline(stream, res);
  } catch (error) {
    console.error('Video streaming error:', error);
    if (!res.headersSent) {
      res.status(500).send('Video streaming failed');
    }
  }
});
```

### Supabase Storage Fetch with Range
```javascript
// Source: https://supabase.com/docs/reference/javascript/storage-from-createsignedurl
async function fetchSupabaseRange(bucket, path, start, end) {
  const { data: signedData, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600);

  if (error) throw error;

  const response = await fetch(signedData.signedUrl, {
    headers: {
      Range: `bytes=${start}-${end}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase fetch failed: ${response.status}`);
  }

  return response.body; // Returns readable stream
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| .pipe() for streaming | stream.pipeline() | Node.js 10+ (2018) | Automatic error handling, prevents memory leaks |
| AWS SDK v2 | AWS SDK v3 | 2020 | Body is ReadableStream not Buffer, better for streaming |
| Manual CORS headers | cors middleware | Longstanding | Easier configuration, handles preflight correctly |
| Buffering entire file | Streaming with Range | Always preferred | Essential for video, reduces memory |

**Deprecated/outdated:**
- **express-partial-content package**: Last updated March 2019, no maintenance, use manual implementation
- **AWS SDK v2**: Use v3 for S3-compatible access to Supabase Storage if going S3 route
- **Using .pipe() without error handling**: Use pipeline() from stream/promises for async/await error handling

## Open Questions

Things that couldn't be fully resolved:

1. **Mobile Safari full download behavior**
   - What we know: Some implementations report mobile Safari downloads entire video before playback despite Range support
   - What's unclear: Specific conditions triggering this, whether it's a Safari bug or implementation issue
   - Recommendation: Test thoroughly on physical iOS devices, not just simulators. May require additional headers or different chunking strategy.

2. **Supabase Storage native Range support**
   - What we know: Supabase Storage is S3-compatible and signed URLs work with Range headers
   - What's unclear: Whether Supabase Storage CDN natively handles Range requests or if it passes through to S3
   - Recommendation: Test Range requests directly against Supabase signed URLs before implementing proxy. If they work, proxy may only need to forward Range header.

3. **Optimal chunk size for iOS Safari**
   - What we know: Common chunk size is 1MB (10^6 bytes), used in most examples
   - What's unclear: Whether iOS Safari has specific chunk size preferences or limits
   - Recommendation: Start with 1MB, monitor performance. Consider making configurable for different video sizes.

4. **Multiple Range support**
   - What we know: HTTP Range header supports multiple ranges (e.g., `bytes=0-100,200-300`)
   - What's unclear: Whether iOS Safari ever uses multipart ranges for video
   - Recommendation: Implement single-range support first. Add multipart Range support only if logs show multipart requests.

## Sources

### Primary (HIGH confidence)
- LogRocket Blog: Build a video streaming server with Node.js - https://blog.logrocket.com/build-video-streaming-server-node/ (updated January 2026)
- CodeProject: HTTP 206 Partial Content In Node.js - https://www.codeproject.com/Articles/813480/HTTP-Partial-Content-In-Node-js
- Smoores.dev: Serving Video with HTTP Range Requests - https://smoores.dev/post/http_range_requests/ (May 2025)
- Node.js Official Docs: Stream API - https://nodejs.org/api/stream.html
- MDN Web Docs: HTTP 206 Partial Content - https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/206
- MDN Web Docs: HTTP 416 Range Not Satisfiable - https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/416
- Supabase Docs: JavaScript API Reference createSignedUrl - https://supabase.com/docs/reference/javascript/storage-from-createsignedurl
- Supabase Docs: Serving assets from Storage - https://supabase.com/docs/guides/storage/serving/downloads
- Express.js Docs: CORS middleware - https://expressjs.com/en/resources/middleware/cors.html

### Secondary (MEDIUM confidence)
- Corevo.io: The Weird Case of Streaming in Safari - https://corevo.io/the-weird-case-of-video-streaming-in-safari/
- Kevin Jiang's Blog: Fixing iOS HTTP Video Playback Issues - https://jiangsc.me/2024/07/07/ios-http-streaming-issue/ (July 2024)
- Phil Nash Blog: Service workers beware Safari's range request - https://philna.sh/blog/2018/10/23/service-workers-beware-safaris-range-request/ (2018)
- Cloudinary Guide: Node.js Video Streaming Server - https://cloudinary.com/guides/live-streaming-video/node-js-video-streaming-server
- DEV Community: Error Handling in Node.js Streams - https://dev.to/ruben_alapont/error-handling-in-nodejs-streams-best-practices-dhb
- GitHub: SukantGujar/express-partial-content - https://github.com/SukantGujar/express-partial-content (implementation reference, but unmaintained)

### Tertiary (LOW confidence - flagged for validation)
- Supabase S3 compatibility for streaming video - needs testing to verify Range pass-through behavior
- Mobile Safari full-download issue - anecdotal report in LogRocket comments, needs device testing to confirm

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Express, Node.js streams, and Supabase client are verified and current
- Architecture: HIGH - Range request patterns verified from official docs and recent articles (2024-2026)
- Pitfalls: HIGH - Safari requirements verified from multiple sources, stream memory issues well-documented

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - stable technology, but test Supabase Storage behavior)
