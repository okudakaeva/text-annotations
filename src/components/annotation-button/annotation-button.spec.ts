import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AnnotationsService } from '../../services';
import { DialogService } from '../dialog/dialog.service';
import { AnnotationButton } from './annotation-button';
import { AnnotationButtonService } from './annotation-button.service';
import { dict } from '../../dictionary';

@Component({
  selector: 'app-test-host',
  imports: [AnnotationButton],
  template: `
    <div id="content">
      <p id="target">Привет, мир аннотаций!</p>
    </div>
    <app-annotation-button/>
  `,
})
class TestHostComponent {
}

describe('AnnotationButton', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let dialogService: DialogService;
  let buttonService: AnnotationButtonService;
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
    buttonService = TestBed.inject(AnnotationButtonService);
    buttonService.position.set({ x: 100, y: 100, visible: true });
    fixture.detectChanges();
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

  it(`должен удалять временный тег <${ dict['MARK_TAG'] }> и восстанавливать текст при закрытии диалога по Escape`, async () => {
    selectTextInTarget(8, 11); // слово "мир"

    const button = fixture.nativeElement.querySelector('app-annotation-button button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    await Promise.resolve(); // ждём queueMicrotask в DialogContent

    const target = fixture.nativeElement.querySelector('#target') as HTMLElement;
    expect(target.querySelector(dict['MARK_ANY_SELECTOR'])).not.toBeNull();
    expect(document.querySelector('app-annotation-dialog')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(document.querySelector('app-annotation-dialog')).toBeNull();
    expect(target.querySelector(dict['MARK_TAG'])).toBeNull();
    expect(target.textContent).toBe('Привет, мир аннотаций!');
    expect(target.childNodes.length).toBe(1); // текстовые узлы склеены через normalize()
  });

  it(`должен удалять временный тег <${ dict['MARK_TAG'] }> при нажатии кнопки "${dict['BTN_CANCEL']}"`, async () => {
    selectTextInTarget(8, 11);

    const button = fixture.nativeElement.querySelector('app-annotation-button button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    await Promise.resolve();

    const cancelBtn = Array.from(
      document.querySelectorAll<HTMLButtonElement>('app-annotation-dialog button')
    ).find((btn) => btn.textContent?.trim() === dict['BTN_CANCEL']);

    expect(cancelBtn).toBeDefined();
    cancelBtn!.click();
    await fixture.whenStable();

    const target = fixture.nativeElement.querySelector('#target') as HTMLElement;
    expect(target.querySelector(dict['MARK_TAG'])).toBeNull();
    expect(target.textContent).toBe('Привет, мир аннотаций!');
  });

  it(`должен сохранять тег <${ dict['MARK_TAG'] }> и применять цвет при создании аннотации`, async () => {
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
    ).find((btn) => btn.textContent?.trim() === dict['BTN_CREATE'])!;
    submitBtn.click();

    await fixture.whenStable();
    await Promise.resolve();

    const target = fixture.nativeElement.querySelector('#target') as HTMLElement;
    const mark = target.querySelector<HTMLElement>(dict['MARK_ANY_SELECTOR']);

    expect(annotationsServiceMock.createOrUpdate).toHaveBeenCalledTimes(1);
    expect(mark).not.toBeNull();
    expect(mark?.textContent).toBe('мир');
    expect(mark?.hasAttribute(dict['ATTR_NO_TOOLTIP'])).toBe(false);
    expect(document.querySelector('app-annotation-dialog')).toBeNull();
  });

  it(`должен корректно оборачивать выделение через границу абзацев отдельными <${ dict['MARK_TAG'] }> без поломки DOM`, async () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    const contentEl = hostEl.querySelector('#content') as HTMLElement;
    contentEl.innerHTML = `
      <p id="p1">Первый абзац</p>
      <p id="p2">Второй абзац</p>
    `;

    const p1Text = contentEl.querySelector('#p1')!.firstChild as Text;
    const p2Text = contentEl.querySelector('#p2')!.firstChild as Text;

    const range = document.createRange();
    range.setStart(p1Text, 7); // "абзац"
    range.setEnd(p2Text, 6);   // "Второй"

    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);

    const button = hostEl.querySelector('app-annotation-button button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    await Promise.resolve();

    const p1Marks = contentEl.querySelectorAll(`#p1 ${ dict['MARK_ANY_SELECTOR'] }`);
    const p2Marks = contentEl.querySelectorAll(`#p2 ${ dict['MARK_ANY_SELECTOR'] }`);

    expect(p1Marks.length).toBe(1);
    expect(p2Marks.length).toBe(1);
    expect(p1Marks[0].textContent).toBe('абзац');
    expect(p2Marks[0].textContent).toBe('Второй');
    expect(p1Marks[0].getAttribute(dict['ATTR_ANNOTATION_ID'])).toBe(
      p2Marks[0].getAttribute(dict['ATTR_ANNOTATION_ID'])
    );
    expect(contentEl.querySelector(`${ dict['MARK_TAG'] } p`)).toBeNull();
  });


});
