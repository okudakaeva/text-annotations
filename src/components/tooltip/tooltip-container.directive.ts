// © Кудакаеава Оксана Александровна, Россия, Ульяновск. Все права защищены. 2026
// Код создан для тестового задания UNADESK, позиция [Frontend Senior Developer (Angular) ](https://hh.ru/vacancy/131351215).
// Не предназначен для коммерческого использования без письменного согласия автора. Использование, копирование и модификация без письменного согласия автора запрещены.
// **Уникальные решения:**
// * Система аннотаций к тексту — собственная разработка.
// * Кастомные UI‑компоненты (реализованы вместо PrimeNg по требованию задания).

import { AfterViewInit, Directive, ElementRef, inject, OnDestroy } from '@angular/core';
import { TooltipService } from './tooltip.service';

@Directive({
  selector: '[appTooltipContainer]'
})
export class TooltipContainer implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private tooltipService = inject(TooltipService);
  private triggerHandlers = new WeakMap<HTMLElement | Document | Window, (event: any) => void>();
  private triggerElements = new WeakMap<HTMLElement, HTMLElement>();
  private mutationObserver: MutationObserver | null = null;

  ngAfterViewInit (): void {
    this.setupAnnotationTriggers();
    this.setupGlobalEventListeners();
    this.setupDomObserver();
  }

  ngOnDestroy (): void {
    this.cleanupGlobalEventListeners();
    this.cleanupTriggers();

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  private setupDomObserver (): void {
    this.mutationObserver = new MutationObserver((mutations) => {
      let needsReinit = false;

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.querySelector('mark[data-annotation-id]')) {
                needsReinit = true;
              }
              if (element.matches('mark[data-annotation-id]')) {
                needsReinit = true;
              }
            }
          }
        }
      }

      if (needsReinit) {
        setTimeout(() => this.reinitializeMarks(), 0);
      }
    });

    this.mutationObserver.observe(this.el.nativeElement, {
      childList: true,
      subtree: true
    });
  }

  private reinitializeMarks (): void {
    this.cleanupTriggers();
    this.setupAnnotationTriggers();
  }

  private setupAnnotationTriggers (): void {
    const marks = this.el.nativeElement.querySelectorAll('mark[data-annotation-id]:not([data-no-tooltip])');

    marks.forEach((mark: HTMLElement) => {
      if (this.triggerElements.has(mark)) {
        return;
      }

      const triggerEl = document.createElement('span');
      triggerEl.setAttribute('data-has-tooltip', 'true');
      triggerEl.setAttribute('title', 'Аннотация');

      const clickHandler = () => {
        const annotationId = mark.getAttribute('data-annotation-id');
        if (annotationId) {
          this.tooltipService.showTooltip(
            annotationId,
            mark,
            mark.getBoundingClientRect()
          );
        }
      };

      this.triggerHandlers.set(triggerEl, clickHandler);
      this.triggerElements.set(mark, triggerEl);

      triggerEl.addEventListener('click', clickHandler);
      mark.appendChild(triggerEl);
    });
  }

  private setupGlobalEventListeners (): void {
    const scrollHandler = () => this.tooltipService.hide();
    document.addEventListener('scroll', scrollHandler, true);
    window.addEventListener('scroll', scrollHandler, true);
    this.triggerHandlers.set(document, scrollHandler);

    const clickHandler = (event: MouseEvent) => {
      if (!this.isClickInsideTooltipOrTrigger(event)) {
        this.tooltipService.hide();
      }
    };
    document.addEventListener('click', clickHandler, true);
    this.triggerHandlers.set(document, clickHandler);

    const selectionHandler = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          this.tooltipService.hide();
        }
      }, 0);
    };
    document.addEventListener('mouseup', selectionHandler, true);
    document.addEventListener('keyup', selectionHandler, true);
    this.triggerHandlers.set(document, selectionHandler);
  }

  /**
   * Проверяет, был ли клик внутри тултипа или его триггер‑элемента
   */
  private isClickInsideTooltipOrTrigger (event: MouseEvent): boolean {
    const target = event.target as HTMLElement;
    const annotationContainer = this.el.nativeElement;

    if (!annotationContainer.contains(target)) {
      return false;
    }

    const closestMark = target.closest('mark[data-annotation-id]');
    if (closestMark && annotationContainer.contains(closestMark)) {
      return true;
    }

    const trigger = target.closest('.annotation-trigger');

    return !!(trigger && annotationContainer.contains(trigger));
  }

  private cleanupGlobalEventListeners (): void {
    const scrollHandler = this.triggerHandlers.get(document);
    if (scrollHandler) {
      document.removeEventListener('scroll', scrollHandler, true);
      window.removeEventListener('scroll', scrollHandler, true);
      this.triggerHandlers.delete(document);
    }

    const clickHandler = this.triggerHandlers.get(document);
    if (clickHandler) {
      document.removeEventListener('click', clickHandler, true);
      this.triggerHandlers.delete(document);
    }

    const selectionHandler = this.triggerHandlers.get(document);
    if (selectionHandler) {
      document.removeEventListener('mouseup', selectionHandler, true);
      document.removeEventListener('keyup', selectionHandler, true);
      this.triggerHandlers.delete(document);
    }
  }

  private cleanupTriggers (): void {
    const marks = this.el.nativeElement.querySelectorAll('mark[data-annotation-id]');

    marks.forEach((mark: HTMLElement) => {
      const triggerEl = this.triggerElements.get(mark);
      if (triggerEl) {
        const handler = this.triggerHandlers.get(triggerEl);
        if (handler) {
          triggerEl.removeEventListener('click', handler);
          this.triggerHandlers.delete(triggerEl);
        }
        triggerEl.remove();
      }
      this.triggerElements.delete(mark);
    });

    this.triggerHandlers = new WeakMap();
    this.triggerElements = new WeakMap();
  }
}
