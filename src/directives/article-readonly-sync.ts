import { AfterViewInit, Directive, ElementRef, inject, input, OnDestroy, output, } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ArticleService, IArticle } from '../services';

@Directive({
  selector: '[appArticleReadonlySync]',
})
export class ArticleReadonlySync implements AfterViewInit, OnDestroy {
  readonly article = input.required<IArticle>({ alias: 'appArticleReadonlySync' });
  readonly articleUpdated = output<IArticle>();

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
      attributeFilter: ['data-no-tooltip', 'data-annotation-id'],
    });
  }


  private hasRelevantMutations (mutations: MutationRecord[]): boolean {
    return mutations.some((mutation) => {
      if (mutation.type === 'attributes') {
        const target = mutation.target as HTMLElement;
        return target.tagName === 'MARK' && !target.hasAttribute('data-no-tooltip');
      }

      const nodes = [...mutation.addedNodes, ...mutation.removedNodes];
      return nodes.some((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return false;
        }
        const element = node as HTMLElement;

        if (
          element.matches('span[data-has-tooltip], span[data-delete-annotation]')
        ) {
          return false;
        }

        if (element.tagName === 'MARK') {
          return !element.hasAttribute('data-no-tooltip');
        }

        return Boolean(element.querySelector('mark:not([data-no-tooltip])'));
      });
    });
  }

  private getCleanHtml (): string {
    const clone = this.el.nativeElement.cloneNode(true) as HTMLElement;

    clone
      .querySelectorAll('span[data-has-tooltip], span[data-delete-annotation]')
      .forEach((el) => el.remove());

    clone.querySelectorAll('mark[data-no-tooltip]').forEach((mark) => {
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

  private async syncArticleText (): Promise<void> {
    const cleanHtml = this.getCleanHtml();
    if (cleanHtml === this.lastSavedHtml) {
      return;
    }

    this.lastSavedHtml = cleanHtml;
    const updated: IArticle = {
      ...this.article(),
      text: cleanHtml,
    };

    await firstValueFrom(this.articleService.createOrUpdate(updated));
    this.articleUpdated.emit(updated);
  }
}
