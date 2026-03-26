import { Component, inject, input, OnChanges, SimpleChanges } from '@angular/core';
import { AnnotationsRenderer, ArticleService, IAnnotationList, IArticle } from '../../services';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Button, PreloaderService, Toolbar } from '../../components';
import { finalize } from 'rxjs';
import { SafeHtmlWithAnnotationsPipe } from '../../directives';

@Component({
  selector: 'app-article',
  imports: [RouterLink, Toolbar, Button, SafeHtmlWithAnnotationsPipe],
  templateUrl: './article.html',
  styleUrl: './article.scss',
})
export class Article implements OnChanges {
  article = input.required<IArticle>();
  annotations = input.required<IAnnotationList>();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articleService = inject(ArticleService);
  private readonly preloader = inject(PreloaderService);
  private readonly annotationsRenderer = inject(AnnotationsRenderer);

  ngOnChanges (changes: SimpleChanges) {
    if (changes['article'] && this.article()) {
      this.annotationsRenderer.initData(this.annotations());
    }
  }

  goToEdit (): void {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  deleteArticle (): void {
    if (confirm('Подтверждаете удаление статьи?')) {
      this.preloader.show();
      this.articleService.deleteArticle(this.article()!.id).pipe(
        finalize(() => this.preloader.hide()),
      ).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
  }
}
