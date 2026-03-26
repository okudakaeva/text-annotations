import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Toolbar } from '../index';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Toolbar],
  template: `<h1>Страница не найдена</h1>
  <app-toolbar><a routerLink="/">Вернуться на главную</a></app-toolbar>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
