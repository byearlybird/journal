# Sync Provider & Key Management Architecture Proposal

**Date:** 2026-01-11
**Status:** Research & Proposal

---

## Executive Summary

This document proposes a re-architecture of the journal application's sync and key management systems based on research of industry best practices and popular open source projects (Signal, Standard Notes, Joplin). The proposed architecture introduces:

1. **Sync Provider Abstraction**: Pluggable sync targets supporting multiple backends
2. **Enhanced Key Management**: Multi-key support with key rotation and recovery options
3. **Improved Security**: Separation of concerns following zero-knowledge principles
4. **Better Extensibility**: Clear interfaces for future features (collaboration, backup, etc.)

---

## Current Architecture Analysis

### Strengths ✓

1. **Zero-Knowledge E2E Encryption**: Server never sees plaintext data
2. **Non-Extractable Keys**: Browser prevents key export (security)
3. **CRDT-based Conflict Resolution**: Eventstamp system provides causal ordering
4. **Offline-First**: SQLite in browser with sync as secondary concern
5. **Simple Architecture**: Direct R2 PUT/GET makes debugging easy

### Limitations ⚠

1. **Tightly Coupled Sync**: Hard-coded to single R2 backend
2. **Single Key System**: No key rotation, recovery, or device-specific keys
3. **Monolithic Sync Logic**: Poll-based sync mixed with crypto concerns
4. **Limited Flexibility**: Cannot easily add WebDAV, S3, or self-hosted options
5. **No Key Versioning**: Cannot upgrade encryption algorithms without breaking changes
6. **Passphrase-Only**: No support for hardware keys, biometrics, or key files

---

## Research Findings

### Industry Patterns (2026)

From web research, key trends in sync and key management include:

#### Sync Architecture
- **Local-First with Invisible Sync**: Client maintains source of truth, server as relay
- **Provider Pattern**: Abstract sync targets for multiple backend support
- **Operation-Based CRDTs**: Append-only operation logs for efficient conflict-free sync
- **Message Queuing**: Kafka/RabbitMQ for buffering and guaranteed delivery in enterprise systems

#### Key Management
- **Multi-Key Hierarchies**: Master keys encrypt data keys, separate keys per device/session
- **Key Rotation**: Regular key updates without re-encrypting all data
- **Hardware Security Modules (HSM)**: Isolated key storage where possible
- **Zero-Knowledge Architecture**: Treating servers as untrusted entities
- **Key Derivation**: PBKDF2 (100k+ iterations) or Argon2 for passphrase-based keys

### Case Study: Joplin

**Sync Provider Architecture:**
- Abstract `SyncTarget` interface with multiple implementations
- Supported backends: Joplin Server, Joplin Cloud, WebDAV, Dropbox, OneDrive, S3, Nextcloud
- Encryption/decryption happens at sync boundary, not in storage layer
- Background `DecryptionWorker` for async operations

**Key Management:**
- Master Key system: 256-byte (2048-bit) randomly generated
- Multiple master keys supported for rotation
- Master password encrypts the master key (not the data directly)
- Keys synced encrypted across devices
- PBKDF2 for key derivation, AES-256-GCM for encryption
- Implementation: `lib/services/e2ee/EncryptionService.ts`

