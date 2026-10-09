import { readFile, realpath } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { securityHeaders } from "./security-headers.mjs";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

export function createStaticHandler(directory) {
  const root = resolve(directory);
  return async (request, response) => {
    for (const [name, value] of Object.entries(securityHeaders))
      response.setHeader(name, value);
    response.setHeader("Cache-Control", "no-store");
    const end = (code, message) => {
      response.writeHead(code, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(request.method === "HEAD" ? undefined : message);
    };
    if (!["GET", "HEAD"].includes(request.method)) {
      response.setHeader("Allow", "GET, HEAD");
      end(405, "Método não permitido.");
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
    } catch {
      end(400, "URL inválida.");
      return;
    }
    if (
      pathname.includes("\\") ||
      pathname.includes("\0") ||
      pathname.split("/").some((part) => part.startsWith("."))
    ) {
      end(403, "Acesso negado.");
      return;
    }
    const file = resolve(
      root,
      `.${pathname === "/" ? "/index.html" : pathname}`,
    );
    if (!file.startsWith(root + sep) || !Object.hasOwn(types, extname(file))) {
      end(403, "Acesso negado.");
      return;
    }
    try {
      const [realRoot, realFile] = await Promise.all([
        realpath(root),
        realpath(file),
      ]);
      if (!realFile.startsWith(realRoot + sep)) {
        end(403, "Acesso negado.");
        return;
      }
      const contents = await readFile(realFile);
      response.writeHead(200, { "Content-Type": types[extname(file)] });
      response.end(request.method === "HEAD" ? undefined : contents);
    } catch {
      end(404, "Arquivo não encontrado.");
    }
  };
}
