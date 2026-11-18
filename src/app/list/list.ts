import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, Observable, take, tap } from 'rxjs';
import { ArticleService, IArticle } from '../../services';
import { ArticleDeleteButton, ArticleEditButton, PreloaderService, Toolbar, } from '../../components';

@Component({
  selector: 'app-list',
  imports: [RouterLink, Toolbar, ArticleDeleteButton, ArticleEditButton],
  templateUrl: './list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class List implements OnInit {
  private readonly preloader = inject(PreloaderService);
  private readonly articleService = inject(ArticleService);

  readonly articles = signal<IArticle[]>([]);
  readonly initialized = signal(false);

  ngOnInit (): void {
    this.loadArticles().subscribe();
  }

  loadArticles (): Observable<IArticle[]> {
    this.preloader.show();
    return this.articleService.getList().pipe(
      take(1),
      tap((data) => {
        this.articles.set(data);
        this.initialized.set(true);
      }),
      finalize(() => this.preloader.hide())
    );
  }
}
