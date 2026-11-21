import { AfterViewInit, Directive, ElementRef, inject, OnDestroy } from '@angular/core';
import { TooltipService } from './tooltip.service';
import { dict } from '../../dictionary';

@Directive({
  selector: '[appTooltipContainer]',
})
export class TooltipContainer implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private tooltipService = inject(TooltipService);
  private triggerHandlers: WeakMap<HTMLElement, (event: Event) => void> | null = new WeakMap();
  private triggerElements: WeakMap<HTMLElement, HTMLElement> | null = new WeakMap();
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
    return Array.from(this.el.nativeElement.querySelectorAll(dict['MARK_SELECTOR']));
  }

  private setupDomObserver (): void {
    this.observer = new MutationObserver((mutations) => {
      let needsReinit = false;

      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === dict['ATTR_NO_TOOLTIP']) {
          needsReinit = true;
          break;
        }

        if (mutation.type !== 'childList') {
          continue;
        }

        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.matches(dict['MARK_SELECTOR']) || element.querySelector(dict['MARK_SELECTOR'])) {
              needsReinit = true;
              break;
            }
          }
        }

        if (!needsReinit) {
          for (const node of mutation.removedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.matches(dict['MARK_BUTTON_SELECTOR']) || element.querySelector(dict['MARK_BUTTON_SELECTOR'])) {
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
      attributeFilter: [dict['ATTR_NO_TOOLTIP']],
    });
  }

  private disconnect (): void {
    this.observer?.disconnect();
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

    const lastMarkById = new Map<string, HTMLElement>();
    marks.forEach((mark) => {
      const id = mark.getAttribute(dict['ATTR_ANNOTATION_ID']);
      if (id) {
        lastMarkById.set(id, mark);
      }
    });

    const lastMarks = new Set(lastMarkById.values());

    marks.forEach((mark) => {
      if (!lastMarks.has(mark)) {
        mark.querySelectorAll(dict['MARK_BUTTON_SELECTOR']).forEach((btn) => btn.remove());
        return;
      }

      if (this.triggerElements!.has(mark) || mark.querySelector(dict['MARK_BUTTON_SELECTOR'])) {
        return;
      }

      const triggerEl = document.createElement('span');
      triggerEl.setAttribute(dict['ATTR_HAS_TOOLTIP'], 'true');
      triggerEl.setAttribute('title', dict['TOOLTIP_TRIGGER_HINT']);

      const clickHandler = () => {
        const annotationId = mark.getAttribute(dict['ATTR_ANNOTATION_ID']);
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

    const clickHandler = (event: MouseEvent) => {
      if (!this.isClickInsideTooltipOrTrigger(event)) {
        this.tooltipService.hide();
      }
    };
    document.addEventListener('click', clickHandler, { capture: true, signal: this.abortCtrl.signal });

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

    const toggleHoverByEvent = (event: MouseEvent, isHovered: boolean) => {
      const target = event.target as HTMLElement | null;
      const mark = target?.closest<HTMLElement>(
        `${ dict['MARK_TAG'] }[${ dict['ATTR_ANNOTATION_ID'] }]`
      );
      if (!mark) {
        return;
      }

      event.stopPropagation();

      const annotationId = mark.getAttribute(dict['ATTR_ANNOTATION_ID']);
      if (!annotationId) {
        return;
      }

      const related = event.relatedTarget as HTMLElement | null;
      const relatedMark = related?.closest<HTMLElement>(
        `${ dict['MARK_TAG'] }[${ dict['ATTR_ANNOTATION_ID'] }]`
      );
      if (relatedMark?.getAttribute(dict['ATTR_ANNOTATION_ID']) === annotationId) {
        return;
      }

      this.el.nativeElement
        .querySelectorAll(
          `${ dict['MARK_TAG'] }[${ dict['ATTR_ANNOTATION_ID'] }="${ annotationId }"]`
        )
        .forEach((part: HTMLElement) => part.classList.toggle(dict['ANNOTATION_HOVER_CLASS'], isHovered));
    };

    this.el.nativeElement.addEventListener(
      'mouseover',
      (event: MouseEvent) => toggleHoverByEvent(event, true),
      { signal: this.abortCtrl.signal }
    );
    this.el.nativeElement.addEventListener(
      'mouseout',
      (event: MouseEvent) => toggleHoverByEvent(event, false),
      { signal: this.abortCtrl.signal }
    );
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
      target.closest(dict['MARK_ANY_SELECTOR']) ||
      target.closest(dict['MARK_BUTTON_SELECTOR'])
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
