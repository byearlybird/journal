const PBKDF2_ITERATIONS = 100_000;

/**
 * Derives a non-extractable AES-GCM key from a passphrase using PBKDF2.
 * Uses the userId as salt to ensure different users get different keys.
 *
 * TODO: userId should come from the auth system once implemented.
 */
export async function deriveKey(passphrase: string, userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(userId),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    passphraseKey,
    { name: "AES-GCM", length: 256 },
    false, // extractable: false - key material cannot be exported
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypts plaintext using AES-GCM.
 * Returns base64-encoded string containing IV (12 bytes) + ciphertext.
 */
export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext),
  );

  // Concatenate IV + ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts base64-encoded data (IV + ciphertext) using AES-GCM.
 * Throws on wrong passphrase (integrity check fails).
 */
export async function decrypt(base64Data: string, key: CryptoKey): Promise<string> {
  const combined = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

  // Extract IV (first 12 bytes) and ciphertext (rest)
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);

  return new TextDecoder().decode(plaintext);
}

/**
 * Encrypts binary data (File/Blob/ArrayBuffer/Uint8Array) using AES-GCM.
 * Returns ArrayBuffer containing IV (12 bytes) + ciphertext.
 */
export async function encryptFile(
  data: File | Blob | ArrayBuffer | Uint8Array,
  key: CryptoKey,
): Promise<ArrayBuffer> {
  // Convert input to ArrayBuffer
  let arrayBuffer: ArrayBuffer;
  if (data instanceof File || data instanceof Blob) {
    arrayBuffer = await data.arrayBuffer();
  } else if (data instanceof ArrayBuffer) {
    arrayBuffer = data;
  } else {
    // For Uint8Array, create a new ArrayBuffer from the view
    arrayBuffer = new Uint8Array(data).buffer;
  }

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, arrayBuffer);

  // Concatenate IV + ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return combined.buffer;
}

/**
 * Decrypts binary data (ArrayBuffer/Uint8Array) containing IV + ciphertext using AES-GCM.
 * Returns ArrayBuffer with decrypted plaintext.
 * Throws on wrong passphrase (integrity check fails).
 */
export async function decryptFile(
  encryptedData: ArrayBuffer | Uint8Array,
  key: CryptoKey,
): Promise<ArrayBuffer> {
  // Convert input to Uint8Array
  const combined =
    encryptedData instanceof Uint8Array ? encryptedData : new Uint8Array(encryptedData);

  // Extract IV (first 12 bytes) and ciphertext (rest)
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);

  return plaintext;
}
