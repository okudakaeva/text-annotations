import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AnnotationsService } from '../../services';
import { DialogService } from '../dialog/dialog.service';
import { AnnotationButton } from './annotation-button';

@Component({
  selector: 'app-test-host',
  imports: [AnnotationButton],
  template: `
    <p id="target">Привет, мир аннотаций!</p>
    <app-annotation-button/>
  `,
})
class TestHostComponent {
}

describe('AnnotationButton', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let dialogService: DialogService;
  const annotationsServiceMock = {
    createOrUpdate: vi.fn((annotation) => of(annotation)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: new Map([['id', 'article-1']]),
              data: {},
            },
          },
        },
        {
          provide: AnnotationsService,
          useValue: annotationsServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    dialogService = TestBed.inject(DialogService);
    await fixture.whenStable();
  });

  afterEach(() => {
    dialogService.close();
    window.getSelection()?.removeAllRanges();
  });

  function selectTextInTarget (startOffset: number, endOffset: number): void {
    const target = fixture.nativeElement.querySelector('#target') as HTMLElement;
    const textNode = target.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, startOffset);
    range.setEnd(textNode, endOffset);

    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
  }

  it('должен удалять временный тег <mark> и восстанавливать текст при закрытии диалога по Escape', async () => {
    selectTextInTarget(8, 11); // слово "мир"

    const button = fixture.nativeElement.querySelector('app-annotation-button button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    await Promise.resolve(); // ждём queueMicrotask в DialogContent

    const target = fixture.nativeElement.querySelector('#target') as HTMLElement;
    expect(target.querySelector('mark[data-annotation-id]')).not.toBeNull();
    expect(document.querySelector('app-annotation-dialog')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(document.querySelector('app-annotation-dialog')).toBeNull();
    expect(target.querySelector('mark')).toBeNull();
    expect(target.textContent).toBe('Привет, мир аннотаций!');
    expect(target.childNodes.length).toBe(1); // текстовые узлы склеены через normalize()
  });

  it('должен удалять временный тег <mark> при нажатии кнопки "Отмена"', async () => {
    selectTextInTarget(8, 11);

    const button = fixture.nativeElement.querySelector('app-annotation-button button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    await Promise.resolve();

    const cancelBtn = Array.from(
      document.querySelectorAll<HTMLButtonElement>('app-annotation-dialog button')
    ).find((btn) => btn.textContent?.trim() === 'Отмена');

    expect(cancelBtn).toBeDefined();
    cancelBtn!.click();
    await fixture.whenStable();

    const target = fixture.nativeElement.querySelector('#target') as HTMLElement;
    expect(target.querySelector('mark')).toBeNull();
    expect(target.textContent).toBe('Привет, мир аннотаций!');
  });

  it('должен сохранять тег <mark> и применять цвет при создании аннотации', async () => {
    selectTextInTarget(8, 11);

    const button = fixture.nativeElement.querySelector('app-annotation-button button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    await Promise.resolve();

    const textarea = document.querySelector<HTMLTextAreaElement>('#annotation-text')!;
    textarea.value = 'Тестовая заметка';
    textarea.dispatchEvent(new Event('input'));

    const submitBtn = Array.from(
      document.querySelectorAll<HTMLButtonElement>('app-annotation-dialog button')
    ).find((btn) => btn.textContent?.trim() === 'Создать')!;
    submitBtn.click();

    await fixture.whenStable();
    await Promise.resolve();

    const target = fixture.nativeElement.querySelector('#target') as HTMLElement;
    const mark = target.querySelector<HTMLElement>('mark[data-annotation-id]');

    expect(annotationsServiceMock.createOrUpdate).toHaveBeenCalledTimes(1);
    expect(mark).not.toBeNull();
    expect(mark?.textContent).toBe('мир');
    expect(mark?.hasAttribute('data-no-tooltip')).toBe(false);
    expect(document.querySelector('app-annotation-dialog')).toBeNull();
  });
});
