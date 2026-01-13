# Sync & Key Management Architecture Proposal

**Date:** 2026-01-11
**Status:** Simplified Proposal

---

## Executive Summary

This document proposes a simplified re-architecture of the journal application's key management system based on research of industry best practices (Signal, Joplin, Standard Notes). The focus is on:

1. **Enhanced Key Management**: Master/data key hierarchy with rotation and backup
2. **Cleaner Separation**: Sync logic separated from crypto logic
3. **Better Security**: Key versioning and recovery options
4. **Simple HTTP Sync**: Keep current HTTP approach, just refactored

**What's NOT changing:** Still using HTTP sync to your current backend, still zero-knowledge E2E encryption, still offline-first.

---

## Current Architecture

### Strengths ✓

1. **Zero-Knowledge E2E Encryption**: Server never sees plaintext
2. **Non-Extractable Keys**: Browser prevents key export
3. **CRDT Conflict Resolution**: Eventstamp system works well
4. **Offline-First**: SQLite in browser
5. **Simple**: Direct HTTP PUT/GET

### Limitations ⚠

1. **Single Key**: Passphrase directly encrypts data (no rotation, no backup)
2. **Mixed Concerns**: Sync logic mixed with crypto logic
3. **No Key Versioning**: Can't upgrade encryption algorithms
4. **No Recovery**: Lost passphrase = lost data forever

---

## Research Findings

### Key Management Patterns

From industry leaders (Signal, Joplin, Standard Notes):

**Master/Data Key Hierarchy:**
- **Master Key**: Derived from passphrase, encrypts other keys
- **Data Keys**: Random generated, encrypt actual data
- **Benefit**: Can rotate data keys without re-encrypting everything

**Key Rotation:**
- Keep old keys for decryption
- New data encrypted with new key
- Gradual migration without breaking changes

**Backup/Recovery:**
- Export encrypted key backup with different passphrase
- Recovery mechanism for lost primary passphrase

**Key Versioning:**
- Include key ID in encrypted data
- Can upgrade algorithms (AES-128 → AES-256, PBKDF2 → Argon2)
- Backward compatibility maintained

### Sources

