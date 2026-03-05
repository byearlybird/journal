import { Glob } from "bun";

const distDir = "./dist";
const glob = new Glob("**/*.{js,css,html,wasm,webp,webmanifest}");

const entries: { url: string; revision: string | null }[] = [];

for await (const path of glob.scan(distDir)) {
  if (path === "sw.js") continue;

  const file = Bun.file(`${distDir}/${path}`);
  const hash = Bun.hash(await file.arrayBuffer()).toString(16);

  // Hashed filenames (contain hash in name) get revision: null
  const isHashed = /[-.][\da-f]{8,}\./i.test(path);

  entries.push({
    url: `/${path}`,
    revision: isHashed ? null : hash,
  });
}

// Inject manifest into sw.js
const swPath = `${distDir}/sw.js`;
const swTemplate = await Bun.file(swPath).text();
const swOutput = swTemplate.replace(
  "self.__SW_MANIFEST__ || []",
  JSON.stringify(entries),
);
await Bun.write(swPath, swOutput);

console.log(`SW manifest: ${entries.length} entries injected into sw.js`);
