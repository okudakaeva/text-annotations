import { AfterViewInit, Directive, ElementRef, inject, input, OnDestroy, } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ArticleService, IArticle } from '../services';
import { dict } from '../dictionary';

@Directive({
  selector: '[appArticleReadonlySync]',
})
export class ArticleReadonlySync implements AfterViewInit, OnDestroy {
  readonly article = input.required<IArticle>({ alias: 'appArticleReadonlySync' });

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly articleService = inject(ArticleService);
  private observer: MutationObserver | null = null;
  private lastSavedHtml = '';

  ngAfterViewInit (): void {
    this.lastSavedHtml = this.getCleanHtml();
    this.setupObserver();
  }

  ngOnDestroy (): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private setupObserver (): void {
    this.observer = new MutationObserver((mutations) => {
      if (!this.hasRelevantMutations(mutations)) {
        return;
      }

      const cleanHtml = this.getCleanHtml();
      if (cleanHtml === this.lastSavedHtml) {
        return;
      }

      this.lastSavedHtml = cleanHtml;
      void firstValueFrom(
        this.articleService.createOrUpdate({
          ...this.article(),
          text: cleanHtml,
        })
      );
    });

    this.observer.observe(this.el.nativeElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [dict['ATTR_NO_TOOLTIP'], dict['ATTR_ANNOTATION_ID']],
    });
  }

  private hasRelevantMutations (mutations: MutationRecord[]): boolean {
    return mutations.some((mutation) => {
      if (mutation.type === 'attributes') {
        const target = mutation.target as HTMLElement;
        return target.tagName === 'MARK' && !target.hasAttribute(dict['ATTR_NO_TOOLTIP']);
      }

      const nodes = [...mutation.addedNodes, ...mutation.removedNodes];
      return nodes.some((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return false;
        }
        const element = node as HTMLElement;

        if (element.matches(dict['MARK_BUTTON_SELECTOR'])) {
          return false;
        }

        if (element.tagName === 'MARK') {
          return !element.hasAttribute(dict['ATTR_NO_TOOLTIP']);
        }

        return Boolean(element.querySelector(dict['MARK_SELECTOR']));
      });
    });
  }

  private getCleanHtml (): string {
    const clone = this.el.nativeElement.cloneNode(true) as HTMLElement;

    clone.querySelectorAll(dict['MARK_BUTTON_SELECTOR']).forEach((el) => el.remove());

    clone.querySelectorAll(dict['MARK_NO_TOOLTIP_SELECTOR']).forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) {
        return;
      }
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
    });

    return clone.innerHTML;
  }
}
