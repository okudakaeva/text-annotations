import { Component, inject, input } from '@angular/core';
import { ArticleService, IArticle } from '../../services';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Button, PreloaderService, Toolbar } from '../../components';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-article',
  imports: [RouterLink, Toolbar, Button],
  templateUrl: './article.html',
  styleUrl: './article.scss',
})
export class Article {
  article = input.required<IArticle>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articleService = inject(ArticleService);
  private readonly preloader = inject(PreloaderService);


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
