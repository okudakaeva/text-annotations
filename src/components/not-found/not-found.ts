import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Toolbar } from '../toolbar/toolbar';
import { dict } from '../../dictionary';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Toolbar],
  template: `
    <h1>{{dict['PAGE_NOT_FOUND_TITLE']}}</h1>
    <app-toolbar>
      <a routerLink="/">{{ dict['BTN_BACK_TO_INDEX'] }}</a>
    </app-toolbar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  readonly dict = dict;
}
