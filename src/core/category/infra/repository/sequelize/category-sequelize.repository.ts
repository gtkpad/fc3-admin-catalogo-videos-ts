import { SortDirection } from 'core/shared/domain/repository/search-params';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import { Uuid } from '../../../../shared/domain/value-objects/uuid.vo';
import { Category, CategoryId } from '../../../domain/category.aggregate';
import {
  CategorySearchParams,
  CategorySearchResult,
  ICategoryRepository,
} from '../../../domain/category.repository';
import { CategoryModelMapper } from './category-model-mapper';
import { CategoryModel } from './category.model';
import { literal, Op } from 'sequelize';
import { InvalidArgumentError } from 'core/shared/domain/errors/invalid-argument.error';

export class CategorySequelizeRepository implements ICategoryRepository {
  sortableFields: string[] = ['name', 'created_at'];

  orderBy = {
    mysql: {
      name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`),
    },
  };

  constructor(private categoryModel: typeof CategoryModel) {}

  async insert(entity: Category): Promise<void> {
    const model = CategoryModelMapper.toModel(entity);

    await this.categoryModel.create(model.toJSON());
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    const models = CategoryModelMapper.toModels(entities);

    await this.categoryModel.bulkCreate(models.map((model) => model.toJSON()));
  }

  async update(entity: Category): Promise<void> {
    const id = entity.category_id.id;
    const model = await this._get(id);

    if (!model) {
      throw new NotFoundError(id, this.getEntity());
    }

    const modelToUpdate = CategoryModelMapper.toModel(entity);

    await this.categoryModel.update(modelToUpdate.toJSON(), {
      where: { category_id: id },
    });
  }

  async delete(entity_id: Uuid): Promise<void> {
    const id = entity_id.id;
    const model = await this._get(id);

    if (!model) {
      throw new NotFoundError(id, this.getEntity());
    }

    await this.categoryModel.destroy({
      where: { category_id: id },
    });

    // const deleteCount = await this.categoryModel.destroy({
    //   where: { category_id: id },
    // });

    // if (deleteCount === 0) throw new NotFoundError(id, this.getEntity());
  }

  async findByIds(ids: CategoryId[]): Promise<Category[]> {
    const models = await this.categoryModel.findAll({
      where: {
        category_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    return models.map((m) => CategoryModelMapper.toEntity(m));
  }

  async existsById(
    ids: CategoryId[],
  ): Promise<{ exists: CategoryId[]; not_exists: CategoryId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existsCategoryModels = await this.categoryModel.findAll({
      attributes: ['category_id'],
      where: {
        category_id: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    const existsCategoryIds = existsCategoryModels.map(
      (m) => new CategoryId(m.category_id),
    );
    const notExistsCategoryIds = ids.filter(
      (id) => !existsCategoryIds.some((e) => e.equals(id)),
    );
    return {
      exists: existsCategoryIds,
      not_exists: notExistsCategoryIds,
    };
  }
  async findById(entity_id: Uuid): Promise<Category | null> {
    const model = await this._get(entity_id.id);

    return model ? CategoryModelMapper.toEntity(model) : null;
  }

  private async _get(id: string) {
    return await this.categoryModel.findByPk(id);
  }

  async findAll(): Promise<Category[]> {
    const models = await this.categoryModel.findAll();

    return CategoryModelMapper.toEntities(models);
  }

  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.categoryModel.sequelize!.getDialect() as 'mysql';
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }
    return [[sort, sort_dir]];
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }

  async search(props: CategorySearchParams): Promise<CategorySearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;

    const { rows: models, count } = await this.categoryModel.findAndCountAll({
      ...(props.filter && {
        where: {
          name: { [Op.like]: `%${props.filter}%` },
        },
      }),
      ...(props.sort && this.sortableFields.includes(props.sort)
        ? //? { order: [[props.sort, props.sort_dir]] }
          { order: this.formatSort(props.sort, props.sort_dir!) }
        : { order: [['created_at', 'desc']] }),
      offset,
      limit,
    });

    return new CategorySearchResult({
      items: CategoryModelMapper.toEntities(models),
      current_page: props.page,
      per_page: props.per_page,
      total: count,
    });
  }
}
