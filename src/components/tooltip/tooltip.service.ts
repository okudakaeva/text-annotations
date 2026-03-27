import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AnnotationsService, IAnnotation } from '../../services';

export interface TooltipState {
  text: string;
  position: { x: number; y: number };
  isVisible: boolean;
  showCloseButton: boolean;
  size: { width: number; height: number };
}

@Injectable({ providedIn: 'root' })
export class TooltipService {
  private tooltipState$ = new BehaviorSubject<TooltipState>({
    text: '',
    position: { x: 0, y: 0 },
    isVisible: false,
    showCloseButton: true,
    size: { width: 0, height: 0 }
  });

  constructor(private annotationsService: AnnotationsService) {}

  getTooltipData() {
    return this.tooltipState$.asObservable();
  }

  showTooltip(annotationId: string, triggerElement: HTMLElement, annotationRect: DOMRect): void {
    const subscription = this.annotationsService.getAnnotation(annotationId)
      .subscribe({
        next: (annotation: IAnnotation | null) => {
          if (annotation) {
            this.getTooltipSize(annotation.text).then(size => {
              const position = this.calculatePosition(annotationRect, size);

              console.log(annotationRect, size, position)

              this.tooltipState$.next({
                text: annotation.text,
                position,
                isVisible: true,
                showCloseButton: true,
                size // передаём реальные размеры
              });
            });
          }
        },
        error: (error) => {
          console.error('Ошибка при получении аннотации:', error);
        },
        complete: () => subscription.unsubscribe(),
      });
  }

  hide(): void {
    this.tooltipState$.next({
      ...this.tooltipState$.value,
      isVisible: false
    });
  }

  private getTooltipSize(text: string): Promise<{ width: number; height: number }> {
    return new Promise(resolve => {
      const tempContainer = document.createElement('div');

      Object.assign(tempContainer.style, {
        position: 'absolute',
        left: '-10000px',
        top: '-10000px',
        opacity: '0',
        pointerEvents: 'none',
        visibility: 'hidden',
        zIndex: '-1',
        fontSize: '14px',
        maxWidth: '500px'
      });

      tempContainer.textContent = text;
      document.body.appendChild(tempContainer);

      requestAnimationFrame(() => {
        const tooltipPaddingV = 12;
        const tooltipPaddingH = 24;
        const width = tempContainer.offsetWidth + tooltipPaddingH;
        const height = tempContainer.offsetHeight + tooltipPaddingV;

        document.body.removeChild(tempContainer);
        resolve({ width, height });
      });
    });
  }

  private calculatePosition(
    annotationRect: DOMRect,
    tooltipSize: { width: number; height: number }
  ): { x: number; y: number } {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let left: number;
    let top: number;

    left = annotationRect.right - tooltipSize.width;
    top = annotationRect.top - tooltipSize.height;

    if (left < 0) {
      left = 10;
    }
    if (left + tooltipSize.width > viewportWidth) {
      left = viewportWidth - tooltipSize.width - 10;
    }


    if (top < 0) {
      top = 10;
    }
    if (top + tooltipSize.height > viewportHeight) {
      top = viewportHeight - tooltipSize.height - 10;
    }

    return { x: left, y: top };
  }
}
