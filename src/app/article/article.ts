import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AnnotationButton,
  AnnotationButtonService,
  ArticleDeleteButton,
  ArticleEditButton,
  Toolbar,
  TooltipContainer,
} from '../../components';
import {
  SafeHtmlWithAnnotationsPipe,
  SelectionTracker,
} from '../../directives';
import {
  AnnotationsRenderer,
  IAnnotationList,
  IArticle,
} from '../../services';

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
    AnnotationButton,
  ],
  templateUrl: './article.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Article {
  readonly article = input.required<IArticle>();
  readonly annotations = input<IAnnotationList>(new Map());

  private readonly annotationsRenderer = inject(AnnotationsRenderer);
  private readonly annotationButtonService = inject(AnnotationButtonService);

  constructor() {
    effect(() => {
      this.annotationsRenderer.initData(this.annotations());
    });
  }

  onSelectionDetected(range: Range | null): void {
    this.annotationButtonService.processSelection(range);
  }
}
