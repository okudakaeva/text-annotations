import { Directive, ElementRef, forwardRef, HostListener, inject, OnDestroy, OnInit, Renderer2, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import DOMPurify from 'dompurify';
import { sanitizerConfig } from './sanitizer.cfg';

@Directive({
  selector:
    '[contenteditable][formControlName], [contenteditable][formControl], [contenteditable][ngModel]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReactiveContentEditable),
      multi: true,
    },
  ],
})
export class ReactiveContentEditable implements ControlValueAccessor, OnInit, OnDestroy {
  private onChange: (value: string) => void = () => {
  };
  private onTouched: () => void = () => {
  };

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  private observer: MutationObserver | null = null;
  private isWritingFromModel = false;
  private lastEmittedValue = '';

  ngOnInit (): void {
    this.setupMutationObserver();
  }

  writeValue (value: string): void {
    const sanitized = this.sanitizeHtml(value || '');
    this.isWritingFromModel = true;
    try {
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', sanitized);
      this.lastEmittedValue = sanitized;
    } finally {
      queueMicrotask(() => {
        this.isWritingFromModel = false;
      });
    }
  }

  registerOnChange (fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched (fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState (isDisabled: boolean): void {
    this.renderer.setAttribute(
      this.el.nativeElement,
      'contenteditable',
      isDisabled ? 'false' : 'true'
    );
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
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const lines = plainText.split(/\r?\n/);
    const fragment = document.createDocumentFragment();
    let lastNode: Node | null = null;

    lines.forEach((line, index) => {
      if (index > 0) {
        const br = document.createElement('br');
        fragment.appendChild(br);
        lastNode = br;
      }
      if (line.length > 0) {
        const textNode = document.createTextNode(line);
        fragment.appendChild(textNode);
        lastNode = textNode;
      }
    });

    range.insertNode(fragment);
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    this.updateModel();
  }

  private updateModel (): void {
    if (this.isWritingFromModel) {
      return;
    }

    const value = this.el.nativeElement.innerHTML;
    if (value === this.lastEmittedValue) {
      return;
    }

    this.lastEmittedValue = value;
    this.onChange(value);
  }

  private setupMutationObserver (): void {
    this.observer = new MutationObserver((mutations) => {
      const hasContentChanges = mutations.some((m) => {
        if (m.type === 'characterData') {
          return true;
        }
        if (m.type !== 'childList') {
          return false;
        }

        const changedNodes = [...m.addedNodes, ...m.removedNodes];
        return changedNodes.some(
          (node) =>
            node.nodeType !== Node.ELEMENT_NODE ||
            !(node as HTMLElement).matches('span[data-has-tooltip], span[data-delete-annotation]')
        );
      });

      if (hasContentChanges) {
        this.updateModel();
      }
    });

    this.observer.observe(this.el.nativeElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }


  private sanitizeHtml (html: string): string {
    return DOMPurify.sanitize(html, sanitizerConfig);
  }

  ngOnDestroy (): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
