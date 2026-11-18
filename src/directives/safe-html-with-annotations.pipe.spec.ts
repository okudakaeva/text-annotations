import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtmlWithAnnotationsPipe } from './safe-html-with-annotations.pipe';

describe('SafeHtmlWithAnnotationsPipe', () => {
  let pipe: SafeHtmlWithAnnotationsPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    sanitizer = TestBed.inject(DomSanitizer);
    TestBed.runInInjectionContext(() => {
      pipe = new SafeHtmlWithAnnotationsPipe();
    });
  });

  it('should preserve allowed annotation markup and strip dangerous tags/attributes', () => {
    const dirtyHtml = `
      <p>Привет, <mark data-annotation-id="123" data-has-tooltip="true" onclick="alert(1)">мир</mark>!</p>
      <span>Запрещённый span</span>
      <script>window.hacked = true;</script>
    `;

    const safeHtml = pipe.transform(dirtyHtml);
    const rendered = sanitizer.sanitize(SecurityContext.HTML, safeHtml) ?? '';

    expect(rendered).toContain('data-annotation-id="123"');
    expect(rendered).not.toContain('onclick');
    expect(rendered).not.toContain('data-has-tooltip');
    expect(rendered).not.toContain('<script>');
    expect(rendered).not.toContain('<span>');
  });

  it('should return empty SafeHtml for empty string', () => {
    const safeHtml = pipe.transform('');
    const rendered = sanitizer.sanitize(SecurityContext.HTML, safeHtml);
    expect(rendered).toBe('');
  });
});
