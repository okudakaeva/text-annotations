import { ChangeDetectionStrategy, Component, effect, inject, input, linkedSignal, } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AnnotationButton,
  AnnotationButtonService,
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
  ],
  templateUrl: './article.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Article {
  private readonly annotationsRenderer = inject(AnnotationsRenderer);
  private readonly annotationButtonService = inject(AnnotationButtonService);
  private readonly annotationsService = inject(AnnotationsService);

  readonly article = input.required<IArticle>();
  readonly currentArticle = linkedSignal(() => this.article());

  constructor () {
    effect(() => {
      this.annotationsRenderer.initData(this.annotationsService.annotations());
    });
  }

  onSelectionDetected (range: Range | null): void {
    this.annotationButtonService.processSelection(range);
  }

  onArticleUpdated (updated: IArticle): void {
    this.currentArticle.set(updated);
  }
}
