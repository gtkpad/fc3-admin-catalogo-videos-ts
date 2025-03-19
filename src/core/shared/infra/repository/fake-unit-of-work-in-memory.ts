import { AggregateRoot } from 'core/shared/domain/aggregate-root';
import { IUnitOfWork } from 'core/shared/domain/repository/unit-of-work.interface';

export class UnitOfWorkFakeInMemory implements IUnitOfWork {
  private aggregateRoots: Set<AggregateRoot> = new Set<AggregateRoot>();

  constructor() {}

  async start(): Promise<void> {
    return Promise.resolve();
  }

  async commit(): Promise<void> {
    return Promise.resolve();
  }

  async rollback(): Promise<void> {
    return Promise.resolve();
  }

  do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    return workFn(this);
  }

  getTransaction() {
    return;
  }

  addAggregateRoot(aggregateRoot: AggregateRoot): void {
    this.aggregateRoots.add(aggregateRoot);
  }
  getAggregateRoots(): AggregateRoot[] {
    return [...this.aggregateRoots];
  }
}
