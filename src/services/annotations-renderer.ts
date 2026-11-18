import { Injectable, OnDestroy } from '@angular/core';
import { IAnnotationList } from './annotations.service';

const MARK_SELECTOR = 'mark[data-annotation-id]';
const DARK_TEXT = '#111111';
const LIGHT_TEXT = '#ffffff';

@Injectable({ providedIn: 'root' })
export class AnnotationsRenderer implements OnDestroy {
  private annotations: IAnnotationList = new Map();
  private observer: MutationObserver | null = null;
  private isScheduled = false;
  private readonly contrastCache = new Map<string, string>();

  initData (annotations: IAnnotationList): void {
    this.annotations = annotations;
    this.disconnect();
    this.setupGlobalObserver();
    this.applyStylesToAllAnnotations();
  }

  applyStylesToAllAnnotations (): void {
    this.disconnect();

    try {
      if (!this.annotations.size) {
        return;
      }

      const marks = document.querySelectorAll<HTMLElement>(MARK_SELECTOR);
      marks.forEach((mark) => {
        const annotationId = mark.getAttribute('data-annotation-id');
        if (!annotationId) {
          return;
        }

        const annotation = this.annotations.get(annotationId);
        if (!annotation?.color) {
          return;
        }

        mark.style.backgroundColor = annotation.color;
        mark.style.color = this.getContrastTextColor(annotation.color);
      });
    } finally {
      this.connect();
    }
  }

  private setupGlobalObserver (): void {
    this.observer = new MutationObserver((mutations) => {
      const hasAddedMarks = mutations.some(
        (mutation) =>
          mutation.type === 'childList' &&
          Array.from(mutation.addedNodes).some(
            (node) =>
              node.nodeType === Node.ELEMENT_NODE &&
              ((node as HTMLElement).matches(MARK_SELECTOR) ||
                Boolean((node as HTMLElement).querySelector(MARK_SELECTOR)))
          )
      );

      if (hasAddedMarks && !this.isScheduled) {
        this.isScheduled = true;
        queueMicrotask(() => {
          this.isScheduled = false;
          this.applyStylesToAllAnnotations();
        });
      }
    });

    this.connect();
  }

  private connect (): void {
    this.observer?.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private disconnect (): void {
    this.observer?.disconnect();
  }

  ngOnDestroy (): void {
    this.disconnect();
    this.observer = null;
    this.contrastCache.clear();
  }

  private getContrastTextColor (color: string): string {
    const normalized = color.trim().toLowerCase();
    const cached = this.contrastCache.get(normalized);

    if (cached) {
      return cached;
    }

    const rgb = this.parseHexColor(normalized) ?? this.resolveCssColorViaDom(normalized);
    if (!rgb) {
      return DARK_TEXT;
    }

    const [r, g, b] = rgb;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    const result = yiq >= 145 ? DARK_TEXT : LIGHT_TEXT;

    this.contrastCache.set(normalized, result);
    return result;
  }

  private parseHexColor (color: string): [number, number, number] | null {
    const shortHex = /^#([0-9a-f]{3})$/i.exec(color);
    if (shortHex) {
      const [r, g, b] = shortHex[1].split('').map((ch) => parseInt(ch + ch, 16));
      return [r, g, b];
    }

    const fullHex = /^#([0-9a-f]{6})$/i.exec(color);
    if (fullHex) {
      const hex = fullHex[1];
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }

    return null;
  }

  private resolveCssColorViaDom (color: string): [number, number, number] | null {
    const temp = document.createElement('span');
    temp.style.color = color;
    document.body.appendChild(temp);
    const computed = getComputedStyle(temp).color;
    temp.remove();

    const match = computed.match(/\d+/g);
    if (!match || match.length < 3) {
      return null;
    }

    return [Number(match[0]), Number(match[1]), Number(match[2])];
  }
}
