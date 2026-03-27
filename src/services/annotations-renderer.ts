import { Injectable, OnDestroy } from '@angular/core';
import { IAnnotationList } from './annotations.service';

@Injectable({ providedIn: 'root' })
export class AnnotationsRenderer implements OnDestroy {
  private annotations!: IAnnotationList;
  private observer: MutationObserver | null = null;

  initData(annotations: IAnnotationList) {
    this.annotations = annotations;
    this.disconnect();
    this.setupGlobalObserver();
  }

  applyStylesToAllAnnotations(): void {
    if (!this.annotations.size) {
      return;
    }
    const marks = document.querySelectorAll('mark[data-annotation-id]');
    marks.forEach(mark => {
      const annotationId = mark.getAttribute('data-annotation-id');
      if (!annotationId || !this.annotations.has(annotationId)) return;

      const annotation = this.annotations.get(annotationId);
      if (!annotation) return;

      mark.setAttribute('style', `background: ${annotation.color}`);
    });
  }

  private setupGlobalObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.matches('mark[data-annotation-id]') ||
                element.querySelector('mark[data-annotation-id]')) {
                shouldUpdate = true;
                break;
              }
            }
          }
        }
      }

      if (shouldUpdate) {
        queueMicrotask(() => this.applyStylesToAllAnnotations());
      }
    });


    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });
  }

  private disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
