import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { ArticleService, IArticle } from '../../services';
import { Button } from '../button/button';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { DialogService } from '../dialog/dialog.service';
import { PreloaderService } from '../preloader/preloader.service';
import { dict } from '../../dictionary';

@Component({
  selector: 'app-article-delete-button',
  imports: [Button],
  template: `
    <app-button
      title="{{ dict['ICON_TRASH'] }}"
      type="button"
      hint="{{ dict['BTN_DELETE'] }}"
      theme="light"
      (clickAction)="deleteArticle()"
    />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleDeleteButton {
  readonly dict = dict;
  readonly article = input.required<IArticle>();
  readonly returnToHome = input<boolean>(true);
  readonly refreshData = input<() => Observable<unknown>>(() => of(null));

  private readonly preloader = inject(PreloaderService);
  private readonly router = inject(Router);
  private readonly articleService = inject(ArticleService);
  private readonly dialogService = inject(DialogService);

  deleteArticle(): void {
    const current = this.article();

    this.dialogService.open(ConfirmDialog, {
      bindings: {
        title: dict['DIALOG_ARTICLE_DELETE_TITLE'],
        message: `${dict['DIALOG_ARTICLE_DELETE_CONFIRM']}${dict['NBSP']}«${current.title}»?`,
        onConfirm: async () => {
          this.preloader.show();
          try {
            await firstValueFrom(this.articleService.deleteArticle(current.id));
            await firstValueFrom(this.refreshData()());

            if (this.returnToHome()) {
              await this.router.navigate(['/']);
            }
          } finally {
            this.preloader.hide();
          }
        },
      },
    });
  }
}
