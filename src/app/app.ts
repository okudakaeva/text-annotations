import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Preloader, PreloaderService, Tooltip, TooltipService } from '../components';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Preloader, Tooltip],
  styleUrl: './app.scss',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly preloader = inject(PreloaderService);
  private readonly tooltipService = inject(TooltipService);

  constructor () {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.tooltipService.hide();
        if (!this.preloader.isShown()) {
          this.preloader.show();
        }
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        if (this.preloader.isShown()) {
          this.preloader.hide();
        }
      }
    });
  }
}
