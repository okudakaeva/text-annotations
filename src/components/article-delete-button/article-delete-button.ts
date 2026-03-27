import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ArticleService, IArticle } from '../../services';
import { finalize, mergeMap, of } from 'rxjs';
import { ArticleDeleteDialog, Button, DialogService, PreloaderService } from '../index';
import { Router } from '@angular/router';

@Component({
  selector: 'app-article-delete-button',
  imports: [Button],
  template: `<app-button
    title="&#128465;"
    type="button"
    hint="Удалить"
    theme="light"
    (clickAction)="deleteArticle()"/>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleDeleteButton {
  article = input.required<IArticle>();
  returnToHome = input<boolean>(true);
  refreshData = input(() => of({}))
  private readonly preloader = inject(PreloaderService);
  private readonly router = inject(Router);
  private readonly articleService = inject(ArticleService);
  private readonly dialogService = inject(DialogService);
  deleteArticle () {
    this.dialogService.open(ArticleDeleteDialog, {
      article: this.article(),
      onConfirmDialog: () => {
        this.preloader.show();
        const subscription = this.articleService.deleteArticle(this.article().id).pipe(
          mergeMap(this.refreshData()),
          finalize(() => this.preloader.hide()),
        ).subscribe({
          next: () => this.returnToHome() && this.router.navigate(['/']),
          complete: () => subscription.unsubscribe(),
        });
      },
    });
  }
}
