import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TooltipService } from './tooltip.service';

@Component({
  selector: 'app-tooltip',
  template: `
      <div
              class="tooltip"
              role="tooltip"
              [attr.aria-hidden]="!state().isVisible"
              [class.visible]="state().isVisible"
              [style.left.px]="state().position.x"
              [style.top.px]="state().position.y"
      >
      <span class="tooltip-content">
        {{ state().text || '…' }}
      </span>
          <button
                  type="button"
                  class="edit-button"
                  title="Редактировать подсказку"
                  aria-label="Редактировать подсказку"
                  (click)="onEdit()"
          >✎</button>
          <button
                  type="button"
                  class="edit-button"
                  title="Удалить подсказку"
                  aria-label="Удалить подсказку"
                  (click)="onDelete()"
          >⌧</button>
          @if (state().showCloseButton) {
          <button
            type="button"
            class="close-button"
            aria-label="Закрыть подсказку"
            (click)="onClose()"
          >×</button>
          }
      </div>
  `,
  styleUrl: './tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tooltip {
  private readonly tooltipService = inject(TooltipService);
  readonly state = this.tooltipService.state;

  onEdit (): void {
    void this.tooltipService.editCurrent();
  }

  onDelete (): void {
    void this.tooltipService.deleteCurrent();
  }

  onClose (): void {
    this.tooltipService.hide();
  }
}
