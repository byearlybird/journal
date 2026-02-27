import { $ } from "bun";

await $`xcrun altool --upload-app --type ios --file "ios/App/output/App.ipa" --apiKey ${process.env.APPLE_API_KEY_ID} --apiIssuer ${process.env.APPLE_API_ISSUER}`;
