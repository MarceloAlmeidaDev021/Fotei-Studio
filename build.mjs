import { build } from "esbuild";
import { format } from "prettier";
import { mkdir, cp, writeFile, readFile, rm } from "node:fs/promises";
await mkdir(".sites-runtime", { recursive: true });
await build({
  entryPoints: ["src/render.jsx"],
  outfile: ".sites-runtime/render.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  banner: {
    js: "import {createRequire} from 'node:module';const require=createRequire(import.meta.url);",
  },
});
const { render } = await import("./.sites-runtime/render.mjs");
const markup = render();
await mkdir("dist", { recursive: true });
await cp("public", "dist", { recursive: true });
await build({
  entryPoints: ["src/client.jsx"],
  outfile: "dist/app.js",
  bundle: true,
  minify: false,
  format: "esm",
  platform: "browser",
  jsx: "automatic",
  target: ["es2020"],
  define: { "process.env.NODE_ENV": '"production"' },
});
const css = await readFile("src/style.css", "utf8");
await writeFile("dist/style.css", css);
const favicon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23eee5da'/%3E%3Ctext x='8' y='25' fill='%2391642c' font-family='Georgia' font-size='29'%3Ef%3C/text%3E%3C/svg%3E";
await writeFile(
  "dist/index.html",
  `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#eee5da"><title>Fotei Studio — Ensaios e Gestão de Redes Sociais</title><meta name="description" content="Ensaios fotográficos e gestão de redes sociais por Thaina Rocha. Conheça os planos Básico, Intermediário e Premium e o adicional TikTok."><link rel="icon" type="image/svg+xml" href="${favicon}"><link rel="preload" href="/assets/cabinet-500.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/style.css"></head><body><div id="root">${markup}</div><script type="module" src="/app.js"></script></body></html>`,
);
console.log("Fotei built: prerendered React + GSAP, static deployment.");
for (const file of [
  "dist/index.html",
  "dist/credits.html",
  "dist/style.css",
  "dist/app.js",
]) {
  await writeFile(
    file,
    await format(await readFile(file, "utf8"), {
      filepath: file,
      tabWidth: 2,
      useTabs: false,
      endOfLine: "lf",
    }),
  );
}
