import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { AnnotationsRenderer, AnnotationsService, IAnnotation, IArticle, } from '../../services';
import { TooltipService } from '../tooltip/tooltip.service';
import { NavigatorService } from './navigator.service';
import { dict } from '../../dictionary';

export interface IAnnotationSidebarItem extends IAnnotation {
  backgroundColor: string;
  textColor: string;
}

@Component({
  selector: 'app-navigator',
  template: `
    <aside class="navigator" [attr.aria-hidden]="!sidebarService.isOpen() || annotations().length === 0">
      <div class="navigator-inner">
        <h2>{{ dict['SIDEBAR_TITLE'] }} ({{ annotations().length }})</h2>

        @if (annotations().length === 0) {
        <p class="empty-notes">{{ dict['SIDEBAR_EMPTY_TEXT'] }}</p>
        } @else {
        <ul class="navigator-list">
          @for (note of annotations(); track note.id) {
          <li>
            <button
              type="button"
              class="navigator-card"
              [style.background-color]="note.backgroundColor"
              [style.color]="note.textColor"
              (mouseenter)="highlightMarks(note.id, true)"
              (mouseleave)="highlightMarks(note.id, false)"
              (focus)="highlightMarks(note.id, true)"
              (blur)="highlightMarks(note.id, false)"
              (click)="scrollToAnnotation(note.id, $event.currentTarget)"
            ><span class="link">{{ dict['LINK_MARK'] }}</span><span>{{ note.text }}</span></button>
          </li>
        }
        </ul>
        }
      </div>
    </aside>
  `,
  styleUrl: './navigator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navigator {
  readonly dict = dict;
  readonly sidebarService = inject(NavigatorService);
  private readonly annotationsService = inject(AnnotationsService);
  private readonly annotationsRenderer = inject(AnnotationsRenderer);
  private readonly tooltipService = inject(TooltipService);
  private readonly destroyRef = inject(DestroyRef);

  readonly articleId = input.required<IArticle['id']>();
  readonly container = input<HTMLElement | null>(null);
  private readonly domTick = signal(0);

  constructor () {
    afterNextRender(() => {
      this.domTick.update((v) => v + 1);

      const root = this.container() ?? document.body;
      const observer = new MutationObserver(() => {
        this.domTick.update((v) => v + 1);
      });

      observer.observe(root, { childList: true, subtree: true });
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  readonly annotations = computed<IAnnotationSidebarItem[]>(() => {
    this.domTick();
    const currentArticleId = this.articleId();
    const map = this.annotationsService.annotations();

    const root = this.container() ?? document;
    const orderMap = new Map<string, number>();

    root.querySelectorAll<HTMLElement>(dict['MARK_ANY_SELECTOR']).forEach((mark) => {
      const id = mark.getAttribute(dict['ATTR_ANNOTATION_ID']);
      if (id && !orderMap.has(id)) {
        orderMap.set(id, orderMap.size);
      }
    });

    return Array.from(map.values())
      .filter((item) => {
        const storedArticleId = (item as IAnnotation & { articleId?: string }).articleId;
        const belongsToArticle = !storedArticleId || storedArticleId === currentArticleId;
        return belongsToArticle && orderMap.has(item.id);
      })
      .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
      .map((item) => {
        const rawBg = item.color || dict['ANNOTATION_COLOR'];
        return {
          ...item,
          backgroundColor: `color-mix(in srgb, ${ rawBg } 50%, transparent)`,
          textColor: this.annotationsRenderer.getContrastTextColor(rawBg),
        };
      });
  });

  highlightMarks (annotationId: string, isHovered: boolean): void {
    this.getMarks(annotationId).forEach((mark) =>
      mark.classList.toggle(dict['ANNOTATION_HOVER_CLASS'], isHovered)
    );
  }

  scrollToAnnotation (annotationId: string, triggerTarget?: EventTarget | null): void {
    if (triggerTarget instanceof HTMLElement) {
      this.scrollSidebarListByStep(triggerTarget);
    }

    const marks = this.getMarks(annotationId);
    if (marks.length === 0) {
      return;
    }

    const firstMark = marks[0];
    const lastMark = marks[marks.length - 1];

    firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });

    marks.forEach((mark) => mark.classList.add(dict['ANNOTATION_HOVER_CLASS']));
    setTimeout(() => {
      marks.forEach((mark) => mark.classList.remove(dict['ANNOTATION_HOVER_CLASS']));
    }, dict['ANNOTATION_HIGHLIGHT_DELAY']);

    this.waitForScrollEnd().then(() => {
      void this.tooltipService.showTooltip(
        annotationId,
        lastMark,
        lastMark.getBoundingClientRect()
      );
    });
  }

  private scrollSidebarListByStep (cardButton: HTMLElement): void {
    const listEl = cardButton.closest<HTMLElement>('.navigator-list');
    const itemEl = cardButton.closest<HTMLElement>('li');
    if (!listEl || !itemEl) {
      return;
    }

    const listRect = listEl.getBoundingClientRect();
    const itemRect = itemEl.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(listEl).rowGap || '8') || 8;
    const step = itemRect.height + gap;

    const distanceFromTop = itemRect.top - listRect.top;
    const distanceFromBottom = listRect.bottom - itemRect.bottom;
    const edgeThreshold = step * 2.5;

    if (distanceFromBottom < edgeThreshold && listEl.scrollTop + listEl.clientHeight < listEl.scrollHeight - 1) {
      this.smoothScrollBy(listEl, step, 160);
    } else if (distanceFromTop < edgeThreshold && listEl.scrollTop > 1) {
      this.smoothScrollBy(listEl, -step, 160);
    }
  }

  private smoothScrollBy (element: HTMLElement, deltaY: number, durationMs = dict['SIDEBAR_SCROLL_DURATION']): void {
    const startTop = element.scrollTop;
    const startTime = performance.now();

    const stepFrame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      element.scrollTop = startTop + deltaY * eased;

      if (progress < 1) {
        requestAnimationFrame(stepFrame);
      }
    };

    requestAnimationFrame(stepFrame);
  }

  private getMarks (annotationId: string): NodeListOf<HTMLElement> {
    const root = this.container() ?? document;
    return root.querySelectorAll<HTMLElement>(`${ dict['MARK_TAG'] }[${ dict['ATTR_ANNOTATION_ID'] }="${ annotationId }"]`);
  }

  private waitForScrollEnd (): Promise<void> {
    return new Promise((resolve) => {
      let timer: ReturnType<typeof setTimeout>;

      const onScroll = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          window.removeEventListener('scroll', onScroll, true);
          resolve();
        }, dict['SIDEBAR_SCROLL_END_DEBOUNCE']);
      };

      window.addEventListener('scroll', onScroll, true);
      timer = setTimeout(() => {
        window.removeEventListener('scroll', onScroll, true);
        resolve();
      }, dict['SIDEBAR_SCROLL_END_DEBOUNCE'] + 20);
    });
  }
}
