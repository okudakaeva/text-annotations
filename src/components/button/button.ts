import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  template: `
    <button class="button {{ theme() }}"
            [attr.type]="type()"
            (click)="onButtonClick($event)"
            [attr.title]="hint()">
      {{ title() }}
    </button>
  `,
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  type = input<string>('submit');
  theme = input<string>('dark');
  title = input.required<string>()
  hint = input<string>('')
  clickAction = output<MouseEvent>();

  onButtonClick (e: MouseEvent): void {
    this.clickAction.emit(e);
  }
}
