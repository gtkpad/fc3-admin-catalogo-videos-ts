import { OnEvent } from '@nestjs/event-emitter';
import { IIntegrationEventHandler } from 'core/shared/application/domain-event-handler.interface';
import { VideoAudioMediaUploadedIntegrationEvent } from 'core/video/domain/domain-events/video-audio-media-replaced.event';
import { IMessageBroker } from '../../../shared/application/message-broker.interface';

export class PublishVideoMediaReplacedInQueueHandler
  implements IIntegrationEventHandler<VideoAudioMediaUploadedIntegrationEvent>
{
  constructor(private readonly messageBroker: IMessageBroker) {}
  @OnEvent(VideoAudioMediaUploadedIntegrationEvent.name)
  async handle(event: VideoAudioMediaUploadedIntegrationEvent): Promise<void> {
    await this.messageBroker.publishEvent(event);
  }
}
