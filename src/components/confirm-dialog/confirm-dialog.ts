import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Toolbar } from '../toolbar/toolbar';
import { Button } from '../button/button';
import { dict } from '../../dictionary';

@Component({
  selector: 'app-confirm-dialog',
  imports: [Toolbar, Button],
  template: `
    <div class="confirm-dialog">
      <h3><strong>{{ title() }}</strong></h3>
      <p>{{ message() }}</p>
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
            [title]="confirmText()"
            type="button"
            (clickAction)="confirmDialog()"
          />
        </div>
      </app-toolbar>
    </div>
  `,
  styleUrl: './confirm-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  readonly dict = dict;
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmText = input<string>(dict['BTN_DELETE']);
  readonly onConfirm = input.required<() => Promise<void> | void>();

  readonly okEvent = output<void>();
  readonly cancelEvent = output<void>();

  async confirmDialog(): Promise<void> {
    await this.onConfirm()();
    this.okEvent.emit();
  }

  closeDialog(): void {
    this.cancelEvent.emit();
  }
}
