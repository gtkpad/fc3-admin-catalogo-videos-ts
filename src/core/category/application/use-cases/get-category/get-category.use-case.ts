import { NotFoundError } from '../../../../../core/shared/domain/errors/not-found.error';
import {
  CategoryId,
  Category,
} from '../../../../../core/category/domain/category.aggregate';
import { ICategoryRepository } from '../../../../../core/category/domain/category.repository';
import { IUseCase } from '../../../../../core/shared/application/use-case.interface';
import {
  CategoryOutput,
  CategoryOutputMapper,
} from '../common/category-output';

export class GetCategoryUseCase
  implements IUseCase<GetCategoryInput, GetCategoryOutput>
{
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
    const categoryId = new CategoryId(input.id);
    const category = await this.categoryRepo.findById(categoryId);
    if (!category) {
      throw new NotFoundError(input.id, Category);
    }

    return CategoryOutputMapper.toOutput(category);
  }
}

export type GetCategoryInput = {
  id: string;
};

export type GetCategoryOutput = CategoryOutput;
