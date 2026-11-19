import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AnnotationButton,
  AnnotationButtonService,
  AnnotationsSidebar,
  AnnotationsSidebarService,
  AnnotationsSidebarToggle,
  ArticleDeleteButton,
  ArticleEditButton,
  Toolbar,
  TooltipContainer,
} from '../../components';
import { ArticleReadonlySync, SafeHtmlWithAnnotationsPipe, SelectionTracker, } from '../../directives';
import { AnnotationsRenderer, AnnotationsService, IArticle, } from '../../services';

@Component({
  selector: 'app-article',
  imports: [
    RouterLink,
    Toolbar,
    ArticleDeleteButton,
    ArticleEditButton,
    TooltipContainer,
    SafeHtmlWithAnnotationsPipe,
    SelectionTracker,
    ArticleReadonlySync,
    AnnotationButton,
    AnnotationsSidebar,
    AnnotationsSidebarToggle,
  ],
  templateUrl: './article.html',
  styleUrl: './article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Article {
  private readonly annotationsRenderer = inject(AnnotationsRenderer);
  private readonly annotationButtonService = inject(AnnotationButtonService);
  private readonly annotationsService = inject(AnnotationsService);
  readonly sidebarService = inject(AnnotationsSidebarService);

  readonly article = input.required<IArticle>();
  readonly currentArticle = linkedSignal(() => this.article());

  constructor () {
    effect(() => {
      const current = this.article();
      this.annotationsService.pruneOrphansForArticle(current.id, current.text);
      this.annotationsRenderer.initData(this.annotationsService.annotations());
    });
  }

  onSelectionDetected (range: Range | null): void {
    this.annotationButtonService.processSelection(range);
  }

  readonly hasAnnotations = computed(() => {
    const currentId = this.currentArticle().id;
    for (const item of this.annotationsService.annotations().values()) {
      const storedArticleId = (item as { articleId?: string }).articleId;
      if (!storedArticleId || storedArticleId === currentId) {
        return true;
      }
    }
    return false;
  });

}
