import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly supabaseUrl: string;
  private readonly serviceRoleKey: string;

  constructor(private readonly configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('supabase.url', '');
    this.serviceRoleKey = this.configService.get<string>('supabase.serviceRoleKey', '');
  }

  async upload(
    bucket: string,
    path: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<{ path: string }> {
    const url = `${this.supabaseUrl}/storage/v1/object/${bucket}/${path}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.serviceRoleKey}`,
        'Content-Type': contentType,
        'x-upsert': 'true',
      },
      body: new Uint8Array(buffer),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Storage upload failed: ${error}`);
    }

    return { path };
  }

  async delete(bucket: string, path: string): Promise<void> {
    const url = `${this.supabaseUrl}/storage/v1/object/${bucket}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefixes: [path] }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Storage delete failed: ${error}`);
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    return `${this.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  }
}
