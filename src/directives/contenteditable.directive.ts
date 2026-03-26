import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  inject, OnDestroy, OnInit,
  Renderer2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import DOMPurify from 'dompurify';
import { sanitizerConfig } from './sanitizer.cfg';

@Directive({
  selector: '[contenteditable][formControlName], [contenteditable][formControl], [contenteditable][ngModel]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ContentEditableDirective),
    multi: true
  }]
})
export class ContentEditableDirective implements ControlValueAccessor, OnInit, OnDestroy {
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private el = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);
  private observer: MutationObserver | null = null;

  ngOnInit(): void {
    this.setupMutationObserver();
  }

  writeValue (value: string): void {
    const sanitized = this.sanitizeHtml(value || '');
    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', sanitized || '');
  }

  registerOnChange (fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched (fn: () => void): void {
    this.onTouched = fn;
  }

  @HostListener('input')
  onInput (): void {
    this.updateModel();
  }

  @HostListener('blur')
  onBlur (): void {
    this.onTouched();
  }

  @HostListener('paste', ['$event'])
  onPaste (event: ClipboardEvent): void {
    event.preventDefault();

    const plainText = event.clipboardData?.getData('text/plain') || '';
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(plainText);
    range.insertNode(textNode);

    range.setStartAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    const value = this.el.nativeElement.innerHTML;
    this.onChange(value);
  }

  private updateModel(): void {
    const value = this.el.nativeElement.innerHTML;
    this.onChange(value);
  }

  private setupMutationObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          this.updateModel();
        }
      });
    });

    this.observer.observe(this.el.nativeElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  private sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, sanitizerConfig);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
