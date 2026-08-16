import worker from "../dist/server/index.js";

export default async function handler(req, res) {
  try {
    const host = req.headers.host || "localhost";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const url = new URL(req.url, `${proto}://${host}`);

    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (val !== undefined) {
        if (Array.isArray(val)) {
          for (const v of val) headers.append(key, v);
        } else {
          headers.set(key, val);
        }
      }
    }

    const request = new Request(url.href, {
      method: req.method,
      headers,
    });

    const response = await worker.fetch(request, {}, {
      waitUntil() {},
      passThroughOnException() {},
    });

    res.statusCode = response.status;
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }

    const arrayBuffer = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end(`Internal Server Error: ${error?.message || error}`);
  }
}
