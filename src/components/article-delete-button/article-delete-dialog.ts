import { ChangeDetectionStrategy, Component, input, OnChanges, output, SimpleChanges } from '@angular/core';
import { Toolbar } from '../toolbar/toolbar';
import { Button } from '../button/button';
import { IArticle } from '../../services';
@Component({
  imports: [Toolbar, Button],
  template: `
      <div class="delete-dialog">
        <h3><strong>Статья будет удалена</strong></h3>
        <p>Вы подтверждаете удаление статьи "{{ article().title }}"?</p>
        <app-toolbar>
          <div></div>
          <div class="actions">
            <app-button
              title="Отмена"
              theme="light"
              type="button"
              (clickAction)="closeDialog()"/>
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
  article = input.required<IArticle>();
  onConfirmDialog = input.required<() => void>();
  okEvent = output<void>();
  cancelEvent = output<void>();

  confirmDialog () {
    this.onConfirmDialog()();
    this.okEvent.emit();
  }

  closeDialog () {
    this.cancelEvent.emit();
  }
}
