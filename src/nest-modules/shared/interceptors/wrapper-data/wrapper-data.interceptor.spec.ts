import { lastValueFrom, of } from 'rxjs';
import { WrapperDataInterceptor } from './wrapper-data.interceptor';

describe('WrapperDataInterceptor', () => {
  let interceptor: WrapperDataInterceptor;

  beforeEach(() => {
    interceptor = new WrapperDataInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap data with meta', async () => {
    const obs$ = interceptor.intercept(
      {} as any,
      { handle: () => of({ name: 'test' }) } as any,
    );

    const result = await lastValueFrom(obs$);

    expect(result).toEqual({ data: { name: 'test' } });
  });

  it('should not wrap data with meta if it already has a meta property', async () => {
    const data = { data: { name: 'test' }, meta: { total: 1 } };

    const obs$ = interceptor.intercept(
      {} as any,
      { handle: () => of(data) } as any,
    );

    const result = await lastValueFrom(obs$);

    expect(result).toEqual(data);
  });
});
