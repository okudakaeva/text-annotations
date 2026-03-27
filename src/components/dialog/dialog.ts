import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  Type,
} from '@angular/core';
import { DialogContent } from './dialog-content';

@Component({
  selector: 'app-dialog',
  imports: [DialogContent],
  template: `
    <div class="dialog-overlay">
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
  dynamicContent = input.required<Type<any>>();
  bindings = input<{ [key: string]: any }>();
  closed = output<void>();


  onCancel (): void {
    this.closed.emit();
  }

  onOk (): void {
    this.closed.emit();
  }
}
