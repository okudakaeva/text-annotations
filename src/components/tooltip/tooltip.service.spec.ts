import { TestBed } from '@angular/core/testing';
import { delay, of } from 'rxjs';
import { vi } from 'vitest';
import { AnnotationsService } from '../../services';
import { TooltipService } from './tooltip.service';

describe('TooltipService', () => {
  let service: TooltipService;
  const annotationsServiceMock = {
    getAnnotation: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: AnnotationsService, useValue: annotationsServiceMock }],
    });
    service = TestBed.inject(TooltipService);
  });

  it('должен показывать тултип и позиционировать его под аннотацией, если сверху мало места', async () => {
    annotationsServiceMock.getAnnotation.mockReturnValueOnce(
      of({ id: 'a1', text: 'Подсказка' })
    );

    const triggerEl = document.createElement('span');
    const nearTopRect = new DOMRect(100, 5, 80, 20); // top = 5 (< 10)

    await service.showTooltip('a1', triggerEl, nearTopRect);

    const state = service.state();
    expect(state.isVisible).toBe(true);
    expect(state.annotationId).toBe('a1');
    expect(state.text).toBe('Подсказка');
    // Должен перевернуться под аннотацию: bottom (25) + 6 = 31
    expect(state.position.y).toBe(31);
  });

  it('должен игнорировать устаревший ответ при быстрых повторных вызовах (защита от race condition)', async () => {
    annotationsServiceMock.getAnnotation
      .mockReturnValueOnce(of({ id: 'slow', text: 'Медленный' }).pipe(delay(50)))
      .mockReturnValueOnce(of({ id: 'fast', text: 'Быстрый' }).pipe(delay(5)));

    const el = document.createElement('span');
    const rect = new DOMRect(100, 200, 50, 20);

    const firstCall = service.showTooltip('slow', el, rect);
    const secondCall = service.showTooltip('fast', el, rect);

    await Promise.all([firstCall, secondCall]);

    expect(service.state().annotationId).toBe('fast');
    expect(service.state().text).toBe('Быстрый');
  });
});
