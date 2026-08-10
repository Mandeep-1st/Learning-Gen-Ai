In Node.js, the main differences between HTTP/1 and HTTP/2 relate to the protocol features and how they are exposed via the APIs, although Node.js provides a compatibility API to make HTTP/2 usage similar to HTTP/1.

Here are the key differences based on the Node.js context:

1. **Protocol Differences:**
   - HTTP/1 is a text-based protocol, while HTTP/2 is a binary protocol.
   - HTTP/2 supports multiplexing multiple requests/responses over a single TCP connection, reducing latency.
   - HTTP/2 supports header compression and server push, which HTTP/1 does not.

2. **API Differences in Node.js:**
   - Node.js provides a compatibility API composed of `Http2ServerRequest` and `Http2ServerResponse` that aim to be API-compatible with HTTP/1, but they do not hide the protocol differences.
   - For example, the status message for HTTP codes is ignored in HTTP/2.
   - The `req` and `res` objects in HTTP/2 can be either HTTP/1 or HTTP/2 when using ALPN negotiation, so applications must restrict themselves to the public API of HTTP/1 and detect if HTTP/2 features can be used.

3. **Server Creation:**
   - HTTP/1 servers are created using the `http` module.
   - HTTP/2 servers are created using the `http2` module, with methods like `createServer()` for HTTP/2 compatibility API or `createSecureServer()` for HTTP/2 over TLS.
   - HTTP/2 servers can support both HTTP/1 and HTTP/2 over the same socket using ALPN negotiation by setting `allowHTTP1: true`.

4. **ALPN Negotiation:**
   - ALPN (Application-Layer Protocol Negotiation) allows a server to support both HTTPS (HTTP/1.1 over TLS) and HTTP/2 over the same socket.
   - The server detects the protocol version during the TLS handshake and provides the appropriate `req` and `res` objects.

5. **Client-side Differences:**
   - HTTP/2 clients use the `http2.connect()` method, which supports HTTP/2 features like multiplexing and server push.
   - HTTP/1 clients use the `http` or `https` modules with simpler request methods.

6. **Unsupported Features:**
   - Upgrading from non-TLS HTTP/1 servers to HTTP/2 is not supported in Node.js.
   - Many internal methods or states used in HTTP/1 modules are not supported in HTTP/2 due to different implementations.

In summary, while Node.js provides a compatibility API to make HTTP/2 programming similar to HTTP/1, HTTP/2 introduces new protocol features and requires different server/client setup, especially around TLS and ALPN negotiation. Applications should use the compatibility API for easier transition but be aware of the underlying protocol differences.