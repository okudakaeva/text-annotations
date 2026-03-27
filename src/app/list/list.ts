import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { ArticleService, IArticle } from '../../services';
import { RouterLink } from '@angular/router';
import { PreloaderService, Toolbar, ArticleDeleteButton, ArticleEditButton } from '../../components';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-list',
  imports: [
    RouterLink, Toolbar,
    ArticleDeleteButton,
    ArticleEditButton,
  ],
  templateUrl: './list.html',
})
export class List implements OnInit {
  articles: IArticle[] = [];
  private readonly preloader = inject(PreloaderService);
  private readonly articleService = inject(ArticleService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  initialized = signal(false);

  ngOnInit () {
    this.loadArticles();
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
