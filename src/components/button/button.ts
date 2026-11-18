import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <button
      class="button"
      [class.light]="theme() === 'light'"
      [attr.type]="type()"
      [disabled]="disabled()"
      [attr.title]="hint() || null"
      [attr.aria-label]="hint() || title()"
      (click)="onButtonClick($event)"
    >
      {{ title() }}
    </button>
  `,
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  readonly type = input<'button' | 'submit' | 'reset'>('submit');
  readonly theme = input<'dark' | 'light'>('dark');
  readonly title = input.required<string>();
  readonly hint = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly clickAction = output<MouseEvent>();

  onButtonClick(e: MouseEvent): void {
    if (!this.disabled()) {
      this.clickAction.emit(e);
    }
  }
}
