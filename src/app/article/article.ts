import { Component, inject, input, OnChanges, SimpleChanges } from '@angular/core';
import { AnnotationsRenderer, IAnnotationList, IArticle } from '../../services';
import { RouterLink } from '@angular/router';
import {
  Toolbar,
  TooltipContainer,
  ArticleDeleteButton,
  ArticleEditButton,
  AnnotationButtonService,
  AnnotationButton
} from '../../components';
import { SafeHtmlWithAnnotationsPipe, SelectionTracker } from '../../directives';

@Component({
  selector: 'app-article',
  imports: [
    RouterLink, Toolbar,
    SafeHtmlWithAnnotationsPipe,
    TooltipContainer,
    ArticleDeleteButton,
    ArticleEditButton,
    SelectionTracker,
    AnnotationButton,
  ],
  templateUrl: './article.html',
})
export class Article implements OnChanges {
  article = input.required<IArticle>();
  annotations = input.required<IAnnotationList>();
  private readonly annotationsRenderer = inject(AnnotationsRenderer);
  private readonly annotationButtonService = inject(AnnotationButtonService);

  ngOnChanges (changes: SimpleChanges) {
    if (changes['article'] && this.article()) {
      this.annotationsRenderer.initData(this.annotations());
    }
  }

  onSelectionDetected (range: Range | null): void {
    this.annotationButtonService.processSelection(range);
  }
}
