import tailwind from "bun-plugin-tailwind";

const result = await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: "./dist",
  plugins: [tailwind],
  minify: true,
  sourcemap: "linked",
  env: "PUBLIC_*",
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log(`Build succeeded: ${result.outputs.length} files written to ./dist`);
