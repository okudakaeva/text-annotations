import { Directive, ElementRef, HostListener, inject, OnDestroy, output } from '@angular/core';

@Directive({
  selector: '[appSelectionTracker]'
})
export class SelectionTracker implements OnDestroy {
  readonly selectionDetected = output<Range | null>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly abortCtrl = new AbortController();

  private readonly handleSelectionChange = (): void => {
    const active = document.activeElement;
    if (active !== this.el.nativeElement && !this.el.nativeElement.contains(active)) {
      this.selectionDetected.emit(null);
    }
  };

  constructor () {
    this.setupScrollListeners();
    this.setupSelectionChangeHandler();
  }

  @HostListener('mouseup')
  @HostListener('touchend')
  @HostListener('keyup')
  onSelectionComplete (): void {
    this.emitCurrentSelection();
  }

  @HostListener('mousedown')
  @HostListener('touchstart')
  onSelectionStart (): void {
    this.selectionDetected.emit(null);
  }

  private setupSelectionChangeHandler (): void {
    document.addEventListener('selectionchange', this.handleSelectionChange, {
      passive: true,
      signal: this.abortCtrl.signal,
    });
  }

  private emitCurrentSelection (): void {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || !selection.toString().trim()) {
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

  private isSelectionInsideElement (range: Range): boolean {
    const element = this.el.nativeElement;
    return (
      range.commonAncestorContainer === element ||
      element.contains(range.commonAncestorContainer)
    );
  }

  private setupScrollListeners (): void {
    this.addScrollListener(this.el.nativeElement);
    this.addScrollListener(window);
  }

  private addScrollListener (target: EventTarget): void {
    const handler = (): void => {
      queueMicrotask(() => this.emitCurrentSelection());
    };

    target.addEventListener('scroll', handler, {
      passive: true,
      signal: this.abortCtrl.signal,
    });
  }

  ngOnDestroy (): void {
    this.abortCtrl.abort();
  }
}
