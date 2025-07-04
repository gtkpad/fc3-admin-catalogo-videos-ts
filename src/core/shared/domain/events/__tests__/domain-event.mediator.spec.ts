import { AggregateRoot } from '../../aggregate-root';
import { Uuid } from '../../value-objects/uuid.vo';
import { DomainEventMediator } from '../domain-event.mediator';
import { EventEmitter2 } from 'eventemitter2';
import { IDomainEvent, IIntegrationEvent } from '../domain-event.interface';

class StubEvent implements IDomainEvent {
  occurred_on: Date;
  event_version: number;
  constructor(
    public aggregate_id: Uuid,
    public name: string,
  ) {
    this.event_version = 1;
    this.occurred_on = new Date();
  }

  getIntegrationEvent(): StubIntegrationEvent {
    return new StubIntegrationEvent(this);
  }
}

class StubIntegrationEvent implements IIntegrationEvent {
  occurred_on: Date;
  event_version: number;
  payload: any;
  event_name: string;
  constructor(e: StubEvent) {
    this.event_version = e.event_version;
    this.occurred_on = e.occurred_on;
    this.payload = e;
    this.event_name = this.constructor.name;
  }
}

class StubAggregate extends AggregateRoot {
  entity_id: Uuid;
  name: string;

  constructor(id: Uuid, name: string) {
    super();
    this.entity_id = id;
    this.name = name;
  }

  action(name: string) {
    this.name = name;
    this.applyEvent(new StubEvent(this.entity_id, this.name));
  }

  toJSON() {
    return {
      entity_id: this.entity_id.id,
      name: this.name,
    };
  }
}

describe('Domain Event Mediator Unit Tests', () => {
  let mediator: DomainEventMediator;

  beforeEach(() => {
    mediator = new DomainEventMediator(new EventEmitter2());
  });

  it('should publish event', async () => {
    expect.assertions(1);
    mediator.register(StubEvent.name, (event: StubEvent) => {
      expect(event.name).toBe('Test');
    });

    const aggregate = new StubAggregate(new Uuid(), 'Old Name');

    aggregate.action('Test');

    await mediator.publish(aggregate);
  });

  it('should not publish an integration event', () => {
    expect.assertions(1);
    const spyEmitAsync = jest.spyOn(mediator['eventEmitter'], 'emitAsync');

    const aggregate = new StubAggregate(new Uuid(), 'Old Name');
    aggregate.action('test');
    Array.from(aggregate.events)[0].getIntegrationEvent = undefined;
    mediator.publishIntegrationEvents(aggregate);
    expect(spyEmitAsync).not.toBeCalled();
  });

  it('should publish integration event', async () => {
    expect.assertions(3);
    mediator.register(
      StubIntegrationEvent.name,
      (event: StubIntegrationEvent) => {
        expect(event.event_name).toBe(StubIntegrationEvent.name);
        expect(event.event_version).toBe(1);
        expect(event.payload.name).toBe('Test');
      },
    );

    const aggregate = new StubAggregate(new Uuid(), 'Old Name');

    aggregate.action('Test');

    await mediator.publishIntegrationEvents(aggregate);
  });
});
