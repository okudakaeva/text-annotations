import { ChangeDetectionStrategy, Component, computed, inject, input, } from '@angular/core';
import { AnnotationsService, IArticle } from '../../services';
import { AnnotationsSidebarService } from './annotations-sidebar.service';
import { Button } from '../button/button';

@Component({
  selector: 'app-annotations-sidebar-toggle',
  template: `
    <app-button
      type="button"
      class="sidebar-toggle"
      theme="light"
      [class.active]="sidebarService.isOpen()"
      [attr.aria-expanded]="sidebarService.isOpen()"
      [hint]="sidebarService.isOpen() ? 'Скрыть список аннотаций' : 'Показать список аннотаций'"
      title="☰"
      (clickAction)="sidebarService.toggle()"
    />
  `,
  imports: [
    Button,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationsSidebarToggle {
  readonly sidebarService = inject(AnnotationsSidebarService);
  private readonly annotationsService = inject(AnnotationsService);

  readonly articleId = input.required<IArticle['id']>();

  readonly count = computed(() => {
    const currentId = this.articleId();
    let total = 0;

    for (const item of this.annotationsService.annotations().values()) {
      const storedArticleId = (item as { articleId?: string }).articleId;
      if (!storedArticleId || storedArticleId === currentId) {
        total++;
      }
    }

    return total;
  });
}
