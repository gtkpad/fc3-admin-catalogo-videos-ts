import { Either } from 'core/shared/domain/either';
import { MediaFileValidator } from 'core/shared/domain/validators/media-file.validator';
import { ImageMedia } from 'core/shared/domain/value-objects/image-media.vo';
import { VideoId } from './video.aggregate';

export class Thumbnail extends ImageMedia {
  static max_size = 1024 * 1024 * 2; // 2MB;
  static mime_types = ['image/jpeg', 'image/png', 'image/gif'];

  static createFromFile({
    raw_name,
    mime_type,
    size,
    video_id,
  }: {
    raw_name: string;
    mime_type: string;
    video_id: VideoId;
    size: number;
  }) {
    const validator = new MediaFileValidator(
      Thumbnail.max_size,
      Thumbnail.mime_types,
    );

    return Either.safe(() => {
      const { name } = validator.validate({ raw_name, mime_type, size });

      return new Thumbnail({
        name,
        location: `videos/${video_id.id}/images`,
      });
    });
  }
}
