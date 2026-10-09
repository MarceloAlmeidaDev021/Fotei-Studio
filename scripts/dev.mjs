import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { watch } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { spawn } from "node:child_process";

const root = resolve("dist");
const port = Number(process.env.PORT || 5173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};

function build() {
  return new Promise((accept, reject) => {
    const child = spawn(process.execPath, ["build.mjs"], { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? accept()
        : reject(new Error("Corrija o erro de compilação indicado acima.")),
    );
  });
}

await build();
let building = false;
let pending = false;
let timer;
async function rebuild() {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  try {
    await build();
    console.log("Projeto atualizado. Recarregue a página no navegador.");
  } catch (error) {
    console.error(error.message);
  } finally {
    building = false;
    if (pending) {
      pending = false;
      void rebuild();
    }
  }
}
const changed = () => {
  clearTimeout(timer);
  timer = setTimeout(rebuild, 150);
};
const watchers = ["src", "public"].map((path) =>
  watch(path, { recursive: true }, changed),
);
watchers.push(watch("build.mjs", changed));

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    const file = resolve(
      root,
      `.${pathname === "/" ? "/index.html" : pathname}`,
    );
    if (!file.startsWith(root + sep)) {
      response.writeHead(403);
      response.end("Acesso negado.");
      return;
    }
    const contents = await readFile(file);
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(contents);
  } catch {
    response.writeHead(404);
    response.end("Arquivo não encontrado.");
  }
});
server.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
server.listen(port, "127.0.0.1", () =>
  console.log(
    `Fotei Studio: http://localhost:${port}\nEdite src/ e recarregue o navegador para ver as alterações. Ctrl+C para encerrar.`,
  ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    clearTimeout(timer);
    watchers.forEach((watcher) => watcher.close());
    server.close(() => process.exit(0));
  });
