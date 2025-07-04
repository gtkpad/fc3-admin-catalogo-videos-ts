import { Module } from '@nestjs/common';
import { GenresController } from './genres.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  GenreModel,
  GenreCategoryModel,
} from '../../core/genre/infra/repository/sequelize/genre-model';
import { CategoriesModule } from '../categories/categories.module';
import { GENRES_PROVIDERS } from './genres.providers';

@Module({
  imports: [
    SequelizeModule.forFeature([GenreModel, GenreCategoryModel]),
    CategoriesModule,
  ],
  controllers: [GenresController],
  providers: [
    ...Object.values(GENRES_PROVIDERS.REPOSITORIES),
    ...Object.values(GENRES_PROVIDERS.USE_CASES),
    ...Object.values(GENRES_PROVIDERS.VALIDATIONS),
  ],
  exports: [
    GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    GENRES_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR,
  ],
})
export class GenresModule {}
