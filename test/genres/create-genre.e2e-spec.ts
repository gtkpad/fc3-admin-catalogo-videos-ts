import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { IGenreRepository } from '../../src/core/genre/domain/genre.repository';
import { GenreId } from '../../src/core/genre/domain/genre.aggregate';
import { startApp } from '../../src/nest-modules/shared/testing/helpers';
import { CreateGenreFixture } from '../../src/nest-modules/genres/testing/genre-fixture';
import { GENRES_PROVIDERS } from '../../src/nest-modules/genres/genres.providers';
import { GenresController } from '../../src/nest-modules/genres/genres.controller';
import { ICategoryRepository } from '../../src/core/category/domain/category.repository';
import { CATEGORY_PROVIDERS } from '../../src/nest-modules/categories/categories.providers';
import { GenreOutputMapper } from '../../src/core/genre/application/use-cases/common/genre-output';

describe('GenresController (e2e)', () => {
  describe('/genres (POST)', () => {
    describe('should a response error with 422 when request body is invalid', () => {
      const app = startApp();
      const invalidRequest = CreateGenreFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));
      test.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .post('/genres')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const app = startApp();
      const validationErrors =
        CreateGenreFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationErrors).map((key) => ({
        label: key,
        value: validationErrors[key],
      }));
      test.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .post('/genres')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should create a genre', () => {
      const app = startApp();
      const arrange = CreateGenreFixture.arrangeForSave();
      let genreRepo: IGenreRepository;
      let categoryRepo: ICategoryRepository;
      beforeEach(async () => {
        genreRepo = await app.app.resolve<IGenreRepository>(
          GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );
        categoryRepo = await app.app.resolve<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });
      test.each(arrange)(
        'when body is $send_data',
        async ({ send_data, expected, relations }) => {
          await categoryRepo.bulkInsert(relations.categories);
          const res = await request(app.app.getHttpServer())
            .post('/genres')
            .send(send_data)
            .expect(201);
          const keyInResponse = CreateGenreFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);
          const id = res.body.data.id;
          const genreCreated = await genreRepo.findById(new GenreId(id));
          const presenter = GenresController.serialize(
            GenreOutputMapper.toOutput(genreCreated!, relations.categories),
          );
          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            created_at: serialized.created_at,
            ...expected,
          });
        },
      );
    });
  });
});
