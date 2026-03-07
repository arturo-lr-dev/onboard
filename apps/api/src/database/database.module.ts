import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

export const DATABASE = 'DATABASE';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('database.url');
        if (!databaseUrl) {
          throw new Error('DATABASE_URL is not configured');
        }
        const client = postgres(databaseUrl);
        return drizzle(client, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
