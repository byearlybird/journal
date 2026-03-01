import { BackupRepo } from "./backup-repo";

export class BackupService {
  #backupRepo: BackupRepo;
  constructor(backupRepo: BackupRepo) {
    this.#backupRepo = backupRepo;
  }

  async getData(
    userId: string,
  ): Promise<{ status: "success"; data: string } | { status: "not_found" }> {
    const row = await this.#backupRepo.getByUserId(userId);
    if (!row) return { status: "not_found" };
    return { status: "success", data: row.data };
  }

  async putData(userId: string, data: string): Promise<void> {
    await this.#backupRepo.upsert(userId, data);
  }
}
