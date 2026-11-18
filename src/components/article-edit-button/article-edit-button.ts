import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { IArticle } from '../../services';
import { Button } from '../button/button';

@Component({
  selector: 'app-article-edit-button',
  imports: [Button],
  template: `
    <app-button
      title="&#9999;"
      type="button"
      hint="Редактировать"
      theme="light"
      (clickAction)="goToEdit()"
    />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleEditButton {
  readonly article = input.required<IArticle>();
  private readonly router = inject(Router);

  goToEdit (): void {
    void this.router.navigate(['/article', this.article().id, 'edit']);
  }
}
