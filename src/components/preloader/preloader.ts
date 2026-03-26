import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PreloaderService } from './preloaderService';

@Component({
  selector: 'app-preloader',
  imports: [],
  template: `
    @if (service.isShown()) {
      <div class="container" animate.leave="leaving">
        <div class="preloader">
          <div></div>
          <div></div>
        </div>
      </div>
    }
  `,
  styleUrl: './preloader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Preloader {
  readonly service = inject(PreloaderService);
}
