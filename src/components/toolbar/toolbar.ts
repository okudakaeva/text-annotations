import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  imports: [],
  template: `
    <aside class="toolbar">
      <ng-content/>
    </aside>`,
  styleUrl: './toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toolbar {}
