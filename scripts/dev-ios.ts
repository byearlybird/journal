import { $ } from "bun";

await Promise.all([
  $`bun dev`,
  $`bunx cap run ios --target-name "iPhone 17" --live-reload --host ${process.env.LOCAL_IP} --port ${process.env.LOCAL_PORT}`,
]);
