import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AnnotationsService } from '../../services';

export interface TooltipState {
  annotationId: string | null;
  text: string;
  position: { x: number; y: number };
  isVisible: boolean;
  showCloseButton: boolean;
  size: { width: number; height: number };
}

const initialTooltipState: TooltipState = {
  annotationId: null,
  text: '',
  position: { x: 0, y: 0 },
  isVisible: false,
  showCloseButton: true,
  size: { width: 0, height: 0 },
};

@Injectable({ providedIn: 'root' })
export class TooltipService {
  private readonly annotationsService = inject(AnnotationsService);
  private requestCounter = 0;

  readonly state = signal<TooltipState>(initialTooltipState);

  async showTooltip (
    annotationId: string,
    _triggerElement: HTMLElement,
    annotationRect: DOMRect
  ): Promise<void> {
    const currentState = this.state();
    if (currentState.isVisible && currentState.annotationId === annotationId) {
      this.hide();
      return;
    }

    const currentRequest = ++this.requestCounter;
    const annotation = await firstValueFrom(
      this.annotationsService.getAnnotation(annotationId)
    );

    if (currentRequest !== this.requestCounter || !annotation) {
      return;
    }

    const size = await this.measureTooltipSize(annotation.text);
    if (currentRequest !== this.requestCounter) {
      return;
    }

    const position = this.calculatePosition(annotationRect, size);
    this.state.set({
      annotationId,
      text: annotation.text,
      position,
      isVisible: true,
      showCloseButton: true,
      size,
    });
  }

  hide (): void {
    this.requestCounter++;
    this.state.update((prev) =>
      prev.isVisible ? { ...prev, isVisible: false, annotationId: null } : prev
    );
  }

  private measureTooltipSize (text: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const tooltipEl = document.querySelector<HTMLElement>('app-tooltip .tooltip');

      if (tooltipEl) {
        const clone = tooltipEl.cloneNode(true) as HTMLElement;
        clone.classList.remove('visible');
        Object.assign(clone.style, {
          left: '-10000px',
          top: '-10000px',
          visibility: 'hidden',
          transition: 'none',
        });

        const contentEl = clone.querySelector('.tooltip-content');
        if (contentEl) {
          contentEl.textContent = text;
        }

        document.body.appendChild(clone);
        requestAnimationFrame(() => {
          const rect = clone.getBoundingClientRect();
          clone.remove();
          resolve({ width: Math.ceil(rect.width), height: Math.ceil(rect.height) });
        });
        return;
      }

      const fallback = document.createElement('div');
      Object.assign(fallback.style, {
        position: 'fixed',
        left: '-10000px',
        top: '-10000px',
        visibility: 'hidden',
        fontSize: '14px',
        maxWidth: '500px',
        whiteSpace: 'pre-wrap',
      });
      fallback.textContent = text;
      document.body.appendChild(fallback);

      requestAnimationFrame(() => {
        const rect = fallback.getBoundingClientRect();
        fallback.remove();
        resolve({ width: Math.ceil(rect.width), height: Math.ceil(rect.height) });
      });
    });
  }

  private calculatePosition (
    annotationRect: DOMRect,
    tooltipSize: { width: number; height: number }
  ): { x: number; y: number } {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let left = annotationRect.right - tooltipSize.width;
    let top = annotationRect.top - tooltipSize.height - 6;

    if (top < 10) {
      top = annotationRect.bottom + 6;
    }

    left = Math.min(Math.max(10, left), viewportWidth - tooltipSize.width - 10);
    top = Math.min(Math.max(10, top), viewportHeight - tooltipSize.height - 10);

    return { x: left, y: top };
  }
}
