import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Toolbar } from '../toolbar/toolbar';
import { Button } from '../button/button';
import { IArticle } from '../../services';
import { dict } from '../../dictionary';

@Component({
  selector: 'app-article-delete-dialog',
  imports: [Toolbar, Button],
  template: `
    <div class="delete-dialog">
      <h3><strong>{{ dict['DIALOG_ARTICLE_DELETE_TITLE'] }}</strong></h3>
      <p>{{ dict['DIALOG_ARTICLE_DELETE_CONFIRM'] }} «{{ article().title }}»?</p>
      <app-toolbar>
        <div></div>
        <div class="actions">
          <app-button
            title="{{ dict['BTN_CANCEL'] }}"
            theme="light"
            type="button"
            (clickAction)="closeDialog()"
          />
          <app-button
            title="{{ dict['BTN_DELETE'] }}"
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
  readonly dict = dict;
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
