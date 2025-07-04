import { IStorage } from 'core/shared/application/storage.interface';

export class InMemoryStorage implements IStorage {
  private storage: Map<string, { data: Buffer; mime_type?: string }> =
    new Map();

  async store(object: {
    data: Buffer;
    mime_type?: string;
    id: string;
  }): Promise<void> {
    this.storage.set(object.id, {
      data: object.data,
      mime_type: object.mime_type,
    });
    return Promise.resolve();
  }
  async get(id: string): Promise<{ data: Buffer; mime_type?: string }> {
    const data = this.storage.get(id);

    if (!data) {
      throw new Error(`File ${id} not found`);
    }

    return Promise.resolve(data);
  }
}
