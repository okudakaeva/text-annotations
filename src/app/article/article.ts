import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AnnotationButton,
  AnnotationButtonService,
  Navigator,
  NavigatorService,
  NavigatorToggle,
  ArticleDeleteButton,
  ArticleEditButton,
  Toolbar,
  TooltipContainer,
} from '../../components';
import { ArticleReadonlySync, SafeHtmlWithAnnotationsPipe, SelectionTracker, } from '../../directives';
import { AnnotationsRenderer, AnnotationsService, IArticle, } from '../../services';
import { dict } from '../../dictionary';

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
    Navigator,
    NavigatorToggle,
  ],
  templateUrl: './article.html',
  styleUrl: './article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Article {
  readonly dict = dict;
  private readonly annotationsRenderer = inject(AnnotationsRenderer);
  private readonly annotationButtonService = inject(AnnotationButtonService);
  private readonly annotationsService = inject(AnnotationsService);
  readonly sidebarService = inject(NavigatorService);

  readonly article = input.required<IArticle>();
  readonly currentArticle = linkedSignal(() => this.article());

  constructor () {
    effect(() => {
      const depArticle = this.article();

      untracked(() => {
        this.annotationsService.pruneOrphansForArticle(depArticle.id, depArticle.text);
      });
    });

    effect(() => {
      const depAnnotations = this.annotationsService.annotations();

      untracked(() => {
        this.annotationsRenderer.initData(depAnnotations);
      });
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
