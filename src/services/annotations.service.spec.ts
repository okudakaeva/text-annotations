import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AnnotationsService } from './annotations.service';
import { CommonStorage } from './common-storage';

describe('AnnotationsService', () => {
  let service: AnnotationsService;

  beforeEach(() => {
    CommonStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnotationsService);
  });

  afterEach(() => {
    CommonStorage.clear();
  });

  it('должен реактивно обновлять сигнал annotations при создании, загрузке и удалении заметки', async () => {
    expect(service.annotations().size).toBe(0);

    await firstValueFrom(
      service.createOrUpdate({ id: 'ann-1', text: 'Заметка 1', color: '#ff0000' }, 'art-1')
    );
    expect(service.annotations().size).toBe(1);
    expect(service.annotations().get('ann-1')?.text).toBe('Заметка 1');

    service.clear();
    expect(service.annotations().size).toBe(0);

    await firstValueFrom(service.getListByArticleId('art-1'));
    expect(service.annotations().size).toBe(1);

    await firstValueFrom(service.deleteAnnotation('ann-1'));
    expect(service.annotations().size).toBe(0);
    expect(service.hasAnnotation('ann-1')).toBe(false);
  });

  it('должен удалять все аннотации конкретной статьи через deleteByArticleId, не затрагивая чужие', async () => {
    await firstValueFrom(service.createOrUpdate({ id: 'a1', text: '1' }, 'art-1'));
    await firstValueFrom(service.createOrUpdate({ id: 'a2', text: '2' }, 'art-1'));
    await firstValueFrom(service.createOrUpdate({ id: 'b1', text: '3' }, 'art-2'));

    service.deleteByArticleId('art-1');

    expect(service.hasAnnotation('a1')).toBe(false);
    expect(service.hasAnnotation('a2')).toBe(false);
    expect(service.hasAnnotation('b1')).toBe(true);
  });
});