Key research from:
- [Joplin E2EE Documentation](https://joplinapp.org/help/apps/sync/e2ee/) - Master key system with PBKDF2
- [Signal Protocol](https://signal.org/docs/) - Multi-layered keys with rotation
- [Standard Notes Security](https://standardnotes.com/help/security) - Zero-knowledge client-side encryption
- [NIST Key Management](https://csrc.nist.gov/projects/key-management/key-management-guidelines) - Best practices
- [OWASP Key Management](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html) - Security guidelines

---

## Proposed Architecture

### 1. Enhanced Key Management

**Two-Tier Key System:**

```typescript
// app/crypto/key-manager.ts

export class KeyManager {
  private masterKey: CryptoKey | null = null;
  private dataKey: CryptoKey | null = null;
  private dataKeyId: string | null = null;
  private archivedKeys = new Map<string, CryptoKey>();

  /**
   * Initialize from passphrase
   * 1. Derive master key from passphrase (encrypts other keys)
   * 2. Load/generate data key (encrypts journal data)
   */
  async initialize(passphrase: string, userId: string): Promise<void> {
    // Derive master key from passphrase
    this.masterKey = await this.deriveMasterKey(passphrase, userId);

    // Load existing data key (if exists) or create new one
    const stored = await this.loadDataKey();
    if (stored) {
      // Decrypt stored data key with master key
      this.dataKey = await this.decryptKey(stored.encrypted, this.masterKey);
      this.dataKeyId = stored.id;
    } else {
      // Generate new random data key
      await this.generateNewDataKey();
    }
  }

  /**
   * Derive master key from passphrase
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
      ['deriveKey']
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
      false,  // Non-extractable for security
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate new random data key
   */
  private async generateNewDataKey(): Promise<void> {
    // Random data key (extractable for key rotation)
    this.dataKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,  // Extractable
      ['encrypt', 'decrypt']
    );

    this.dataKeyId = crypto.randomUUID();

    // Encrypt data key with master key and store
    const encrypted = await this.encryptKey(this.dataKey, this.masterKey!);
    await this.storeDataKey(this.dataKeyId, encrypted);
  }

  /**
   * Get current data key for encryption
   */
  getDataKey(): CryptoKey {
    if (!this.dataKey) throw new Error('Key manager not initialized');
    return this.dataKey;
  }

  /**
   * Get current key ID (included in encrypted data)
   */
  getDataKeyId(): string {
    if (!this.dataKeyId) throw new Error('Key manager not initialized');
    return this.dataKeyId;
  }

  /**
   * Get key by ID for decryption (supports old keys)
   */
  async getKeyById(keyId: string): Promise<CryptoKey> {
    // Current key?
    if (keyId === this.dataKeyId) {
      return this.dataKey!;
    }

    // Archived key?
    if (this.archivedKeys.has(keyId)) {
      return this.archivedKeys.get(keyId)!;
    }

    // Load from storage
    const stored = await this.loadArchivedKey(keyId);
    if (!stored) throw new Error(`Key not found: ${keyId}`);

    const key = await this.decryptKey(stored, this.masterKey!);
    this.archivedKeys.set(keyId, key);
    return key;
  }

  /**
   * Rotate data key
   * Old key archived for decryption, new key for encryption
   */
  async rotateDataKey(): Promise<void> {
    if (!this.masterKey) throw new Error('Not initialized');

    // Archive current key
    if (this.dataKey && this.dataKeyId) {
      const encrypted = await this.encryptKey(this.dataKey, this.masterKey);
      await this.archiveKey(this.dataKeyId, encrypted);
      this.archivedKeys.set(this.dataKeyId, this.dataKey);
    }

    // Generate new data key
    await this.generateNewDataKey();
  }

  /**
   * Export backup (encrypted with different passphrase)
   */
  async exportBackup(backupPassphrase: string): Promise<string> {
    if (!this.masterKey) throw new Error('Not initialized');

    // Derive backup key from backup passphrase
    const backupKey = await this.deriveMasterKey(
      backupPassphrase,
      'backup-salt'
    );

    // Get all data keys
    const dataKeys = await this.loadAllDataKeys();

    // Package and encrypt with backup key
    const backup = {
      version: 1,
      createdAt: new Date().toISOString(),
      keys: dataKeys,
    };

    const encrypted = await this.encryptData(
      JSON.stringify(backup),
      backupKey
    );

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  /**
   * Import backup
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

    // Store all keys from backup
    for (const keyData of backup.keys) {
      await this.storeDataKey(keyData.id, keyData.encrypted);
    }
  }

  // Helper methods for encryption/decryption
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

  // Storage methods (IndexedDB)
  private async loadDataKey(): Promise<{ id: string; encrypted: ArrayBuffer } | null> {
    const { get } = await import('idb-keyval');
    return await get('journal:data-key:current');
  }

  private async storeDataKey(id: string, encrypted: ArrayBuffer): Promise<void> {
    const { set } = await import('idb-keyval');
    await set('journal:data-key:current', { id, encrypted });
  }

  private async archiveKey(id: string, encrypted: ArrayBuffer): Promise<void> {
    const { set } = await import('idb-keyval');
    await set(`journal:data-key:${id}`, encrypted);
  }

  private async loadArchivedKey(id: string): Promise<ArrayBuffer | null> {
    const { get } = await import('idb-keyval');
    return await get(`journal:data-key:${id}`);
  }

  private async loadAllDataKeys(): Promise<Array<{ id: string; encrypted: ArrayBuffer }>> {
    const { entries } = await import('idb-keyval');
    const all = await entries();
    return all
      .filter(([key]) => key.startsWith('journal:data-key:'))
      .map(([key, value]) => ({
        id: key.replace('journal:data-key:', ''),
        encrypted: value as ArrayBuffer,
      }));
  }
}
```

**Benefits:**
- ✓ Key rotation without re-encrypting all data
- ✓ Backward compatibility (old keys work for decryption)
- ✓ Backup/recovery with different passphrase
- ✓ Algorithm versioning (can upgrade in future)
- ✓ Still zero-knowledge (server never sees keys)

---

### 2. Encryption Service with Key Metadata

Update encryption to include which key was used:

```typescript
// app/crypto/encryption-service.ts

export class EncryptionService {
  constructor(private keyManager: KeyManager) {}

  /**
   * Encrypt data with current key
   * Format: [version:1][keyId:16][iv:12][ciphertext]
   */
  async encrypt(data: ArrayBuffer): Promise<ArrayBuffer> {
    const dataKey = this.keyManager.getDataKey();
    const keyId = this.keyManager.getDataKeyId();

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      dataKey,
      data
    );

    // Package: version + keyId + iv + ciphertext
    const keyIdBytes = new TextEncoder().encode(keyId.padEnd(16).slice(0, 16));
    const result = new Uint8Array(1 + 16 + 12 + encrypted.byteLength);
    let offset = 0;

    result[offset++] = 1; // Version
    result.set(keyIdBytes, offset);
    offset += 16;
    result.set(iv, offset);
    offset += 12;
    result.set(new Uint8Array(encrypted), offset);

    return result.buffer;
  }

  /**
   * Decrypt data with appropriate key
   */
  async decrypt(data: ArrayBuffer): Promise<ArrayBuffer> {
    const view = new Uint8Array(data);
    let offset = 0;

    const version = view[offset++];
    if (version !== 1) {
      throw new Error(`Unsupported version: ${version}`);
    }

    const keyIdBytes = view.slice(offset, offset + 16);
    const keyId = new TextDecoder().decode(keyIdBytes).trim();
    offset += 16;

    const iv = view.slice(offset, offset + 12);
    offset += 12;

    const ciphertext = view.slice(offset);

    // Get key by ID (current or archived)
    const key = await this.keyManager.getKeyById(keyId);

    return await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
  }
}
```

---

### 3. Simple HTTP Sync Service

Keep your current HTTP approach, just refactored for clarity:

```typescript
// app/sync/sync-service.ts

export class SyncService {
  constructor(
    private encryptionService: EncryptionService,
    private db: Db
  ) {}

  /**
   * Pull from remote, merge into local
   */
  async pull(): Promise<void> {
    const response = await fetch('/api/journal');
    if (response.status === 404) return; // No remote data yet

    const encrypted = await response.arrayBuffer();
    const decrypted = await this.encryptionService.decrypt(encrypted);

    // Merge into local DB (your existing logic)
    await this.mergeRemoteData(decrypted);
  }

  /**
   * Push local to remote
   */
  async push(): Promise<void> {
    // Export local DB (your existing logic)
    const localData = await this.exportLocalData();

    // Encrypt
    const encrypted = await this.encryptionService.encrypt(localData);

    // Upload
    await fetch('/api/journal', {
      method: 'PUT',
      body: encrypted,
    });
  }

  /**
   * Full sync: pull then push
   */
  async sync(): Promise<void> {
    await this.pull();
    await this.push();
  }

  // Your existing merge/export logic
  private async mergeRemoteData(data: ArrayBuffer): Promise<void> {
    // ... existing logic from app/store/sync.tsx
  }

  private async exportLocalData(): Promise<ArrayBuffer> {
    // ... existing logic from app/store/sync.tsx
  }
}
```

**Hook stays simple:**

```typescript
// app/store/sync.tsx (updated)

export function useSync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const keyManager = useKeyManager();

  useEffect(() => {
    if (!isSignedIn || !keyManager) return;

    const encryptionService = new EncryptionService(keyManager);
    const syncService = new SyncService(encryptionService, db);

    const interval = setInterval(async () => {
      try {
        await syncService.sync();
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [isSignedIn, keyManager]);
}
```

---

### 4. Settings UI

Add key management UI:

```typescript
// app/components/settings/key-settings.tsx

export function KeySettings() {
  const keyManager = useKeyManager();
  const [isRotating, setIsRotating] = useState(false);

  const handleRotateKey = async () => {
    setIsRotating(true);
    try {
      await keyManager.rotateDataKey();
      alert('Key rotated successfully');
    } catch (error) {
      alert('Key rotation failed');
    } finally {
      setIsRotating(false);
    }
  };

  const handleExportBackup = async () => {
    const backupPassphrase = prompt('Enter backup passphrase:');
    if (!backupPassphrase) return;

    try {
      const backup = await keyManager.exportBackup(backupPassphrase);

      // Download as file
      const blob = new Blob([backup], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journal-backup-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Backup export failed');
    }
  };

  const handleImportBackup = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt';

    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const backupPassphrase = prompt('Enter backup passphrase:');
      if (!backupPassphrase) return;

      const backupString = await file.text();

      try {
        await keyManager.importBackup(backupString, backupPassphrase);
        alert('Backup imported successfully');
      } catch (error) {
        alert('Backup import failed');
      }
    };

    fileInput.click();
  };

  return (
    <div>
      <h2>Encryption Keys</h2>

      <button onClick={handleRotateKey} disabled={isRotating}>
        {isRotating ? 'Rotating...' : 'Rotate Encryption Key'}
      </button>

      <p>
        Rotating your key creates a new encryption key for future data.
        Old keys are kept to decrypt existing data.
      </p>

      <h2>Backup & Recovery</h2>

      <button onClick={handleExportBackup}>
        Export Key Backup
      </button>

      <button onClick={handleImportBackup}>
        Import Key Backup
      </button>

      <p>
        Export an encrypted backup of your keys.
        Use a different passphrase than your main one.
        Keep this backup safe - it can recover your data if you forget your passphrase.
      </p>
    </div>
  );
}
```

---

## Migration Strategy

### Phase 1: Key Manager (Breaking Change)

**One-time migration required:**

1. User enters current passphrase
2. Decrypt existing data with old method
3. Initialize new KeyManager
4. Re-encrypt data with new key system
5. Store encrypted data key

**Migration tool:**

```typescript
// app/migration/migrate-to-key-manager.ts

export async function migrateToKeyManager(
  passphrase: string,
  userId: string
): Promise<void> {
  // 1. Derive old key (direct from passphrase)
  const oldKey = await deriveKey(passphrase, userId); // Existing function

  // 2. Pull and decrypt with old key
  const response = await fetch('/api/journal');
  const encrypted = await response.arrayBuffer();
  const decrypted = await decrypt(encrypted, oldKey); // Old method

  // 3. Initialize new KeyManager
  const keyManager = new KeyManager();
  await keyManager.initialize(passphrase, userId);

  // 4. Encrypt with new system
  const encryptionService = new EncryptionService(keyManager);
  const reencrypted = await encryptionService.encrypt(decrypted);

  // 5. Push to remote
  await fetch('/api/journal', {
    method: 'PUT',
    body: reencrypted,
  });

  console.log('Migration complete');
}
```

### Phase 2: Optional Features

Add over time:
- Key rotation UI
- Backup/recovery flow
- Algorithm versioning
- Passphrase strength meter

---

## Security Considerations

### What's Maintained

- ✓ Zero-knowledge (server never sees plaintext or keys)
- ✓ Non-extractable master keys
- ✓ Client-side encryption only
- ✓ PBKDF2 with 100k iterations

### What's Improved

- ✓ Key rotation without re-encrypting all data
- ✓ Backup/recovery mechanism
- ✓ Algorithm versioning (future-proof)
- ✓ Separation: master key ≠ data key

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Master key loss | Backup export with different passphrase |
| Migration failure | Keep old code path until verified |
| Key rotation complexity | Archive old keys, never delete |
| Weak backup passphrase | Enforce minimum strength |

---

## Implementation Checklist

### Week 1: Core Key Manager
- [ ] Implement `KeyManager` class
- [ ] Master key derivation
- [ ] Data key generation/loading
- [ ] IndexedDB storage
- [ ] Unit tests

### Week 2: Encryption Service
- [ ] Update `EncryptionService` to use `KeyManager`
- [ ] Add key ID to encrypted data format
- [ ] Support decryption with archived keys
- [ ] Integration tests

### Week 3: Sync Service Refactor
- [ ] Extract sync logic from hook to `SyncService`
- [ ] Clean separation of concerns
- [ ] Error handling
- [ ] Integration tests

### Week 4: Migration Tool
- [ ] Build migration tool
- [ ] Test with real data
- [ ] Create migration UI
- [ ] Document process

### Week 5: Settings UI
- [ ] Key rotation UI
- [ ] Backup export/import UI
- [ ] Passphrase strength indicator
- [ ] User documentation

### Week 6: Testing & Polish
- [ ] E2E tests
- [ ] Performance profiling
- [ ] Security audit
- [ ] Documentation

---

## Testing Strategy

### Unit Tests

```typescript
describe('KeyManager', () => {
  it('should initialize with passphrase', async () => {
    const km = new KeyManager();
    await km.initialize('test-pass', 'user-123');
    expect(km.getDataKey()).toBeInstanceOf(CryptoKey);
  });

  it('should rotate keys', async () => {
    const km = new KeyManager();
    await km.initialize('test-pass', 'user-123');
    const key1Id = km.getDataKeyId();

    await km.rotateDataKey();
    const key2Id = km.getDataKeyId();

    expect(key1Id).not.toBe(key2Id);

    // Old key still accessible
    const oldKey = await km.getKeyById(key1Id);
    expect(oldKey).toBeInstanceOf(CryptoKey);
  });

  it('should export and import backup', async () => {
    const km1 = new KeyManager();
    await km1.initialize('main-pass', 'user-123');

    const backup = await km1.exportBackup('backup-pass');

    const km2 = new KeyManager();
    await km2.initialize('main-pass', 'user-123');
    await km2.importBackup(backup, 'backup-pass');

    expect(km2.getDataKeyId()).toBe(km1.getDataKeyId());
  });
});
```

### Integration Tests

```typescript
describe('Encryption with KeyManager', () => {
  it('should encrypt and decrypt', async () => {
    const km = new KeyManager();
    await km.initialize('test-pass', 'user-123');

    const es = new EncryptionService(km);
    const original = new TextEncoder().encode('test data');

    const encrypted = await es.encrypt(original.buffer);
    const decrypted = await es.decrypt(encrypted);

    expect(new Uint8Array(decrypted)).toEqual(original);
  });

  it('should decrypt after key rotation', async () => {
    const km = new KeyManager();
    await km.initialize('test-pass', 'user-123');
    const es = new EncryptionService(km);

    // Encrypt with key v1
    const original = new TextEncoder().encode('test data');
    const encrypted = await es.encrypt(original.buffer);

    // Rotate key
    await km.rotateDataKey();

    // Should still decrypt with old key
    const decrypted = await es.decrypt(encrypted);
    expect(new Uint8Array(decrypted)).toEqual(original);
  });
});
```

---

## Comparison to Current

| Feature | Current | Proposed |
|---------|---------|----------|
| E2E Encryption | ✓ | ✓ |
| Zero-Knowledge | ✓ | ✓ |
| Offline-First | ✓ | ✓ |
| HTTP Sync | ✓ | ✓ |
| Key Rotation | ✗ | ✓ |
| Key Backup | ✗ | ✓ |
| Algorithm Versioning | ✗ | ✓ |
| Master/Data Keys | ✗ | ✓ |
| Migration Path | N/A | One-time |

---

## FAQ

**Q: Why master/data key separation?**
A: So you can rotate data keys without re-encrypting all your data. Master key stays the same (from passphrase), data keys can change.

**Q: What happens if I forget my passphrase?**
A: If you exported a key backup with a different passphrase, you can recover. Otherwise, data is lost (zero-knowledge means we can't reset it).

**Q: Do I need to migrate my existing data?**
A: Yes, one-time migration required. We'll provide a tool that makes it seamless.

**Q: Will this break my current setup?**
A: Yes, but only once. After migration, everything works the same, just with better key management.

**Q: Can I still use my current passphrase?**
A: Yes, migration uses your existing passphrase.

**Q: What about future algorithm upgrades?**
A: Key versioning means we can add Argon2, ChaCha20, etc. later without breaking old data.

---

## References

- [Joplin E2EE Documentation](https://joplinapp.org/help/apps/sync/e2ee/)
- [Signal Protocol](https://signal.org/docs/)
- [Standard Notes Security](https://standardnotes.com/help/security)
- [NIST Key Management Guidelines](https://csrc.nist.gov/projects/key-management/key-management-guidelines)
- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)

---

## Next Steps

1. **Review this proposal** - Does this approach make sense?
2. **Plan migration** - Schedule one-time data migration
3. **Start Week 1** - Implement core KeyManager
4. **Iterate** - Add features incrementally

---

*Document version: 2.0 (Simplified)*
*Last updated: 2026-01-11*
