import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '../aggregate-root';

export class DomainEventMediator {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  register(event: string, handler: any) {
    this.eventEmitter.on(event, handler);
  }

  async publish(aggregateRoot: AggregateRoot) {
    for (const event of aggregateRoot.getUncommittedEvents()) {
      const eventName = event.constructor.name;
      aggregateRoot.markEventAsDispatched(event);
      await this.eventEmitter.emitAsync(eventName, event);
    }
  }

  async publishIntegrationEvents(aggregateRoot: AggregateRoot) {
    for (const event of aggregateRoot.events) {
      const integrationEvent = event.getIntegrationEvent?.();
      if (!integrationEvent) continue;

      await this.eventEmitter.emitAsync(
        integrationEvent.constructor.name,
        integrationEvent,
      );
    }
  }
}
