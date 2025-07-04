import { SequelizeOptions } from 'sequelize-typescript';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import { ImageMediaModel } from '../image-media.model';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '../video.model';
import { AudioVideoMediaModel } from '../audio-video-media.model';
import { CastMemberModel } from '../../../../../cast-member/infra/repository/sequelize/cast-member-sequelize';
import { CategoryModel } from '../../../../../category/infra/repository/sequelize/category.model';
import {
  GenreModel,
  GenreCategoryModel,
} from '../../../../../genre/infra/repository/sequelize/genre-model';

export function setupSequelizeForVideo(options: SequelizeOptions = {}) {
  return setupSequelize({
    models: [
      ImageMediaModel,
      VideoModel,
      AudioVideoMediaModel,
      VideoCategoryModel,
      CategoryModel,
      VideoGenreModel,
      GenreModel,
      GenreCategoryModel,
      VideoCastMemberModel,
      CastMemberModel,
    ],
    ...options,
  });
}
