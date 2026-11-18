import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Toolbar } from '../toolbar/toolbar';
import { Button } from '../button/button';
import { IArticle } from '../../services';

@Component({
  selector: 'app-article-delete-dialog',
  imports: [Toolbar, Button],
  template: `
    <div class="delete-dialog">
      <h3><strong>Статья будет удалена</strong></h3>
      <p>Вы подтверждаете удаление статьи «{{ article().title }}»?</p>
      <app-toolbar>
        <div></div>
        <div class="actions">
          <app-button
            title="Отмена"
            theme="light"
            type="button"
            (clickAction)="closeDialog()"
          />
          <app-button
            title="Удалить"
            type="button"
            (clickAction)="confirmDialog()"
          />
        </div>
      </app-toolbar>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleDeleteDialog {
  readonly article = input.required<IArticle>();
  readonly onConfirmDialog = input.required<() => void>();
  readonly okEvent = output<void>();
  readonly cancelEvent = output<void>();

  confirmDialog (): void {
    this.onConfirmDialog()();
    this.okEvent.emit();
  }

  closeDialog (): void {
    this.cancelEvent.emit();
  }
}
