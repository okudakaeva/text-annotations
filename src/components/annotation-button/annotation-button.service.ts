import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// © Кудакаеава Оксана Александровна, Россия, Ульяновск. Все права защищены. 2026
// Код создан для тестового задания UNADESK, позиция [Frontend Senior Developer (Angular) ](https://hh.ru/vacancy/131351215).
// Использование, копирование и модификация без письменного согласия автора запрещены.
// **Уникальные решения:**
// * Система аннотаций к тексту — собственная разработка.
// * Кастомные UI‑компоненты (реализованы вместо PrimeNg по требованию задания).
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
  range: null
}

@Injectable({
  providedIn: 'root'
})
export class AnnotationButtonService {
  private positionSubject = new Subject<AnnotationButtonPosition>();

  processSelection (range: Range | null): void {
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

      if (rect.bottom > maxBottom) {
        maxBottom = rect.bottom;
        lowestRect = rect;
      }
    }

    if (!lowestRect) {
      this.hideButton();
      return;
    }

    const buttonX = lowestRect.right - 40;
    const buttonY = lowestRect.bottom + 5;

    this.showButton(buttonX, buttonY, range);
  }

  private showButton (x: number, y: number, range: Range): void {
    this.positionSubject.next({
      x,
      y,
      visible: true,
      range
    });
  }

  private hideButton (): void {
    this.positionSubject.next(annotationButtonStartPosition);
  }

  getPositionUpdates (): Subject<AnnotationButtonPosition> {
    return this.positionSubject;
  }
}
