import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
  Type,
} from '@angular/core';
import { DialogContent } from './dialog-content';

@Component({
  selector: 'app-dialog',
  imports: [DialogContent],
  template: `
    <div class="dialog-overlay" role="dialog" aria-modal="true">
      <div class="dialog-window">
        <div class="dialog-content">
          <app-dialog-content
            [dynamicContent]="dynamicContent()"
            [bindings]="bindings()"
            (okEvent)="onOk()"
            (cancelEvent)="onCancel()"
          />
        </div>
      </div>
    </div>
  `,
  styleUrl: './dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dialog {
  readonly dynamicContent = input.required<Type<unknown>>();
  readonly bindings = input<Record<string, unknown>>();
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onCancel();
  }

  onCancel(): void {
    this.closed.emit();
  }

  onOk(): void {
    this.closed.emit();
  }
}
