import test from "node:test";
import assert from "node:assert/strict";
import { createServer, request } from "node:http";
import {
  mkdtemp,
  mkdir,
  writeFile,
  symlink,
  rm,
  readFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStaticHandler } from "../scripts/static-handler.mjs";
import { securityHeaders } from "../scripts/security-headers.mjs";
import { makeBrief } from "../.sites-runtime/render.mjs";
import { whatsappMessageUrl } from "../src/whatsapp.js";

test("production hosting retains the same security headers as the local server", async () => {
  const config = JSON.parse(
    await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(
    Object.fromEntries(
      config.headers[0].headers.map(({ key, value }) => [key, value]),
    ),
    securityHeaders,
  );
});

function send(server, path, method = "GET") {
  return new Promise((accept, reject) => {
    const req = request(
      { hostname: "127.0.0.1", port: server.address().port, path, method },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () =>
          accept({ status: res.statusCode, headers: res.headers, body }),
        );
      },
    );
    req.on("error", reject);
    req.end();
  });
}

test("static server blocks traversal, internal files, malformed URLs and unsafe methods", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "fotei-security-"));
  const root = join(directory, "dist");
  await mkdir(root);
  await writeFile(join(root, "index.html"), "<h1>Fotei</h1>");
  await writeFile(join(root, ".env"), "private-fixture");
  await writeFile(join(root, "config.json"), "private-fixture");
  await writeFile(join(directory, "outside.html"), "outside-fixture");
  const server = createServer(createStaticHandler(root));
  await new Promise((accept) => server.listen(0, "127.0.0.1", accept));
  t.after(async () => {
    await new Promise((accept) => server.close(accept));
    // directory is an absolute mkdtemp path created solely for this test.
    await rm(directory, { recursive: true, force: true });
  });
  const page = await send(server, "/");
  assert.equal(page.status, 200);
  assert.equal(page.body, "<h1>Fotei</h1>");
  for (const [name, value] of Object.entries(securityHeaders))
    assert.equal(page.headers[name.toLowerCase()], value);
  assert.equal((await send(server, "/", "HEAD")).body, "");
  for (const path of [
    "/%2e%2e%2foutside.html",
    "/..%5coutside.html",
    "/%5c..%5coutside.html",
    "/.env",
    "/%2eenv",
    "/config.json",
    "/index.html%00",
    "/C:%5cWindows%5cwin.ini",
  ]) {
    const response = await send(server, path);
    assert.equal(response.status, 403, path);
    assert.ok(!response.body.includes("fixture"), path);
  }
  for (const path of ["/%", "/%FF"])
    assert.equal((await send(server, path)).status, 400);
  assert.equal((await send(server, "/missing.html")).status, 404);
  const post = await send(server, "/", "POST");
  assert.equal(post.status, 405);
  assert.equal(post.headers.allow, "GET, HEAD");
  await symlink(
    directory,
    join(root, "linked"),
    process.platform === "win32" ? "junction" : "dir",
  );
  assert.equal((await send(server, "/linked/outside.html")).status, 403);
});

test("malicious WhatsApp text stays encoded inside the fixed destination", () => {
  const attack =
    "<script>alert(1)</script>&phone=evil#fragment\r\nhttps://evil.example";
  const message = makeBrief({
    name: attack,
    service: "Ensaio Fotográfico",
    idea: attack,
  });
  const url = new URL(whatsappMessageUrl(message));
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/5511958766351");
  assert.equal(url.hash, "");
  assert.deepEqual([...url.searchParams.keys()], ["text"]);
  assert.equal(url.searchParams.get("text"), message);
});

test("brief validation rejects type confusion, oversized inputs and unknown plans", () => {
  const valid = { name: "Cliente", service: "Gestão de Redes Sociais" };
  for (const input of [
    null,
    {},
    { ...valid, name: {} },
    { ...valid, name: "x".repeat(101) },
    { ...valid, idea: "x".repeat(2001) },
    { ...valid, location: "x".repeat(201) },
    // eslint-disable-next-line no-script-url -- deliberately malicious test input
    { ...valid, service: "javascript:alert(1)" },
    { ...valid, tiktok: "true" },
    { ...valid, plan: "__proto__" },
    { ...valid, date: {} },
  ])
    assert.throws(() => makeBrief(input));
});
