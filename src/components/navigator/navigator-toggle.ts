import { ChangeDetectionStrategy, Component, computed, inject, input, } from '@angular/core';
import { AnnotationsService, IArticle } from '../../services';
import { NavigatorService } from './navigator.service';
import { Button } from '../button/button';
import { dict } from '../../dictionary';

@Component({
  selector: 'app-navigator-toggle',
  template: `
    @if (count() > 0) {
    <app-button
      type="button"
      class="sidebar-toggle"
      theme="light"
      [class.active]="sidebarService.isOpen()"
      [attr.aria-expanded]="sidebarService.isOpen()"
      [hint]="sidebarService.isOpen() ? dict['SIDEBAR_TOGGLE_HIDE'] : dict['SIDEBAR_TOGGLE_SHOW']"
      title="{{ dict['ICON_TOGGLE'] }}"
      (clickAction)="sidebarService.toggle()"
    />
    }
  `,
  imports: [
    Button,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigatorToggle {
  readonly dict = dict;
  readonly sidebarService = inject(NavigatorService);
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
