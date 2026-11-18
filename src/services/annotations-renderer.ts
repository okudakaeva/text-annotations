import { Injectable, OnDestroy } from '@angular/core';
import { IAnnotationList } from './annotations.service';

const MARK_SELECTOR = 'mark[data-annotation-id]';

@Injectable({ providedIn: 'root' })
export class AnnotationsRenderer implements OnDestroy {
  private annotations: IAnnotationList = new Map();
  private observer: MutationObserver | null = null;
  private isScheduled = false;

  initData(annotations: IAnnotationList): void {
    this.annotations = annotations;
    this.disconnect();
    this.setupGlobalObserver();
    this.applyStylesToAllAnnotations();
  }

  applyStylesToAllAnnotations(): void {
    this.disconnect();

    try {
      if (!this.annotations.size) {
        return;
      }

      const marks = document.querySelectorAll<HTMLElement>(MARK_SELECTOR);
      marks.forEach((mark) => {
        const annotationId = mark.getAttribute('data-annotation-id');
        if (!annotationId) return;

        const annotation = this.annotations.get(annotationId);
        if (!annotation?.color) return;

        mark.style.backgroundColor = annotation.color;
      });
    } finally {
      this.connect();
    }
  }

  private setupGlobalObserver(): void {
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

  private connect(): void {
    this.observer?.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private disconnect(): void {
    this.observer?.disconnect();
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.observer = null;
  }
}
