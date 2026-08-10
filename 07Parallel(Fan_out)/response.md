In Node.js, the difference between `http` and `http2` modules is as follows:

- **`http` module**:
  - Supports HTTP/1.x protocol.
  - Designed to handle large, possibly chunk-encoded messages without buffering entire requests or responses, allowing streaming.
  - Provides a client and server API for HTTP/1.
  - HTTP message headers are represented as objects with lowercased keys.
  - Can be imported via `require('node:http')` or `import * as http from 'node:http'`.

- **`http2` module**:
  - Supports HTTP/2 protocol.
  - Provides two APIs:
    - **Core API**: A low-level interface designed specifically for HTTP/2 features, not compatible with HTTP/1 API.
    - **Compatibility API**: Provides API compatibility with HTTP/1 to allow developing applications that support both HTTP/1 and HTTP/2, but only supports the public HTTP/1 API.
  - Supports ALPN negotiation to allow both HTTPS and HTTP/2 over the same socket.
  - Server push (`PUSH_PROMISE`) and some advanced HTTP/2 features are not implemented.
  - Requires secure connections (`createSecureServer`) for browser clients since unencrypted HTTP/2 is not supported by browsers.
  - Can be imported via `require('node:http2')` or `import * as http2 from 'node:http2'`.

In summary, `http` is for HTTP/1.x, while `http2` is for HTTP/2 with additional features and APIs designed specifically for HTTP/2 protocol, including compatibility layers to ease migration or dual support.