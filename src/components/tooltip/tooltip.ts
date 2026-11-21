import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TooltipService } from './tooltip.service';
import { dict } from '../../dictionary';

@Component({
  selector: 'app-tooltip',
  template: `
      <div
              class="tooltip"
              role="tooltip"
              [attr.aria-hidden]="!state().isVisible"
              [class.visible]="state().isVisible"
              [class.multiline]="state().isMultiline"
              [style.left.px]="state().position.x"
              [style.top.px]="state().position.y"
      >
        <span class="tooltip-content">{{ state().text || '…' }}</span>
        &nbsp;
        <button
                type="button"
                class="edit-button"
                title="{{ dict['EDIT_ANNOTATION_HINT'] }}"
                aria-label="{{ dict['EDIT_ANNOTATION_HINT'] }}"
                (click)="onEdit()"
        >{{ dict['ICON_EDIT'] }}</button>
        <button
                type="button"
                class="delete-button"
                title="{{ dict['DELETE_ANNOTATION_HINT'] }}"
                aria-label="{{ dict['DELETE_ANNOTATION_HINT'] }}"
                (click)="onDelete()"
        >{{ dict['ICON_DELETE'] }}</button>
        @if (state().showCloseButton) {
        <button
                type="button"
                class="close-button"
                title="{{ dict['BTN_CLOSE'] }}"
                aria-label="{{ dict['BTN_CLOSE'] }}"
                (click)="onClose()"
        >{{ dict['ICON_CLOSE'] }}</button>
        }
      </div>
  `,
  styleUrl: './tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tooltip {
  readonly dict = dict;
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
