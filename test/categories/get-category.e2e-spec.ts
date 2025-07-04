import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { ICategoryRepository } from '../../src/core/category/domain/category.repository';
import { CategoryOutputMapper } from 'core/category/application/use-cases/common/category-output';
import { Category } from 'core/category/domain/category.aggregate';
import { CategoriesController } from 'nest-modules/categories/categories.controller';
import { GetCategoryFixture } from 'nest-modules/categories/testing/category.fixture';
import { startApp } from 'nest-modules/shared/testing/helpers';
import { CATEGORY_PROVIDERS } from 'nest-modules/categories/categories.providers';

describe('CategoriesController (e2e)', () => {
  const nestApp = startApp();
  describe('/categories/:id (GET)', () => {
    describe('unauthenticated', () => {
      const app = startApp();

      test('should return 401 when not authenticated', () => {
        return request(app.app.getHttpServer())
          .get('/categories/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a')
          .send({})
          .expect(401);
      });

      test('should return 403 when not authenticated as admin', () => {
        return request(app.app.getHttpServer())
          .get('/categories/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a')
          .authenticate(app.app, false)
          .send({})
          .expect(403);
      });
    });

    describe('should a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            message:
              'Category Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when id is $id', async ({ id, expected }) => {
        return request(nestApp.app.getHttpServer())
          .get(`/categories/${id}`)
          .authenticate(nestApp.app, true)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should return a category ', async () => {
      const categoryRepo = nestApp.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );
      const category = Category.fake().aCategory().build();
      await categoryRepo.insert(category);

      const res = await request(nestApp.app.getHttpServer())
        .get(`/categories/${category.category_id.id}`)
        .authenticate(nestApp.app, true)
        .expect(200);
      const keyInResponse = GetCategoryFixture.keysInResponse;
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

      const presenter = CategoriesController.serialize(
        CategoryOutputMapper.toOutput(category),
      );
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
    });
  });
});
