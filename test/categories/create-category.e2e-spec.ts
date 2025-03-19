import request from 'supertest';
import { CreateCategoryFixture } from 'nest-modules/categories/testing/category.fixture';
import { ICategoryRepository } from 'core/category/domain/category.repository';
import { CATEGORY_PROVIDERS } from 'nest-modules/categories/categories.providers';
import { startApp } from 'nest-modules/shared/testing/helpers';
import { Uuid } from 'core/shared/domain/value-objects/uuid.vo';
import { CategoriesController } from 'nest-modules/categories/categories.controller';
import { CategoryOutputMapper } from 'core/category/application/use-cases/common/category-output';
import { instanceToPlain } from 'class-transformer';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();
  let categoryRepository: ICategoryRepository;

  beforeEach(() => {
    categoryRepository = appHelper.app.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  describe('/categories (POST)', () => {
    describe('Should create a new category', () => {
      const arrange = CreateCategoryFixture.arrangeForCreate();

      test.each(arrange)(
        'when body is $send_data',
        async ({ send_data, expected }) => {
          const response = await request(appHelper.app.getHttpServer())
            .post('/categories')
            .send(send_data)
            .expect(201);

          const keysInResponse = CreateCategoryFixture.keysInResponse;

          expect(Object.keys(response.body)).toStrictEqual(['data']);
          expect(Object.keys(response.body.data)).toStrictEqual(keysInResponse);

          const id = response.body.data.id;
          const categoryCreated = await categoryRepository.findById(
            new Uuid(id),
          );

          const presenter = CategoriesController.serialize(
            CategoryOutputMapper.toOutput(categoryCreated!),
          );

          const serilized = instanceToPlain(presenter);

          expect(categoryCreated).not.toBeNull();
          expect(response.body.data).toStrictEqual({
            id: serilized.id,
            created_at: serilized.created_at,
            ...expected,
          });
        },
      );
    });

    describe('Should return 422 when request body is invalid', () => {
      const invalidRequest = CreateCategoryFixture.arrangeInvalidRequest();

      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', async ({ value }) => {
        await request(appHelper.app.getHttpServer())
          .post('/categories')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('Should return 422 when throw EntityValidationError', () => {
      const invalidRequest =
        CreateCategoryFixture.arrangeForEntityValidationError();

      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', async ({ value }) => {
        await request(appHelper.app.getHttpServer())
          .post('/categories')
          .send(value.send_data)
          .expect(422)
          .expect(value.expected);
      });
    });
  });
});
