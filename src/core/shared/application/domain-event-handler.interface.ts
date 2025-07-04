import {
  IDomainEvent,
  IIntegrationEvent,
} from '../domain/events/domain-event.interface';

export interface IDomainEventHandler<T extends IDomainEvent> {
  handle(event: T): Promise<void>;
}

export interface IIntegrationEventHandler<T extends IIntegrationEvent> {
  handle(event: T): Promise<void>;
}
