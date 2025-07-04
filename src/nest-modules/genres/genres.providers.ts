import { getModelToken } from '@nestjs/sequelize';
import { CreateGenreUseCase } from '../../core/genre/application/use-cases/create-genre/create-genre.use-case';
import { UpdateGenreUseCase } from '../../core/genre/application/use-cases/update-genre/update-genre.use-case';
import { ListGenresUseCase } from '../../core/genre/application/use-cases/list-genres/list-genres.use-case';
import { GetGenreUseCase } from '../../core/genre/application/use-cases/get-genre/get-genre.use-case';
import { DeleteGenreUseCase } from '../../core/genre/application/use-cases/delete-genre/delete-genre.use-case';
import { IGenreRepository } from '../../core/genre/domain/genre.repository';
import { IUnitOfWork } from '../../core/shared/domain/repository/unit-of-work.interface';
import { ICategoryRepository } from '../../core/category/domain/category.repository';
import { CategoriesIdExistsInDatabaseValidator } from '../../core/category/application/validations/categories-ids-exists-in-database.validator';
import { GenresIdExistsInDatabaseValidator } from '../../core/genre/application/validations/genres-ids-exists-in-database.validator';
import { GenreModel } from '../../core/genre/infra/repository/sequelize/genre-model';
import { GenreSequelizeRepository } from '../../core/genre/infra/repository/sequelize/genre-sequelize.repository';
import { UnitOfWorkSequelize } from '../../core/shared/infra/repository/sequelize/unit-of-work-sequelize';
import { CATEGORY_PROVIDERS } from 'nest-modules/categories/categories.providers';
import { GenreInMemoryRepository } from '../../core/genre/infra/repository/in-memory/genre-in-memory.repository';

export const REPOSITORIES = {
  GENRE_REPOSITORY: {
    provide: 'GenreRepository',
    useExisting: GenreSequelizeRepository,
  },
  GENRE_IN_MEMORY_REPOSITORY: {
    provide: GenreInMemoryRepository,
    useClass: GenreInMemoryRepository,
  },
  GENRE_SEQUELIZE_REPOSITORY: {
    provide: GenreSequelizeRepository,
    useFactory: (genreModel: typeof GenreModel, uow: UnitOfWorkSequelize) => {
      return new GenreSequelizeRepository(genreModel, uow);
    },
    inject: [getModelToken(GenreModel), 'UnitOfWork'],
  },
};

export const USE_CASES = {
  CREATE_GENRE_USE_CASE: {
    provide: CreateGenreUseCase,
    useFactory: (
      uow: IUnitOfWork,
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
      categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
    ) => {
      return new CreateGenreUseCase(
        uow,
        genreRepo,
        categoryRepo,
        categoriesIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
    ],
  },
  UPDATE_GENRE_USE_CASE: {
    provide: UpdateGenreUseCase,
    useFactory: (
      uow: IUnitOfWork,
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
      categoriesIdExistsInStorageValidator: CategoriesIdExistsInDatabaseValidator,
    ) => {
      return new UpdateGenreUseCase(
        uow,
        genreRepo,
        categoryRepo,
        categoriesIdExistsInStorageValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
    ],
  },
  LIST_GENRES_USE_CASE: {
    provide: ListGenresUseCase,
    useFactory: (
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
    ) => {
      return new ListGenresUseCase(genreRepo, categoryRepo);
    },
    inject: [
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    ],
  },
  GET_GENRE_USE_CASE: {
    provide: GetGenreUseCase,
    useFactory: (
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
    ) => {
      return new GetGenreUseCase(genreRepo, categoryRepo);
    },
    inject: [
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    ],
  },
  DELETE_GENRE_USE_CASE: {
    provide: DeleteGenreUseCase,
    useFactory: (uow: IUnitOfWork, genreRepo: IGenreRepository) => {
      return new DeleteGenreUseCase(uow, genreRepo);
    },
    inject: ['UnitOfWork', REPOSITORIES.GENRE_REPOSITORY.provide],
  },
};

export const VALIDATIONS = {
  GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR: {
    provide: GenresIdExistsInDatabaseValidator,
    useFactory: (genreRepo: IGenreRepository) => {
      return new GenresIdExistsInDatabaseValidator(genreRepo);
    },
    inject: [REPOSITORIES.GENRE_REPOSITORY.provide],
  },
};

export const GENRES_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
  VALIDATIONS,
};
