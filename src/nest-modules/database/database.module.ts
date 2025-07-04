import { Global, Module, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, SequelizeModule } from '@nestjs/sequelize';
import { CONFIG_SCHEMA_TYPE } from '../config/config.module';
import { CategoryModel } from '../../core/category/infra/repository/sequelize/category.model';
import { UnitOfWorkSequelize } from '../../core/shared/infra/repository/sequelize/unit-of-work-sequelize';
import { Sequelize } from 'sequelize';
import { CastMemberModel } from '../../core/cast-member/infra/repository/sequelize/cast-member-sequelize';
import {
  GenreCategoryModel,
  GenreModel,
} from '../../core/genre/infra/repository/sequelize/genre-model';
import { AudioVideoMediaModel } from '../../core/video/infra/repository/sequelize/audio-video-media.model';
import { ImageMediaModel } from '../../core/video/infra/repository/sequelize/image-media.model';
import {
  VideoModel,
  VideoCategoryModel,
  VideoCastMemberModel,
  VideoGenreModel,
} from '../../core/video/infra/repository/sequelize/video.model';

const models = [
  CategoryModel,
  GenreModel,
  GenreCategoryModel,
  CastMemberModel,
  VideoModel,
  VideoCategoryModel,
  VideoCastMemberModel,
  VideoGenreModel,
  ImageMediaModel,
  AudioVideoMediaModel,
];

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => {
        const dbVendor = configService.get('DB_VENDOR');
        if (dbVendor === 'sqlite') {
          return {
            dialect: dbVendor,
            host: configService.get('DB_HOST'),
            logging: configService.get('DB_LOGGING'),
            autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
            models,
          };
        }

        if (dbVendor === 'mysql') {
          return {
            dialect: dbVendor,
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            logging: configService.get('DB_LOGGING'),
            autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
            models,
          };
        }

        throw new Error(`Unsupported database configuration ${dbVendor}`);
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: UnitOfWorkSequelize,
      useFactory: (sequelize: Sequelize) => {
        return new UnitOfWorkSequelize(sequelize);
      },
      inject: [getConnectionToken()],
      scope: Scope.REQUEST,
    },
    {
      provide: 'UnitOfWork',
      useExisting: UnitOfWorkSequelize,
      scope: Scope.REQUEST,
    },
  ],
  exports: ['UnitOfWork'],
})
export class DatabaseModule {}
