import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleCloudStorage } from '../../core/shared/infra/storage/google-cloud.storage';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';
import { InMemoryStorage } from 'core/shared/infra/storage/in-memory.storage';

@Global()
@Module({
  providers: [
    {
      provide: GoogleCloudStorage,
      useFactory: (configService: ConfigService) => {
        const credentials = configService.get('GOOGLE_CLOUD_CREDENTIALS');
        const bucket = configService.get('GOOGLE_CLOUD_STORAGE_BUCKET_NAME');
        const storage = new GoogleCloudStorageSdk({
          credentials,
        });
        return new GoogleCloudStorage(storage, bucket);
      },
      inject: [ConfigService],
    },
    {
      provide: InMemoryStorage,
      useClass: InMemoryStorage,
    },
    {
      provide: 'IStorage',
      useExisting: InMemoryStorage,
    },
  ],
  exports: ['IStorage'],
})
export class SharedModule {}
