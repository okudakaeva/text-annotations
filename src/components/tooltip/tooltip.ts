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
        <span class="tooltip-content">{{ state().text || '…' }}</span>
        &nbsp;
        <button
                type="button"
                class="edit-button"
                title="Редактировать аннотацию"
                aria-label="Редактировать аннотацию"
                (click)="onEdit()"
        >✎</button>
        <button
                type="button"
                class="delete-button"
                title="Удалить аннотацию"
                aria-label="Удалить аннотацию"
                (click)="onDelete()"
        >⌧</button>
        @if (state().showCloseButton) {
        <button
          type="button"
          class="close-button"
          title="Закрыть аннотацию"
          aria-label="Закрыть аннотацию"
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
