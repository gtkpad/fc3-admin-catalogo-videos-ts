import { CategoryId } from 'core/category/domain/category.aggregate';
import { AggregateRoot } from 'core/shared/domain/aggregate-root';
import { Uuid } from 'core/shared/domain/value-objects/uuid.vo';
import GenreValidatorFactory from './genre.validator';
import { GenreFakeBuilder } from './genre-fake.builder';

export class GenreId extends Uuid {}

export type GenreContructorProps = {
  genre_id?: GenreId;
  name: string;
  categories_id: Map<string, CategoryId>;
  is_active?: boolean;
  created_at?: Date;
};

export type GenreCreateCommand = {
  name: string;
  categories_id: CategoryId[];
  is_active?: boolean;
};

export class Genre extends AggregateRoot {
  genre_id: GenreId;
  name: string;
  categories_id: Map<string, CategoryId>;
  is_active: boolean;
  created_at: Date;

  constructor(props: GenreContructorProps) {
    super();
    this.genre_id = props.genre_id ?? new GenreId();
    this.name = props.name;
    this.categories_id = props.categories_id ?? new Map();
    this.is_active = props.is_active ?? true;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: GenreCreateCommand): Genre {
    const genre = new Genre({
      ...props,
      categories_id: new Map(
        props.categories_id.map((categoryId) => [categoryId.id, categoryId]),
      ),
    });
    genre.validate();
    return genre;
  }

  public changeName(name: string): void {
    this.name = name;
    this.validate(['name']);
  }

  public addCategoryId(categoryId: CategoryId): void {
    this.categories_id.set(categoryId.id, categoryId);
  }

  public removeCategoryId(categoryId: CategoryId): void {
    this.categories_id.delete(categoryId.id);
  }

  public syncCategoriesIds(categoriesIds: CategoryId[]): void {
    if (!categoriesIds.length) {
      throw new Error('At least one category id is required');
    }

    this.categories_id = new Map(
      categoriesIds.map((categoryId) => [categoryId.id, categoryId]),
    );
  }

  public activate(): void {
    this.is_active = true;
  }

  public deactivate(): void {
    this.is_active = false;
  }

  get entity_id(): GenreId {
    return this.genre_id;
  }

  public validate(fields?: string[]) {
    const validator = GenreValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return GenreFakeBuilder;
  }

  toJSON() {
    return {
      genre_id: this.genre_id.id,
      name: this.name,
      categories_id: Array.from(this.categories_id.values()).map((c) => c.id),
      is_active: this.is_active,
      created_at: this.created_at,
    };
  }
}
