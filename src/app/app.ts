import { Component, inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Preloader, PreloaderService, Tooltip } from '../components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Preloader, Tooltip],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  private readonly preloader = inject(PreloaderService);

  constructor () {
    this.router.events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationStart && !this.preloader.isShown()) {
          this.preloader.show();
        }
        if (event instanceof NavigationEnd && this.preloader.isShown()) {
          this.preloader.hide();
        }
      });
  }
}
