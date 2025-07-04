import { Category } from 'core/category/domain/category.aggregate';
import { ICategoryRepository } from 'core/category/domain/category.repository';
import request from 'supertest';
import { startApp } from 'nest-modules/shared/testing/helpers';
import { CATEGORY_PROVIDERS } from 'nest-modules/categories/categories.providers';

describe('CategoriesController (e2e)', () => {
  describe('/delete/:id (DELETE)', () => {
    const appHelper = startApp();

    describe('unauthenticated', () => {
      const app = startApp();

      test('should return 401 when not authenticated', () => {
        return request(app.app.getHttpServer())
          .delete('/categories/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a')
          .send({})
          .expect(401);
      });

      test('should return 403 when not authenticated as admin', () => {
        return request(app.app.getHttpServer())
          .delete('/categories/88ff2587-ce5a-4769-a8c6-1d63d29c5f7a')
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
        return request(appHelper.app.getHttpServer())
          .delete(`/categories/${id}`)
          .authenticate(appHelper.app, true)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should delete a category response with status 204', async () => {
      const categoryRepo = appHelper.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );
      const category = Category.fake().aCategory().build();
      await categoryRepo.insert(category);

      await request(appHelper.app.getHttpServer())
        .delete(`/categories/${category.category_id.id}`)
        .authenticate(appHelper.app, true)
        .expect(204);

      await expect(
        categoryRepo.findById(category.category_id),
      ).resolves.toBeNull();
    });
  });
});
