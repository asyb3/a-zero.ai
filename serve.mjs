// node serve.mjs → open http://localhost:5050 ; the page editor's Save then writes index.html in place.
import http from "node:http";
import fs from "node:fs";

const PORT = 5050;
const file = new URL("./index.html", import.meta.url);
const hosts = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`]);

http.createServer((req, res) => {
  const path = req.url.split(/[?#]/)[0];
  if (!hosts.has(req.headers.host) || (path !== "/" && path !== "/index.html")) return res.writeHead(404).end();
  if (req.method === "GET") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    return fs.createReadStream(file).pipe(res);
  }
  if (req.method !== "PUT") return res.writeHead(405).end(); // no CORS headers, so other sites can't PUT
  let body = "";
  req.setEncoding("utf8");
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    if (!body.startsWith("<!doctype html>") || !body.includes('<template id="az-page">')) return res.writeHead(400).end();
    const tmp = new URL("./index.html.tmp", import.meta.url);
    fs.writeFileSync(tmp, body);
    fs.renameSync(tmp, file); // atomic: never a half-written index.html
    res.writeHead(204).end();
  });
}).listen(PORT, "127.0.0.1", () => console.log(`editing at http://localhost:${PORT}`));
