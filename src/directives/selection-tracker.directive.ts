import { Directive, ElementRef, HostListener, inject, OnDestroy, output } from '@angular/core';

@Directive({
  selector: '[appSelectionTracker]'
})
export class SelectionTracker implements OnDestroy {
  selectionDetected = output<Range | null>();
  private scrollListeners: Map<HTMLElement, () => void> = new Map();
  private el = inject(ElementRef<HTMLElement>);

  constructor() {
    this.setupScrollListeners();
    this.setupSelectionChangeHandler();
  }

  @HostListener('mouseup', ['$event'])
  @HostListener('touchend', ['$event'])
  onSelectionEvent(event: MouseEvent | TouchEvent): void {
    const selection = window.getSelection();
    if (!selection || !selection.toString().trim()) {
      // Отменяем действие браузера по умолчанию
      event.preventDefault();
      event.stopPropagation();
    }
    this.emitCurrentSelection();
  }

  @HostListener('mousedown')
  @HostListener('touchstart')
  onNewSelectionEvent(): void {
    this.selectionDetected.emit(null);
  }

  private setupSelectionChangeHandler(): void {
    document.addEventListener('selectionchange', this.handleSelectionChange.bind(this), { passive: true });
  }

  private handleSelectionChange(): void {
    if (document.activeElement !== this.el.nativeElement) {
      this.selectionDetected.emit(null);
      return;
    }
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

    element.addEventListener('scroll', handler, { passive: true });
    this.scrollListeners.set(element, handler);
  }

  ngOnDestroy(): void {
    this.scrollListeners.forEach((handler, element) => {
      element.removeEventListener('scroll', handler);
    });
    this.scrollListeners.clear();

    document.removeEventListener('selectionchange', this.handleSelectionChange.bind(this));
  }
}
