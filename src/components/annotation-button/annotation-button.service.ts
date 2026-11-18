import { Injectable, signal } from '@angular/core';

export interface AnnotationButtonPosition {
  x: number;
  y: number;
  visible: boolean;
  range: Range | null;
}

export const annotationButtonStartPosition: AnnotationButtonPosition = {
  x: -1000,
  y: -1000,
  visible: false,
  range: null,
};

const BUTTON_SIZE = 36;
const VIEWPORT_PADDING = 8;

@Injectable({
  providedIn: 'root',
})
export class AnnotationButtonService {
  readonly position = signal<AnnotationButtonPosition>(annotationButtonStartPosition);

  processSelection(range: Range | null): void {
    if (!range) {
      this.hideButton();
      return;
    }

    const clientRects = range.getClientRects();
    if (clientRects.length === 0) {
      this.hideButton();
      return;
    }

    let lowestRect: DOMRect | null = null;
    let maxBottom = -Infinity;

    for (let i = 0; i < clientRects.length; i++) {
      const rect = clientRects[i];
      if (rect.width > 0 && rect.height > 0 && rect.bottom > maxBottom) {
        maxBottom = rect.bottom;
        lowestRect = rect;
      }
    }

    if (!lowestRect) {
      this.hideButton();
      return;
    }

    const rawX = lowestRect.right - BUTTON_SIZE;
    const rawY = lowestRect.bottom + 6;

    const clampedX = Math.min(
      Math.max(VIEWPORT_PADDING, rawX),
      window.innerWidth - BUTTON_SIZE - VIEWPORT_PADDING
    );
    const clampedY = Math.min(
      Math.max(VIEWPORT_PADDING, rawY),
      window.innerHeight - BUTTON_SIZE - VIEWPORT_PADDING
    );

    this.position.set({
      x: clampedX,
      y: clampedY,
      visible: true,
      range,
    });
  }

  hideButton(): void {
    this.position.set(annotationButtonStartPosition);
  }
}
