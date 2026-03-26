import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  Renderer2,
  SecurityContext,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({
  selector: '[contenteditable][formControlName], [contenteditable][formControl], [contenteditable][ngModel]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ContentEditableDirective),
    multi: true
  }]
})
export class ContentEditableDirective implements ControlValueAccessor {
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private sanitizer = inject(DomSanitizer);

  writeValue (value: string): void {
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, value);
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
    const value = this.el.nativeElement.innerHTML;
    this.onChange(value);
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
}
