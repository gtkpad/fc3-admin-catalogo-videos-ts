import { DeleteGenreUseCase } from '../delete-genre.use-case';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { Genre, GenreId } from '../../../../domain/genre.aggregate';
import { Category } from '../../../../../category/domain/category.aggregate';
import { CategorySequelizeRepository } from 'core/category/infra/repository/sequelize/category-sequelize.repository';
import { CategoryModel } from 'core/category/infra/repository/sequelize/category.model';
import {
  GenreModel,
  GenreCategoryModel,
} from 'core/genre/infra/repository/sequelize/genre-model';
import { GenreSequelizeRepository } from 'core/genre/infra/repository/sequelize/genre-sequelize.repository';
import { UnitOfWorkSequelize } from 'core/shared/infra/sequelize/unit-of-work-sequelize';

describe('DeleteGenreUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: DeleteGenreUseCase;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    useCase = new DeleteGenreUseCase(uow, genreRepo);
  });

  it('should throws error when entity not found', async () => {
    const genreId = new GenreId();
    await expect(() => useCase.execute({ id: genreId.id })).rejects.toThrow(
      new NotFoundError(genreId.id, Genre),
    );
  });

  it('should delete a genre', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .build();
    await genreRepo.insert(genre);
    await useCase.execute({
      id: genre.genre_id.id,
    });
    await expect(genreRepo.findById(genre.genre_id)).resolves.toBeNull();
  });

  it('rollback transaction', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .build();
    await genreRepo.insert(genre);

    GenreModel.afterBulkDestroy('hook-test', () => {
      return Promise.reject(new Error('Generic Error'));
    });

    await expect(
      useCase.execute({
        id: genre.genre_id.id,
      }),
    ).rejects.toThrow('Generic Error');

    GenreModel.removeHook('afterBulkDestroy', 'hook-test');

    const genres = await genreRepo.findAll();
    expect(genres.length).toEqual(1);
  });
});
