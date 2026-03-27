import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { ArticleService, IArticle } from '../../services';
import { Router, RouterLink } from '@angular/router';
import { Button, PreloaderService, Toolbar } from '../../components';
import { finalize, mergeMap } from 'rxjs';

@Component({
  selector: 'app-list',
  imports: [RouterLink, Toolbar, Button],
  templateUrl: './list.html',
})
export class List implements OnInit {
  articles: IArticle[] = [];
  private router = inject(Router);
  private readonly preloader = inject(PreloaderService);
  private readonly articleService = inject(ArticleService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  initialized = signal(false);

  ngOnInit () {
    this.loadArticles();
  }

  deleteArticle (article: IArticle) {
    if (confirm(`Подтверждаете удаление статьи "${ article.title }"?`)) {
      this.preloader.show();
      const subscription = this.articleService.deleteArticle(article.id).pipe(
        mergeMap(() => this.loadArticles()),
        finalize(() => this.preloader.hide()),
      ).subscribe({
        complete: () => subscription.unsubscribe(),
      });
    }
  }

  goToEdit (id: IArticle['id']) {
    this.router.navigate(['article', id, 'edit']);
  }

  loadArticles () {
    this.preloader.show();
    const result = this.articleService.getList().pipe(
      finalize(() => this.preloader.hide()),
    )

    const subscription = result.subscribe({
      next: (data) => {
        this.articles = data;
        this.changeDetector.markForCheck();
        this.initialized.set(true);
      },
      complete: () => subscription.unsubscribe(),
    });

    return result;
  }
}
