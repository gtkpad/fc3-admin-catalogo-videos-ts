import { OmitType } from '@nestjs/mapped-types';
import { UpdateCategoryInput } from 'core/category/application/update-category/update-category.input';

class UpdateCategoryInputWithoutId extends OmitType(UpdateCategoryInput, [
  'id',
]) {}

export class UpdateCategoryDto extends UpdateCategoryInputWithoutId {}
