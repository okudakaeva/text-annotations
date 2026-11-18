import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import { sanitizerConfig } from './sanitizer.cfg';

@Pipe({ name: 'safeHtmlWithAnnotations' })
export class SafeHtmlWithAnnotationsPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer)

  transform (value: string): SafeHtml {
    if (!value) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    const purified = DOMPurify.sanitize(value, sanitizerConfig);

    return this.sanitizer.bypassSecurityTrustHtml(purified);
  }
}
