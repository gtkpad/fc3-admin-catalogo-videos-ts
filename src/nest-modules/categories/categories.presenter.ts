import { Transform } from 'class-transformer';
import { CategoryOutput } from 'core/category/application/use-cases/common/category-output';
import { ListCategoriesOutput } from 'core/category/application/use-cases/list-categories/list-categories.use-case';
import { CollectionPresenter } from 'nest-modules/shared/collection.presenter';

export class CategoryPresenter {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: CategoryOutput) {
    this.id = output.id;
    this.name = output.name;
    this.description = output.description;
    this.created_at = output.created_at;
    this.is_active = output.is_active;
  }
}

export class CategoryCollectionPresenter extends CollectionPresenter {
  data: CategoryPresenter[];

  constructor(output: ListCategoriesOutput) {
    const { items, ...pagination } = output;

    super(pagination);

    this.data = items.map((item) => new CategoryPresenter(item));
  }
}
