import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { ICategoryRepository } from '../../src/core/category/domain/category.repository';
import { CategoryOutputMapper } from 'core/category/application/use-cases/common/category-output';
import { CategoriesController } from 'nest-modules/categories/categories.controller';
import { ListCategoriesFixture } from 'nest-modules/categories/testing/category.fixture';
import { startApp } from 'nest-modules/shared/testing/helpers';
import { CATEGORY_PROVIDERS } from 'nest-modules/categories/categories.providers';

describe('CategoriesController (e2e)', () => {
  describe('/categories (GET)', () => {
    describe('unauthenticated', () => {
      const app = startApp();

      test('should return 401 when not authenticated', () => {
        return request(app.app.getHttpServer()).get('/categories').expect(401);
      });

      test('should return 403 when not authenticated as admin', () => {
        return request(app.app.getHttpServer())
          .get('/categories')
          .authenticate(app.app, false)
          .expect(403);
      });
    });

    describe('should return categories sorted by created_at when request query is empty', () => {
      let categoryRepo: ICategoryRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } =
        ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        categoryRepo = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        await categoryRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query params is $send_data',
        async ({ send_data, expected }) => {
          const queryParams = new URLSearchParams(send_data as any).toString();
          return request(nestApp.app.getHttpServer())
            .get(`/categories/?${queryParams}`)
            .authenticate(nestApp.app, true)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CategoriesController.serialize(
                    CategoryOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });

    describe('should return categories using paginate, filter and sort', () => {
      let categoryRepo: ICategoryRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        categoryRepo = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
        await categoryRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each([arrange])(
        'when query params is $send_data',
        async ({ send_data, expected }) => {
          const queryParams = new URLSearchParams(send_data as any).toString();
          return request(nestApp.app.getHttpServer())
            .get(`/categories/?${queryParams}`)
            .authenticate(nestApp.app, true)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CategoriesController.serialize(
                    CategoryOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });
  });
});
