import { createHash } from 'node:crypto';

export class MediaFileValidator {
  constructor(
    private readonly max_size: number,
    private readonly valid_mime_types: string[],
  ) {}

  validate({
    raw_name,
    mime_type,
    size,
  }: {
    raw_name: string;
    mime_type: string;
    size: number;
  }) {
    if (!this.validateSize(size)) {
      throw new InvalidMediaFileSizeError(size, this.max_size);
    }

    if (!this.validateMimeType(mime_type)) {
      throw new InvalidMediaFileMimeTypeError(mime_type, this.valid_mime_types);
    }

    return {
      name: this.generateRandomName(raw_name),
    };
  }

  private validateSize(size: number): boolean {
    return size <= this.max_size;
  }

  private validateMimeType(mime_type: string): boolean {
    return this.valid_mime_types.includes(mime_type);
  }

  private generateRandomName(raw_name: string): string {
    const extension = raw_name.split('.').pop();

    return (
      createHash('sha256')
        .update(raw_name + Math.random() + Date.now())
        .digest('hex') +
      '.' +
      extension
    );
  }
}

export class InvalidMediaFileSizeError extends Error {
  constructor(actual_size: number, max_size: number) {
    super(
      `File size ${actual_size} exceeds the maximum allowed size of ${max_size} bytes`,
    );
    this.name = 'InvalidMediaFileSizeError';
  }
}

export class InvalidMediaFileMimeTypeError extends Error {
  constructor(actual_mime_type: string, valid_mime_types: string[]) {
    super(
      `File has an unsupported mime type: ${actual_mime_type}. Supported types are: ${valid_mime_types.join(
        ', ',
      )}`,
    );
    this.name = 'InvalidMediaFileMimeTypeError';
  }
}
