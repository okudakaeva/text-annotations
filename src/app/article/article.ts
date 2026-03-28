import { Component, inject, input, OnChanges, SimpleChanges } from '@angular/core';
import { AnnotationsRenderer, IAnnotationList, IArticle } from '../../services';
import { RouterLink } from '@angular/router';
import { Toolbar, TooltipContainer, ArticleDeleteButton, ArticleEditButton } from '../../components';
import { SafeHtmlWithAnnotationsPipe } from '../../directives';

@Component({
  selector: 'app-article',
  imports: [
    RouterLink, Toolbar,
    SafeHtmlWithAnnotationsPipe,
    TooltipContainer,
    ArticleDeleteButton,
    ArticleEditButton,
  ],
  templateUrl: './article.html',
})
export class Article implements OnChanges {
  article = input.required<IArticle>();
  annotations = input.required<IAnnotationList>();
  private readonly annotationsRenderer = inject(AnnotationsRenderer);

  ngOnChanges (changes: SimpleChanges) {
    if (changes['article'] && this.article()) {
      this.annotationsRenderer.initData(this.annotations());
    }
  }
}
