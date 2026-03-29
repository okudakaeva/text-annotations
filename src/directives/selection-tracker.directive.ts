// © Кудакаеава Оксана Александровна, Россия, Ульяновск. Все права защищены. 2026
// Код создан для тестового задания UNADESK, позиция [Frontend Senior Developer (Angular) ](https://hh.ru/vacancy/131351215).
// Не предназначен для коммерческого использования без письменного согласия автора. Использование, копирование и модификация без письменного согласия автора запрещены.
// **Уникальные решения:**
// * Система аннотаций к тексту — собственная разработка.
// * Кастомные UI‑компоненты (реализованы вместо PrimeNg по требованию задания).

import { Directive, ElementRef, HostListener, inject, OnDestroy, output } from '@angular/core';

@Directive({
  selector: '[appSelectionTracker]'
})
export class SelectionTracker implements OnDestroy {
  selectionDetected = output<Range | null>();
  private el = inject(ElementRef<HTMLElement>);
  private abortCtrl = new AbortController();
  handleSelectionChange = () => {
    if (document.activeElement !== this.el.nativeElement) {
      this.selectionDetected.emit(null);
      return;
    }
  }

  constructor() {
    this.setupScrollListeners();
    this.setupSelectionChangeHandler();
  }

  @HostListener('mouseup', ['$event'])
  @HostListener('touchend', ['$event'])
  onSelectionEvent(event: MouseEvent | TouchEvent): void {
    const selection = window.getSelection();
    if (!selection || !selection.toString().trim()) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.emitCurrentSelection();
  }

  @HostListener('mousedown')
  @HostListener('touchstart')
  @HostListener('keyup')
  onClearSelectionEvent(): void {
    this.selectionDetected.emit(null);
  }

  private setupSelectionChangeHandler(): void {
    document.addEventListener('selectionchange', this.handleSelectionChange, { passive: true, signal: this.abortCtrl.signal });
  }

  private emitCurrentSelection(): void {
    const selection = window.getSelection();

    if (!selection || !selection.toString().trim()) {
      this.selectionDetected.emit(null);
      return;
    }

    const range = selection.getRangeAt(0);


    if (!this.isSelectionInsideElement(range)) {
      this.selectionDetected.emit(null);
      return;
    }

    this.selectionDetected.emit(range);
  }

  private isSelectionInsideElement(range: Range): boolean {
    const element = this.el.nativeElement;
    return (
      range.commonAncestorContainer === element ||
      element.contains(range.commonAncestorContainer)
    );
  }

  private setupScrollListeners(): void {
    this.addScrollListener(this.el.nativeElement);
    this.addScrollListener(window as unknown as HTMLElement);
  }

  private addScrollListener(element: HTMLElement): void {
    const handler = () => {
      queueMicrotask(() => this.emitCurrentSelection());
    };

    element.addEventListener('scroll', handler, { passive: true, signal: this.abortCtrl.signal });
  }

  ngOnDestroy(): void {
    this.abortCtrl.abort();
  }
}