**Source:** [Joplin E2EE Documentation](https://joplinapp.org/help/apps/sync/e2ee/)

### Case Study: Standard Notes

**Sync Architecture:**
- "Dumb server" design: Server is non-trustworthy entity
- Open specification for encrypt/decrypt/sync operations
- Self-hostable with custom server URL support
- AWS for default hosting, but client-agnostic

**Encryption:**
- XChaCha20 encryption (modern, high-performance)
- Zero-knowledge: Keys only on client devices
- All encryption client-side before transmission
- Independent, audited specification

**Source:** [Standard Notes Security](https://standardnotes.com/help/security)

### Case Study: Signal Protocol

**Key Architecture:**
- Multi-layered key system:
  - **Identity Keys**: Long-term (per account)
  - **Signed Pre-Keys**: Medium-term (periodically rotated)
  - **One-Time Pre-Keys**: Ephemeral (single use)
- **X3DH**: Extended Triple Diffie-Hellman for initial key agreement
- **Double Ratchet**: Forward secrecy - new keys per message
- **Curve25519**: Elliptic curve cryptography for key exchange
- **AES-256 + HMAC-SHA256**: Symmetric encryption with authentication

**Key Principles:**
- Forward secrecy (past messages safe if current key compromised)
- Cryptographic deniability
- Key rotation built into protocol

**Source:** [Signal Protocol Overview](https://signal.org/docs/)

### Best Practices (NIST, OWASP, CSA)

From authoritative sources:

1. **Key Protection:**
   - Encrypt keys with keys of equal/greater strength
   - Never send keys alongside encrypted data
   - Store encrypted keys separately from encrypted data
   - Use HSMs or secure enclaves where available

2. **Access Control:**
   - No single user should have sole access to keys
   - Separation of duties and least privilege
   - Document key lifecycle policies

3. **Key Lifecycle:**
   - Generation → Distribution → Usage → Rotation → Revocation → Destruction
   - Automated key rotation where possible
   - Regular audits and compliance checks

4. **Architecture:**
   - Group keys by purpose/endpoint for scalability
   - Support millions of keys with unified management console
   - Implement key versioning for algorithm updates

**Sources:**
- [NIST Key Management Guidelines](https://csrc.nist.gov/projects/key-management/key-management-guidelines)
- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
- [Cloud Security Alliance Key Management](https://cloudsecurityalliance.org/artifacts/key-management-lifecycle-best-practices)

---

## Proposed Architecture

### 1. Sync Provider Abstraction

Create a pluggable sync architecture inspired by Joplin's sync targets:

```typescript
// app/sync/providers/base.ts
export interface SyncProvider {
  name: string;

  // Core operations
  pull(): Promise<ArrayBuffer | null>;
  push(data: ArrayBuffer): Promise<void>;

  // Metadata
  getMetadata(): Promise<SyncMetadata>;

  // Lifecycle
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  // Status
  isConnected(): boolean;
  supportsFeature(feature: SyncFeature): boolean;
}

export interface SyncMetadata {
  lastModified: Date;
  size: number;
  etag?: string;
  version?: string;
}

export enum SyncFeature {
  VERSIONING = 'versioning',
  CONFLICT_DETECTION = 'conflict_detection',
  INCREMENTAL_SYNC = 'incremental_sync',
  COMPRESSION = 'compression',
}

// Sync Manager orchestrates providers
export class SyncManager {
  constructor(
    private provider: SyncProvider,
    private encryptionService: EncryptionService,
    private db: Db
  ) {}

  async sync(): Promise<SyncResult> {
    // 1. Pull from provider
    const encrypted = await this.provider.pull();

    // 2. Decrypt at boundary
    const decrypted = encrypted
      ? await this.encryptionService.decrypt(encrypted)
      : null;

    // 3. Merge into local DB
    if (decrypted) {
      await this.mergeRemoteData(decrypted);
    }

    // 4. Export local changes
    const localData = await this.exportLocalData();

    // 5. Encrypt at boundary
    const encryptedLocal = await this.encryptionService.encrypt(localData);

    // 6. Push to provider
    await this.provider.push(encryptedLocal);

    return { success: true };
  }
}
```

**Provider Implementations:**

```typescript
// app/sync/providers/r2-provider.ts
export class R2Provider implements SyncProvider {
  name = 'cloudflare-r2';

  constructor(private config: R2Config) {}

  async pull(): Promise<ArrayBuffer | null> {
    const response = await fetch('/api/journal');
    if (response.status === 404) return null;
    return await response.arrayBuffer();
  }

  async push(data: ArrayBuffer): Promise<void> {
    await fetch('/api/journal', {
      method: 'PUT',
      body: data,
    });
  }
}

// app/sync/providers/webdav-provider.ts
export class WebDAVProvider implements SyncProvider {
  name = 'webdav';

  constructor(private config: WebDAVConfig) {}

  async pull(): Promise<ArrayBuffer | null> {
    // WebDAV GET implementation
  }

  async push(data: ArrayBuffer): Promise<void> {
    // WebDAV PUT implementation
  }
}

// app/sync/providers/local-provider.ts
export class LocalFileProvider implements SyncProvider {
  name = 'local-file';

  // For development/testing - no network
  async pull(): Promise<ArrayBuffer | null> {
    const handle = await window.showOpenFilePicker();
    const file = await handle.getFile();
    return await file.arrayBuffer();
  }

  async push(data: ArrayBuffer): Promise<void> {
    const handle = await window.showSaveFilePicker();
    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();
  }
}
```

**Configuration:**

```typescript
// app/sync/config.ts
export interface SyncConfig {
  provider: 'r2' | 'webdav' | 'local' | 's3' | 'custom';
  endpoint?: string;
  credentials?: {
    username?: string;
    password?: string;
    token?: string;
  };
  pollInterval?: number;
  retryConfig?: RetryConfig;
}

// User can configure in settings
export function createSyncProvider(config: SyncConfig): SyncProvider {
  switch (config.provider) {
    case 'r2':
      return new R2Provider(config);
    case 'webdav':
      return new WebDAVProvider(config);
    case 'local':
      return new LocalFileProvider(config);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}
```

**Benefits:**
- ✓ Support multiple backends without code changes
- ✓ Easy to add S3, WebDAV, self-hosted options
- ✓ Clear separation: sync transport vs. encryption vs. storage
- ✓ Testable: mock providers for tests
- ✓ User choice: Select backend in settings

---

### 2. Enhanced Key Management

Inspired by Signal's multi-key system and Joplin's master key architecture:

```typescript
// app/crypto/key-manager.ts

export enum KeyType {
  MASTER = 'master',      // Encrypts other keys
  DATA = 'data',          // Encrypts actual journal data
  DEVICE = 'device',      // Device-specific key
  BACKUP = 'backup',      // Recovery/backup key
}

export interface KeyDescriptor {
  id: string;
  type: KeyType;
  version: number;
  algorithm: EncryptionAlgorithm;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface EncryptionAlgorithm {
  name: 'AES-GCM' | 'ChaCha20-Poly1305';
  keySize: 128 | 256;
  kdf: 'PBKDF2' | 'Argon2id';
  kdfIterations?: number;
}

export class KeyManager {
  private keys = new Map<string, CryptoKey>();
  private descriptors = new Map<string, KeyDescriptor>();

  /**
   * Initialize key hierarchy:
   * 1. Master key from passphrase (encrypts other keys)
   * 2. Data keys from random generation (encrypt journal data)
   * 3. Device keys (optional, for multi-device)
   */
  async initialize(passphrase: string, userId: string): Promise<void> {
    // 1. Derive master key from passphrase
    const masterKey = await this.deriveMasterKey(passphrase, userId);
    this.setKey('master', masterKey, {
      id: 'master',
      type: KeyType.MASTER,
      version: 1,
      algorithm: {
        name: 'AES-GCM',
        keySize: 256,
        kdf: 'PBKDF2',
        kdfIterations: 100000,
      },
      createdAt: new Date(),
    });

    // 2. Generate or load data key
    const dataKey = await this.getOrCreateDataKey(masterKey);
    this.setKey('data-current', dataKey.key, dataKey.descriptor);
  }

  /**
   * Derive master key from passphrase
   * This key encrypts other keys, not data directly
   */
  private async deriveMasterKey(
    passphrase: string,
    userId: string
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passphraseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode(userId),
        iterations: 100000,
        hash: 'SHA-256',
      },
      passphraseKey,
      { name: 'AES-GCM', length: 256 },
      false,  // non-extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate random data key, encrypt with master key
   * Data keys are extractable (needed for key rotation)
   */
  private async getOrCreateDataKey(
    masterKey: CryptoKey
  ): Promise<{ key: CryptoKey; descriptor: KeyDescriptor }> {
    // Try to load existing encrypted data key from DB
    const stored = await this.loadEncryptedDataKey();

    if (stored) {
      // Decrypt with master key
      const decrypted = await this.decryptKey(stored.encrypted, masterKey);
      return {
        key: decrypted,
        descriptor: stored.descriptor,
      };
    }

    // Generate new random data key
    const dataKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,  // extractable (for key rotation)
      ['encrypt', 'decrypt']
    );

    const descriptor: KeyDescriptor = {
      id: crypto.randomUUID(),
      type: KeyType.DATA,
      version: 1,
      algorithm: {
        name: 'AES-GCM',
        keySize: 256,
        kdf: 'PBKDF2',
      },
      createdAt: new Date(),
    };

    // Encrypt data key with master key and store
    const encrypted = await this.encryptKey(dataKey, masterKey);
    await this.storeEncryptedDataKey(encrypted, descriptor);

    return { key: dataKey, descriptor };
  }

  /**
   * Get current data key for encryption
   */
  async getDataKey(): Promise<CryptoKey> {
    const key = this.keys.get('data-current');
    if (!key) throw new Error('No data key available');
    return key;
  }

  /**
   * Rotate data key (create new, keep old for decryption)
   */
  async rotateDataKey(): Promise<void> {
    const masterKey = this.keys.get('master');
    if (!masterKey) throw new Error('Master key not initialized');

    // Archive current data key
    const currentKey = this.keys.get('data-current');
    const currentDescriptor = this.descriptors.get('data-current');
    if (currentKey && currentDescriptor) {
      this.keys.set(`data-${currentDescriptor.id}`, currentKey);
      this.descriptors.set(`data-${currentDescriptor.id}`, currentDescriptor);
    }

    // Generate new data key
    const newDataKey = await this.getOrCreateDataKey(masterKey);
    this.setKey('data-current', newDataKey.key, newDataKey.descriptor);
  }

  /**
   * Get key by ID for decryption (supports old keys)
   */
  async getKeyById(keyId: string): Promise<CryptoKey> {
    const key = this.keys.get(`data-${keyId}`);
    if (!key) {
      // Try to load from storage
      const loaded = await this.loadArchivedKey(keyId);
      if (!loaded) throw new Error(`Key not found: ${keyId}`);
      return loaded;
    }
    return key;
  }

  /**
   * Export encrypted backup (master key encrypted with backup passphrase)
   */
  async exportBackup(backupPassphrase: string): Promise<string> {
    // Derive backup key from different passphrase
    const backupKey = await this.deriveMasterKey(
      backupPassphrase,
      'backup-salt'
    );

    // Export master key (need to re-create as extractable for backup)
    // In practice, store master key encrypted initially
    const masterKey = this.keys.get('master');
    if (!masterKey) throw new Error('No master key');

    // Encrypt all key descriptors and metadata
    const backup = {
      version: 1,
      createdAt: new Date().toISOString(),
      descriptors: Array.from(this.descriptors.values()),
    };

    const encrypted = await this.encryptData(
      JSON.stringify(backup),
      backupKey
    );

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  /**
   * Import from encrypted backup
   */
  async importBackup(
    backupString: string,
    backupPassphrase: string
  ): Promise<void> {
    const backupKey = await this.deriveMasterKey(
      backupPassphrase,
      'backup-salt'
    );

    const encrypted = Uint8Array.from(atob(backupString), c => c.charCodeAt(0));
    const decrypted = await this.decryptData(encrypted.buffer, backupKey);

    const backup = JSON.parse(new TextDecoder().decode(decrypted));

    // Restore key descriptors
    for (const descriptor of backup.descriptors) {
      this.descriptors.set(descriptor.id, descriptor);
    }
  }

  // Helper methods
  private setKey(id: string, key: CryptoKey, descriptor: KeyDescriptor) {
    this.keys.set(id, key);
    this.descriptors.set(id, descriptor);
  }

  private async encryptKey(
    key: CryptoKey,
    withKey: CryptoKey
  ): Promise<ArrayBuffer> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return await this.encryptData(exported, withKey);
  }

  private async decryptKey(
    encrypted: ArrayBuffer,
    withKey: CryptoKey
  ): Promise<CryptoKey> {
    const decrypted = await this.decryptData(encrypted, withKey);
    return await crypto.subtle.importKey(
      'raw',
      decrypted,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private async encryptData(
    data: ArrayBuffer | string,
    key: CryptoKey
  ): Promise<ArrayBuffer> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const dataBuffer = typeof data === 'string'
      ? new TextEncoder().encode(data)
      : data;

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );

    // Prepend IV
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.length);

    return result.buffer;
  }

  private async decryptData(
    data: ArrayBuffer,
    key: CryptoKey
  ): Promise<ArrayBuffer> {
    const view = new Uint8Array(data);
    const iv = view.slice(0, 12);
    const ciphertext = view.slice(12);

    return await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
  }

  // Storage methods (implement with IndexedDB)
  private async loadEncryptedDataKey(): Promise<{
    encrypted: ArrayBuffer;
    descriptor: KeyDescriptor;
  } | null> {
    // TODO: Implement IndexedDB storage
    return null;
  }

  private async storeEncryptedDataKey(
    encrypted: ArrayBuffer,
    descriptor: KeyDescriptor
  ): Promise<void> {
    // TODO: Implement IndexedDB storage
  }

  private async loadArchivedKey(keyId: string): Promise<CryptoKey | null> {
    // TODO: Implement IndexedDB storage
    return null;
  }
}
```

**Encryption Service with Key Metadata:**

```typescript
// app/crypto/encryption-service.ts

export interface EncryptedPayload {
  version: number;
  keyId: string;       // Which key was used
  algorithm: string;
  iv: Uint8Array;
  ciphertext: Uint8Array;
  authTag?: Uint8Array;  // For AEAD schemes
}

export class EncryptionService {
  constructor(private keyManager: KeyManager) {}

  async encrypt(data: ArrayBuffer): Promise<ArrayBuffer> {
    const dataKey = await this.keyManager.getDataKey();
    const descriptor = this.keyManager.getDescriptor('data-current');

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      dataKey,
      data
    );

    // Package with metadata
    const payload: EncryptedPayload = {
      version: 1,
      keyId: descriptor.id,
      algorithm: 'AES-256-GCM',
      iv,
      ciphertext: new Uint8Array(encrypted),
    };

    return this.serializePayload(payload);
  }

  async decrypt(data: ArrayBuffer): Promise<ArrayBuffer> {
    const payload = this.deserializePayload(data);

    // Get the specific key that was used for encryption
    const key = await this.keyManager.getKeyById(payload.keyId);

    return await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: payload.iv },
      key,
      payload.ciphertext
    );
  }

  private serializePayload(payload: EncryptedPayload): ArrayBuffer {
    // Serialize to: version(1) + keyId(16) + ivLength(1) + iv(N) + ciphertext
    const keyIdBytes = new TextEncoder().encode(payload.keyId);
    const totalLength = 1 + 16 + 1 + payload.iv.length + payload.ciphertext.length;
    const result = new Uint8Array(totalLength);

    let offset = 0;
    result[offset++] = payload.version;
    result.set(keyIdBytes.slice(0, 16), offset);
    offset += 16;
    result[offset++] = payload.iv.length;
    result.set(payload.iv, offset);
    offset += payload.iv.length;
    result.set(payload.ciphertext, offset);

    return result.buffer;
  }

  private deserializePayload(data: ArrayBuffer): EncryptedPayload {
    const view = new Uint8Array(data);
    let offset = 0;

    const version = view[offset++];
    const keyIdBytes = view.slice(offset, offset + 16);
    const keyId = new TextDecoder().decode(keyIdBytes).replace(/\0/g, '');
    offset += 16;

    const ivLength = view[offset++];
    const iv = view.slice(offset, offset + ivLength);
    offset += ivLength;

    const ciphertext = view.slice(offset);

    return {
      version,
      keyId,
      algorithm: 'AES-256-GCM',
      iv,
      ciphertext,
    };
  }
}
```

**Benefits:**
- ✓ Key rotation without re-encrypting all data
- ✓ Support for old keys (backward compatibility)
- ✓ Master key encrypts data keys (layered security)
- ✓ Backup/recovery options
- ✓ Algorithm versioning (can upgrade crypto)
- ✓ Device-specific keys (future: multi-device support)

---

### 3. Updated Sync Flow

```typescript
// app/sync/sync-coordinator.ts

export class SyncCoordinator {
  constructor(
    private syncManager: SyncManager,
    private keyManager: KeyManager,
    private db: Db
  ) {}

  async sync(): Promise<SyncResult> {
    try {
      // Ensure keys are initialized
      if (!this.keyManager.hasDataKey()) {
        throw new Error('Encryption keys not initialized');
      }

      // Delegate to sync manager
      const result = await this.syncManager.sync();

      return result;
    } catch (error) {
      if (error instanceof DecryptionError) {
        // Key might be wrong or rotated
        await this.handleKeyError(error);
      }
      throw error;
    }
  }

  private async handleKeyError(error: DecryptionError): Promise<void> {
    // Try archived keys
    // Prompt for key rotation
    // Notify user
  }
}
```

**Hook Updates:**

```typescript
// app/store/sync.tsx (updated)

export function useSync() {
  const { isSignedIn } = useAuth();
  const cryptoKey = useCryptoKey();
  const keyManager = useKeyManager(); // New
  const syncProvider = useSyncProvider(); // New - from settings

  useEffect(() => {
    if (!isSignedIn || !cryptoKey) return;

    // Create sync coordinator
    const coordinator = new SyncCoordinator(
      new SyncManager(syncProvider, encryptionService, db),
      keyManager,
      db
    );

    const interval = setInterval(async () => {
      await coordinator.sync();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [isSignedIn, cryptoKey, syncProvider]);
}
```

---

### 4. Configuration & Settings UI

```typescript
// app/components/settings/sync-settings.tsx

export function SyncSettings() {
  const [config, setConfig] = useState<SyncConfig>({
    provider: 'r2',
    pollInterval: 10000,
  });

  return (
    <div>
      <h2>Sync Provider</h2>

      <select
        value={config.provider}
        onChange={e => setConfig({...config, provider: e.target.value})}
      >
        <option value="r2">Cloudflare R2 (Default)</option>
        <option value="webdav">WebDAV</option>
        <option value="s3">Amazon S3</option>
        <option value="local">Local File</option>
      </select>

      {config.provider === 'webdav' && (
        <div>
          <input
            type="url"
            placeholder="WebDAV URL"
            value={config.endpoint}
            onChange={e => setConfig({...config, endpoint: e.target.value})}
          />
          <input
            type="text"
            placeholder="Username"
            value={config.credentials?.username}
          />
          <input
            type="password"
            placeholder="Password"
            value={config.credentials?.password}
          />
        </div>
      )}

      <h2>Encryption</h2>

      <button onClick={() => handleRotateKeys()}>
        Rotate Encryption Keys
      </button>

      <button onClick={() => handleExportBackup()}>
        Export Key Backup
      </button>

      <button onClick={() => handleImportBackup()}>
        Import Key Backup
      </button>
    </div>
  );
}
```

---

## Migration Strategy

### Phase 1: Abstraction Layer (Non-Breaking)
1. Create `SyncProvider` interface
2. Implement `R2Provider` wrapping existing code
3. Create `SyncManager` using R2Provider
4. No user-facing changes, internal refactor only

### Phase 2: Enhanced Keys (Breaking - Requires Re-Setup)
1. Implement `KeyManager` with master/data key hierarchy
2. Add key rotation support
3. Update `EncryptionService` to use KeyManager
4. Migration tool: re-encrypt existing data with new key structure

### Phase 3: Additional Providers
1. Implement `WebDAVProvider`
2. Implement `LocalFileProvider`
3. Add UI for provider selection
4. Test each provider independently

### Phase 4: Advanced Features
1. Key recovery/backup
2. Device-specific keys
3. Sharing keys (future: collaboration)
4. Incremental sync (delta updates)

---

## Security Considerations

### Maintained Strengths
- ✓ Zero-knowledge architecture (server never sees plaintext)
- ✓ Non-extractable master keys (cannot export from browser)
- ✓ Client-side encryption only
- ✓ PBKDF2 with 100k iterations

### New Protections
- ✓ Key rotation without data re-encryption
- ✓ Backup/recovery mechanism
- ✓ Key versioning (algorithm upgrades)
- ✓ Separation: master key ≠ data key
- ✓ Key metadata in encrypted payloads

### Potential Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Master key loss | Backup export with different passphrase |
| Key rotation complexity | Keep old keys for decryption |
| Provider compromise | E2E encryption remains (server only sees ciphertext) |
| Passphrase weakness | Enforce minimum strength, consider Argon2 |
| Multiple devices | Device-specific keys (Phase 4) |

---

## Performance Considerations

### Current System
- Full database export/import on each sync
- ~10-100KB typical database size
- Acceptable for poll-based sync

### Optimizations (Future)
1. **Delta Sync**: Only sync changed notes (operation-based CRDT)
2. **Compression**: gzip encrypted payloads (20-50% reduction)
3. **Lazy Decryption**: Decrypt on-demand, not all at once
4. **Chunked Sync**: Split large databases into chunks
5. **Background Workers**: Offload crypto to Web Workers

**Implementation:**
```typescript
// app/sync/providers/base.ts (extended)
export interface SyncProvider {
  // ... existing methods

  // Optional: incremental sync support
  pullDelta?(since: Date): Promise<OperationLog[]>;
  pushDelta?(operations: OperationLog[]): Promise<void>;
}

export interface OperationLog {
  id: string;
  timestamp: string;
  operation: 'insert' | 'update' | 'delete';
  noteId: string;
  data?: ArrayBuffer;  // Encrypted note data
}
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('SyncProvider', () => {
  it('should pull and push data', async () => {
    const provider = new MockProvider();
    await provider.push(new ArrayBuffer(100));
    const pulled = await provider.pull();
    expect(pulled).toBeDefined();
  });
});

describe('KeyManager', () => {
  it('should derive master key from passphrase', async () => {
    const km = new KeyManager();
    await km.initialize('test-passphrase', 'user-123');
    const dataKey = await km.getDataKey();
    expect(dataKey).toBeInstanceOf(CryptoKey);
  });

  it('should rotate data keys', async () => {
    const km = new KeyManager();
    await km.initialize('test-passphrase', 'user-123');
    const key1 = await km.getDataKey();

    await km.rotateDataKey();
    const key2 = await km.getDataKey();

    expect(key1).not.toBe(key2);
  });

  it('should decrypt with old keys after rotation', async () => {
    // Encrypt with key v1, rotate, decrypt with v2 key manager
  });
});
```

### Integration Tests
```typescript
describe('SyncManager', () => {
  it('should sync between mock server and local DB', async () => {
    const provider = new MockProvider();
    const encryptionService = new EncryptionService(keyManager);
    const manager = new SyncManager(provider, encryptionService, db);

    // Add local note
    await db.insertInto('note').values({...}).execute();

    // Sync
    await manager.sync();

    // Verify remote has encrypted data
    const remote = await provider.pull();
    expect(remote).toBeDefined();
  });
});
```

### E2E Tests
- Complete sync cycle with real R2 (staging)
- WebDAV sync with test server
- Key rotation with existing data
- Backup export/import flow

---

## Open Questions

1. **Key Rotation Schedule**: Manual only, or automatic (e.g., every 90 days)?
2. **Compression**: Before or after encryption? (After is safer for compression oracle attacks)
3. **Conflict Resolution**: Continue with CRDT eventstamp, or add vector clocks?
4. **Multi-Device**: Should device keys be different from data keys?
5. **Collaboration**: If sharing notes, how to share keys securely?
6. **Key Derivation**: Upgrade to Argon2id (better than PBKDF2 but less browser support)?

---

## Recommended Implementation Order

1. **Week 1-2**: Sync Provider Abstraction
   - Create interfaces and R2Provider
   - Refactor existing sync to use new abstractions
   - No breaking changes

2. **Week 3-4**: Key Manager Foundation
   - Implement master/data key hierarchy
   - Add key rotation logic
   - Write comprehensive tests

3. **Week 5**: Migration Tool
   - Build tool to re-encrypt with new key structure
   - Test with real data
   - Document process

4. **Week 6-7**: Additional Providers
   - Implement WebDAV and LocalFile providers
   - Add provider configuration UI
   - Test each provider

5. **Week 8**: Polish & Documentation
   - Add backup export/import UI
   - Write user documentation
   - Performance profiling

---

## Comparison to Other Apps

| Feature | Current | Joplin | Standard Notes | Signal | Proposed |
|---------|---------|--------|----------------|--------|----------|
| E2E Encryption | ✓ | ✓ | ✓ | ✓ | ✓ |
| Multiple Sync Targets | ✗ | ✓ (8+) | ✓ (2+) | N/A | ✓ |
| Key Rotation | ✗ | ✓ | ✓ | ✓ | ✓ |
| Master Key System | ✗ | ✓ | ✓ | ✓ | ✓ |
| Key Backup | ✗ | Partial | ✓ | ✓ | ✓ |
| Self-Hostable | ✗ | ✓ | ✓ | ✓ | ✓ (WebDAV) |
| Algorithm Versioning | ✗ | ✓ | ✓ | ✓ | ✓ |
| Offline-First | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## References

### Academic & Standards
- [NIST SP 800-57: Key Management Guidelines](https://csrc.nist.gov/projects/key-management/key-management-guidelines)
- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
- [Cloud Security Alliance: Key Management Lifecycle](https://cloudsecurityalliance.org/artifacts/key-management-lifecycle-best-practices)

### Open Source Projects
- [Joplin E2EE Documentation](https://joplinapp.org/help/apps/sync/e2ee/)
- [Joplin Native Encryption Spec](https://joplinapp.org/help/dev/spec/e2ee/native_encryption/)
- [Standard Notes Security Overview](https://standardnotes.com/help/security)
- [Signal Protocol Documentation](https://signal.org/docs/)
- [Signal Protocol - Wikipedia](https://en.wikipedia.org/wiki/Signal_Protocol)

### Architecture Patterns (2026)
- [The Architecture Shift: Local-First in 2026](https://dev.to/the_nortern_dev/the-architecture-shift-why-im-betting-on-local-first-in-2026-1nh6)
- [CRDT Sync Strategies for Local-First](https://dev.to/charlietap/synking-all-the-things-with-crdts-local-first-development-3241)
- [Offline-First Architecture: Designing for Reality](https://medium.com/@jusuftopic/offline-first-architecture-designing-for-reality-not-just-the-cloud-e5fd18e50a79)
- [Building an Offline Realtime Sync Engine](https://gist.github.com/pesterhazy/3e039677f2e314cb77ffe3497ebca07b)
- [Vector Sync Patterns with Kafka and Flink](https://www.infoq.com/presentations/ai-vector-event-driven/)
- [TanStack DB + Electric for Local-First Sync](https://electric-sql.com/blog/2025/07/29/local-first-sync-with-tanstack-db)

### Best Practices
- [8 Encryption Key Management Best Practices](https://www.liquidweb.com/blog/encryption-key-management-best-practices/)
- [Thales: 10 Best Practices for Centralized Key Management](https://cpl.thalesgroup.com/blog/encryption/10-best-practices-for-centralized-encryption-key-management)
- [Microsoft Azure: Data Encryption Best Practices](https://learn.microsoft.com/en-us/azure/security/fundamentals/data-encryption-best-practices)

---

## Conclusion

This proposal re-architects the sync and key management systems to provide:

1. **Flexibility**: Multiple sync providers (R2, WebDAV, S3, local)
2. **Security**: Enhanced key management with rotation and backup
3. **Extensibility**: Clear interfaces for future features
4. **Maintainability**: Separation of concerns (sync ≠ crypto ≠ storage)
5. **User Control**: Self-hosting options, algorithm choice

The proposed architecture draws from proven patterns in Joplin, Standard Notes, and Signal, while maintaining the current system's zero-knowledge security guarantees and offline-first design philosophy.

**Next Steps:**
1. Review and discuss proposal with team
2. Address open questions
3. Create detailed task breakdown for Phase 1
4. Begin implementation with non-breaking abstraction layer

---

*Document version: 1.0*
*Last updated: 2026-01-11*
