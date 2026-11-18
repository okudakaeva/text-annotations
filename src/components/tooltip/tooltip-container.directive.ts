import { AfterViewInit, Directive, ElementRef, inject, OnDestroy } from '@angular/core';
import { TooltipService } from './tooltip.service';

const markSelector = 'mark[data-annotation-id]:not([data-no-tooltip])';
const buttonSelector = 'span[data-has-tooltip]';

@Directive({
  selector: '[appTooltipContainer]'
})
export class TooltipContainer implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private tooltipService = inject(TooltipService);
  private triggerHandlers: WeakMap<HTMLElement | Document | Window, (event: any) => void> | null = new WeakMap<HTMLElement | Document | Window, (event: any) => void>();
  private triggerElements: WeakMap<HTMLElement, HTMLElement> | null = new WeakMap<HTMLElement, HTMLElement>();
  private observer: MutationObserver | null = null;
  private abortCtrl = new AbortController();

  ngAfterViewInit (): void {
    this.setupAnnotationTriggers();
    this.setupGlobalEventListeners();
    this.setupDomObserver();
  }

  ngOnDestroy (): void {
    this.abortCtrl.abort();
    this.cleanupTriggers();
    this.disconnect();
    this.triggerHandlers = null;
    this.triggerElements = null;
  }

  private getMarks (): HTMLElement[] {
    return this.el.nativeElement.querySelectorAll(markSelector);
  }

  private setupDomObserver (): void {
    this.observer = new MutationObserver((mutations) => {
      let needsReinit = false;

      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-no-tooltip') {
          needsReinit = true;
          break;
        }

        if (mutation.type !== 'childList') {
          continue;
        }

        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.matches(markSelector) || element.querySelector(markSelector)) {
              needsReinit = true;
              break;
            }
          }
        }

        if (!needsReinit) {
          for (const node of mutation.removedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.matches(buttonSelector) || element.querySelector(buttonSelector)) {
                needsReinit = true;
                break;
              }
            }
          }
        }
      }

      if (needsReinit) {
        queueMicrotask(() => this.reinitializeMarks());
      }
    });

    this.connect();
  }

  private connect (): void {
    this.observer?.observe(this.el.nativeElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-no-tooltip'],
    });
  }

  private disconnect () {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private reinitializeMarks (): void {
    this.disconnect();
    this.cleanupTriggers();
    this.setupAnnotationTriggers();
    this.connect();
  }

  private setupAnnotationTriggers (): void {
    this.disconnect();
    const marks = this.getMarks();

    marks.forEach((mark: HTMLElement) => {
      if (this.triggerElements!.has(mark) || mark.querySelector(buttonSelector)) {
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

      this.triggerHandlers!.set(triggerEl, clickHandler);
      this.triggerElements!.set(mark, triggerEl);

      triggerEl.addEventListener('click', clickHandler);
      mark.appendChild(triggerEl);
    });

    this.connect();
  }

  private setupGlobalEventListeners (): void {
    const scrollHandler = () => this.tooltipService.hide();
    document.addEventListener('scroll', scrollHandler, { capture: true, signal: this.abortCtrl.signal });
    window.addEventListener('scroll', scrollHandler, { capture: true, signal: this.abortCtrl.signal });
    this.triggerHandlers!.set(document, scrollHandler);

    const clickHandler = (event: MouseEvent) => {
      if (!this.isClickInsideTooltipOrTrigger(event)) {
        this.tooltipService.hide();
      }
    };
    document.addEventListener('click', clickHandler, { capture: true, signal: this.abortCtrl.signal });
    this.triggerHandlers!.set(document, clickHandler);

    const selectionHandler = () => {
      queueMicrotask(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          this.tooltipService.hide();
        }
      });
    };
    document.addEventListener('mouseup', selectionHandler, { capture: true, signal: this.abortCtrl.signal });
    document.addEventListener('keyup', selectionHandler, { capture: true, signal: this.abortCtrl.signal });
    this.triggerHandlers!.set(document, selectionHandler);
  }

  private isClickInsideTooltipOrTrigger (event: MouseEvent): boolean {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return false;
    }

    if (target.closest('app-tooltip')) {
      return true;
    }

    const annotationContainer = this.el.nativeElement;
    if (!annotationContainer.contains(target)) {
      return false;
    }

    return Boolean(
      target.closest('mark[data-annotation-id]') ||
      target.closest('span[data-has-tooltip]')
    );
  }

  private cleanupTriggers (): void {
    const marks = this.getMarks();

    marks.forEach((mark: HTMLElement) => {
      const triggerEl = this.triggerElements!.get(mark);
      if (triggerEl) {
        const handler = this.triggerHandlers!.get(triggerEl);
        if (handler) {
          triggerEl.removeEventListener('click', handler);
          this.triggerHandlers!.delete(triggerEl);
        }
        triggerEl.remove();
      }
      this.triggerElements!.delete(mark);
    });
  }
}
